import { execFile } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const ROOT = path.resolve(process.cwd(), "skills");

export function skillDirectory(slug: string) {
  if (!/^[a-z0-9-]+$/.test(slug)) return null;
  const dir = path.resolve(ROOT, slug);
  if (!dir.startsWith(`${ROOT}${path.sep}`)) return null;
  try {
    if (!statSync(/* turbopackIgnore: true */ dir).isDirectory()) return null;
  } catch {
    return null;
  }
  return dir;
}

export function listSkillFiles(slug: string) {
  const dir = skillDirectory(slug);
  if (!dir) return [];
  return readdirSync(/* turbopackIgnore: true */ dir)
    .filter((name) => statSync(/* turbopackIgnore: true */ path.join(/* turbopackIgnore: true */ dir, name)).isFile())
    .sort((a, b) => (a === "SKILL.md" ? -1 : b === "SKILL.md" ? 1 : a.localeCompare(b)));
}

export function readSkillFile(slug: string, name: string) {
  if (!/^[A-Za-z0-9._-]+$/.test(name) || name.includes("..")) return null;
  const dir = skillDirectory(slug);
  if (!dir) return null;
  const file = path.resolve(dir, name);
  if (!file.startsWith(`${dir}${path.sep}`)) return null;
  try {
    return readFileSync(/* turbopackIgnore: true */ file, "utf8");
  } catch {
    return null;
  }
}

export async function zipSkillFolder(slug: string) {
  const dir = skillDirectory(slug);
  if (!dir) return null;
  const { stdout } = await execFileAsync("zip", ["-r", "-", ".", "-x", "*.DS_Store"], {
    cwd: dir,
    encoding: "buffer",
    maxBuffer: 8_000_000,
  });
  return stdout;
}
