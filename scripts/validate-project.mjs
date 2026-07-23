import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const failures = [];
const required = [
  "index.html", "homework.html", "lesson.html", "grammar.html", "grammar-topic.html",
  "vocabulary-hub.html", "vocabulary.html", "config.js", "app.js", "styles.css", "data/grammar-data.js",
  "supabase/schema.sql", "supabase/verify.sql", "supabase/functions/notify-telegram/index.ts"
];

for (const file of required) {
  try { await fs.access(path.join(root, file)); } catch { failures.push(`Missing required file: ${file}`); }
}

for (const javascriptFile of ["app.js", "data/grammar-data.js"]) {
  try { execFileSync(process.execPath, ["--check", path.join(root, javascriptFile)], { stdio: "pipe" }); }
  catch (error) { failures.push(`${javascriptFile} syntax error: ${error.stderr?.toString() || error.message}`); }
}

async function walk(folder) {
  const entries = await fs.readdir(folder, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(folder, entry.name);
    if (entry.isDirectory() && ![".git"].includes(entry.name)) files.push(...await walk(full));
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

const files = await walk(root);
for (const file of files.filter((item) => item.endsWith(".json"))) {
  try { JSON.parse(await fs.readFile(file, "utf8")); }
  catch (error) { failures.push(`Invalid JSON: ${path.relative(root, file)} — ${error.message}`); }
}

const forbiddenFiles = ["login.html"];
for (const file of forbiddenFiles) {
  if (files.some((item) => path.relative(root, item) === file)) failures.push(`Forbidden file exists: ${file}`);
}

const clientFiles = files.filter((file) => {
  const relative = path.relative(root, file);
  return /^(?:[^/]+\.html|app\.js|config(?:\.example)?\.js|styles\.css)$/.test(relative.replaceAll("\\", "/"));
});
const forbiddenClientPatterns = ["sign" + "InWithPassword", "auth." + "uid()", "user" + "_id", "TELEGRAM_" + "BOT_TOKEN", "SUPABASE_" + "SERVICE_ROLE_KEY"];
for (const file of clientFiles) {
  const content = await fs.readFile(file, "utf8");
  for (const pattern of forbiddenClientPatterns) {
    if (content.includes(pattern)) failures.push(`Forbidden client pattern "${pattern}" in ${path.relative(root, file)}`);
  }
}

if (failures.length) {
  console.error(failures.map((item) => `✗ ${item}`).join("\n"));
  process.exit(1);
}
console.log(`✓ Project validation passed (${files.length} files checked)`);
