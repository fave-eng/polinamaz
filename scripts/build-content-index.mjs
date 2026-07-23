import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = path.resolve(process.cwd());

async function readJson(file) {
  const raw = await fs.readFile(file, "utf8");
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid JSON in ${path.relative(root, file)}: ${error.message}`);
  }
}

function assertBase(item, file, expectedPrefix) {
  const relative = path.relative(root, file);
  if (!item || typeof item !== "object" || Array.isArray(item)) throw new Error(`${relative}: root must be an object`);
  if (!String(item.id || "").startsWith(expectedPrefix)) throw new Error(`${relative}: id must start with ${expectedPrefix}`);
  if (!Number.isInteger(Number(item.number)) || Number(item.number) < 0) throw new Error(`${relative}: number must be a non-negative integer`);
  if (!String(item.title || "").trim()) throw new Error(`${relative}: title is required`);
  if (!String(item.status || "").trim()) throw new Error(`${relative}: status is required`);
}

async function buildFolder({ folder, prefix, output, rootKey }) {
  const fullFolder = path.join(root, folder);
  await fs.mkdir(fullFolder, { recursive: true });
  const filenames = (await fs.readdir(fullFolder))
    .filter((name) => new RegExp(`^${prefix}-\\d+\\.json$`).test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const items = [];
  const numbers = new Set();
  const ids = new Set();

  for (const filename of filenames) {
    const file = path.join(fullFolder, filename);
    const item = await readJson(file);
    assertBase(item, file, `${prefix}-`);
    if (item.status === "draft" || item.id === `${prefix}-template`) continue;
    if (numbers.has(Number(item.number))) throw new Error(`${folder}: duplicate number ${item.number}`);
    if (ids.has(item.id)) throw new Error(`${folder}: duplicate id ${item.id}`);
    numbers.add(Number(item.number));
    ids.add(item.id);

    if (prefix === "lesson") {
      if (!Array.isArray(item.blocks)) throw new Error(`${path.relative(root, file)}: blocks must be an array`);
      if (item.vocabulary && !Array.isArray(item.vocabulary.words)) throw new Error(`${path.relative(root, file)}: vocabulary.words must be an array`);
    }
    if (prefix === "grammar" && item.exercises && !Array.isArray(item.exercises)) {
      throw new Error(`${path.relative(root, file)}: exercises must be an array`);
    }

    items.push({
      id: item.id,
      number: Number(item.number),
      title: item.title,
      subtitle: item.subtitle || "",
      status: item.status,
      publishedAt: item.publishedAt || null,
      ...(prefix === "lesson" ? { hasVocabulary: Boolean(item.vocabulary?.words?.length) } : { level: item.level || null })
    });
  }

  items.sort((a, b) => a.number - b.number || a.id.localeCompare(b.id));
  const payload = { generatedAt: new Date().toISOString(), [rootKey]: items };
  await fs.writeFile(path.join(root, output), `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Built ${output}: ${items.length} published item(s)`);
}

await buildFolder({ folder: "data/lessons", prefix: "lesson", output: "data/lessons/index.json", rootKey: "lessons" });
