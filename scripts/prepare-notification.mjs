import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()

function requiredEnv(name) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing environment variable: ${name}`)
  return value
}

function loadLessons() {
  const lessonsDir = path.join(root, 'data', 'lessons')
  if (!fs.existsSync(lessonsDir)) return []

  return fs.readdirSync(lessonsDir)
    .filter((filename) => /^lesson-\d+\.json$/i.test(filename))
    .map((filename) => {
      const source = fs.readFileSync(path.join(lessonsDir, filename), 'utf8')
      return JSON.parse(source)
    })
    .sort((left, right) => Number(left.number || 0) - Number(right.number || 0))
}

function pageUrl(baseUrl, lessonId) {
  return new URL(`lesson.html?id=${encodeURIComponent(lessonId)}`, `${baseUrl}/`).toString()
}

function isPublished(lesson) {
  if (!['available', 'published'].includes(String(lesson.status || '').toLowerCase())) return false
  if (lesson.notification?.enabled === false) return false
  if (!lesson.publishedAt) return true

  const published = new Date(lesson.publishedAt)
  return Number.isFinite(published.getTime()) && published.getTime() <= Date.now()
}

function notificationVersion(lesson) {
  const version = Number(lesson.notification?.version ?? lesson.notificationVersion ?? 1)
  return Number.isInteger(version) && version > 0 ? version : 1
}

const siteBaseUrl = requiredEnv('SITE_BASE_URL').replace(/\/+$/, '')
const studentId = requiredEnv('STUDENT_ID')
const projectId = requiredEnv('SUPABASE_PROJECT_ID')
const notifySecret = requiredEnv('NOTIFY_WEBHOOK_SECRET')
const selectedLessonId = process.env.LESSON_ID?.trim() || ''

const lessons = loadLessons().filter((lesson) => {
  if (selectedLessonId && lesson.id !== selectedLessonId) return false
  return isPublished(lesson)
})

if (selectedLessonId && lessons.length === 0) {
  throw new Error(`Lesson ${selectedLessonId} was not found or is not published`)
}

if (lessons.length === 0) {
  console.log('No eligible lessons. Nothing to notify.')
  process.exit(0)
}

const endpoint = process.env.NOTIFY_ENDPOINT?.trim()
  || `https://${projectId}.supabase.co/functions/v1/notify-telegram`
let failures = 0

for (const lesson of lessons) {
  const payload = {
    action: 'material_published',
    studentId,
    materialType: 'homework',
    materialId: lesson.id,
    notificationVersion: notificationVersion(lesson),
    payload: {
      title: lesson.title || 'Homework',
      subtitle: lesson.subtitle || '',
      publishedAt: lesson.publishedAt || null,
      url: pageUrl(siteBaseUrl, lesson.id),
    },
  }

  console.log(`Sending notification for ${lesson.id}...`)
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-notify-secret': notifySecret,
    },
    body: JSON.stringify(payload),
  })

  const result = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
  if (!response.ok || !result.ok) {
    failures += 1
    console.error(`Failed ${lesson.id}:`, result)
  } else if (result.alreadySent || result.skipped) {
    console.log(`Skipped ${lesson.id}: already sent`)
  } else {
    console.log(`Sent ${lesson.id}.`)
  }
}

if (failures > 0) {
  process.exitCode = 1
}
