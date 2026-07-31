import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'

const root = process.cwd()

function requiredEnv(name) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing environment variable: ${name}`)
  return value
}

function normaliseBaseUrl(value) {
  const raw = String(value || '').trim().replace(/\/+$/, '')
  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`
  let parsed
  try {
    parsed = new URL(candidate)
  } catch {
    throw new Error('SITE_BASE_URL must be a valid public http(s) URL')
  }
  if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) {
    throw new Error('SITE_BASE_URL must be a valid public http(s) URL')
  }
  return parsed.toString().replace(/\/+$/, '')
}

function loadWindowArray(relativePath, globalName) {
  const absolutePath = path.join(root, relativePath)
  if (!fs.existsSync(absolutePath)) return []

  const source = fs.readFileSync(absolutePath, 'utf8')
  const sandbox = { window: {} }
  vm.createContext(sandbox)
  vm.runInContext(source, sandbox, { filename: relativePath, timeout: 2000 })
  const data = sandbox.window[globalName]
  return Array.isArray(data) ? data : []
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

function pageUrl(baseUrl, page, fallback) {
  const target = typeof page === 'string' && page.trim() ? page.trim() : fallback
  const url = new URL(target, `${baseUrl}/`)
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error(`Invalid page URL: ${target}`)
  return url.toString()
}

function isPublished(lesson) {
  const status = String(lesson.status || '').toLowerCase()
  if (!['available', 'published'].includes(status)) return false
  return lesson.notification?.enabled !== false
}

const siteBaseUrl = normaliseBaseUrl(requiredEnv('SITE_BASE_URL'))
const studentId = requiredEnv('STUDENT_ID')
const projectId = requiredEnv('SUPABASE_PROJECT_ID')
const notifySecret = requiredEnv('NOTIFY_WEBHOOK_SECRET')
const selectedLessonId = requiredEnv('LESSON_ID')

// The live site stores vocabulary in the root file. The data/ path is kept as a
// compatibility fallback for older copies of the project.
const vocabularyData = [
  ...loadWindowArray('vocabulary-data.js', 'VOCABULARY_DATA'),
  ...loadWindowArray('data/vocabulary-data.js', 'VOCABULARY_DATA'),
]
const grammarData = loadWindowArray('data/grammar-data.js', 'GRAMMAR_DATA')
const lessons = loadLessons().filter((lesson) => {
  if (lesson.id !== selectedLessonId) return false
  return isPublished(lesson)
})

if (lessons.length === 0) {
  throw new Error(`Lesson ${selectedLessonId} was not found or is not published`)
}

const endpoint = process.env.NOTIFY_ENDPOINT?.trim()
  || `https://${projectId}.supabase.co/functions/v1/notify-telegram`
let failures = 0

for (const lesson of lessons) {
  const vocabulary = vocabularyData.find((topic) => topic?.linkedLessonId === lesson.id)
  const validVocabulary = vocabulary && Array.isArray(vocabulary.words) && vocabulary.words.length > 0
    ? {
        id: String(vocabulary.id || ''),
        title: String(vocabulary.title || 'Lesson vocabulary'),
        wordCount: vocabulary.words.length,
        url: pageUrl(
          siteBaseUrl,
          vocabulary.page,
          `vocabulary.html?topic=${encodeURIComponent(vocabulary.id)}`,
        ),
      }
    : null

  const explicitGrammarIds = Array.isArray(lesson.grammarIds) ? lesson.grammarIds : []
  const grammarTopics = grammarData
    .filter((topic) => ['available', 'published'].includes(String(topic?.status || '').toLowerCase()))
    .filter((topic) => explicitGrammarIds.includes(topic.id) || topic.linkedLessonId === lesson.id)
    .map((topic) => ({
      id: String(topic.id || ''),
      title: String(topic.title || 'Grammar'),
      url: pageUrl(
        siteBaseUrl,
        topic.page,
        `grammar-topic.html?id=${encodeURIComponent(topic.id)}`,
      ),
    }))

  const homework = {
    id: lesson.id,
    title: lesson.title || 'Homework',
    subtitle: lesson.subtitle || '',
    url: pageUrl(
      siteBaseUrl,
      lesson.page,
      `lesson.html?id=${encodeURIComponent(lesson.id)}`,
    ),
  }

  // Send the bundle format expected by the current Edge Function. The nested
  // legacy payload is retained so an older deployed function can still send it.
  const payload = {
    action: 'material_published',
    studentId,
    materialType: 'lesson_bundle',
    materialId: lesson.id,
    // One notification is allowed for each lesson. The server ignores later
    // attempts after the first successful delivery.
    notificationVersion: 1,
    homework,
    vocabulary: validVocabulary,
    grammar: grammarTopics,
    payload: {
      title: homework.title,
      subtitle: homework.subtitle,
      url: homework.url,
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
    console.log(`Skipped ${lesson.id}: ${result.reason || 'already sent'}`)
  } else {
    console.log(`Sent ${lesson.id}${result.telegramMessageId ? `; Telegram message id: ${result.telegramMessageId}` : '.'}`)
  }
}

if (failures > 0) {
  process.exitCode = 1
}
