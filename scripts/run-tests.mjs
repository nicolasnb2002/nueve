#!/usr/bin/env node
// Runs the test suite on any Node >= 20: expands the test globs itself (Node 20's
// `--test` does not glob) and loads TypeScript tests with native type stripping
// when available (Node >= 22.6), otherwise through jiti.
import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join, relative } from "node:path";

const root = join(import.meta.dirname, "..");
const walk = (dir, re) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name), re) : re.test(e.name) ? [join(dir, e.name)] : [],
  );
const rel = (files) => files.map((f) => relative(root, f)).sort();

const [major, minor] = process.versions.node.split(".").map(Number);
const strip = major > 22 || (major === 22 && minor >= 6);

const runs = [
  [[], rel(walk(join(root, "scripts"), /\.test\.mjs$/))],
  [strip ? ["--experimental-strip-types"] : ["--import", "jiti/register"], rel(walk(join(root, "src"), /\.test\.ts$/))],
];
let status = 0;
for (const [flags, files] of runs) {
  if (!files.length) continue;
  const r = spawnSync(process.execPath, [...flags, "--test", ...files], { cwd: root, stdio: "inherit" });
  if (r.status !== 0) status = r.status ?? 1;
}
process.exit(status);
