import { execFileSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const args = new Set(process.argv.slice(2));
const send = args.has("--send");
const studentId = process.env.STUDENT_ID || "polina";
const before = process.env.BEFORE_SHA || process.env.GITHUB_EVENT_BEFORE || "";
const after = process.env.AFTER_SHA || process.env.GITHUB_SHA || "HEAD";

function changedFiles() {
  try {
    const range = before && !/^0+$/.test(before) ? `${before}..${after}` : `${after}^..${after}`;
    return execFileSync("git", ["diff", "--name-only", "--diff-filter=AM", range], { encoding: "utf8" })
      .split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

async function materialFromFile(file) {
  const lesson = file.match(/^data\/lessons\/(lesson-\d+)\.json$/);
  const grammar = file.match(/^data\/grammar\/(grammar-\d+)\.json$/);
  if (!lesson && !grammar) return null;
  const raw = await fs.readFile(path.join(root, file), "utf8");
  const data = JSON.parse(raw);
  if (data.status === "draft") return null;
  const materialType = lesson ? "homework" : "grammar";
  return {
    action: "material_published",
    studentId,
    materialType,
    materialId: data.id,
    notificationVersion: Number(data.notificationVersion || 1),
    payload: {
      title: data.title,
      subtitle: data.subtitle || "",
      publishedAt: data.publishedAt || null,
      url: process.env.SITE_BASE_URL ? `${process.env.SITE_BASE_URL.replace(/\/$/, "")}/${lesson ? `lesson.html?id=${encodeURIComponent(data.id)}` : `grammar-topic.html?id=${encodeURIComponent(data.id)}`}` : null
    }
  };
}

const notifications = (await Promise.all(changedFiles().map(materialFromFile))).filter(Boolean);

if (!send) {
  process.stdout.write(`${JSON.stringify(notifications, null, 2)}\n`);
  process.exit(0);
}

const projectId = process.env.SUPABASE_PROJECT_ID;
const secret = process.env.NOTIFY_WEBHOOK_SECRET;
if (!projectId || !secret) throw new Error("SUPABASE_PROJECT_ID and NOTIFY_WEBHOOK_SECRET are required");
const endpoint = `https://${projectId}.supabase.co/functions/v1/notify-telegram`;

for (const body of notifications) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json", "x-notify-secret": secret },
    body: JSON.stringify(body)
  });
  const text = await response.text();
  if (!response.ok) throw new Error(`Notification failed for ${body.materialId}: ${response.status} ${text}`);
  console.log(`Notification handled for ${body.materialType}:${body.materialId} — ${text}`);
}

if (!notifications.length) console.log("No publishable materials changed.");
