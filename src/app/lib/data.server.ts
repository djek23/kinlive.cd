import fs from "node:fs";
import path from "node:path";

const directory = path.join(process.cwd(), "data");

export function ensureDataFile(name: string, initial: unknown = []) {
  fs.mkdirSync(directory, { recursive: true });
  const file = path.join(directory, name);
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(initial, null, 2), "utf8");
  return file;
}

export function readJson<T>(name: string, initial: T): T {
  const file = ensureDataFile(name, initial);
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function writeJson(name: string, value: unknown) {
  const file = ensureDataFile(name, []);
  fs.writeFileSync(file, JSON.stringify(value, null, 2), "utf8");
}
