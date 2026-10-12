import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const [version, ...publishArgs] = process.argv.slice(2);
const manifestPath = new URL("../package.json", import.meta.url);
const original = readFileSync(manifestPath, "utf8");
const manifest = JSON.parse(original);

if (/^(.+)-fork\.\d+$/.exec(version ?? "")?.[1] !== manifest.version) {
  throw new Error(`${version} is not ${manifest.version}-fork.N`);
}

const forkManifest = {
  ...manifest,
  name: "@pattobrien/effect-inngest",
  version,
  repository: { type: "git", url: "https://github.com/pattobrien/effect-inngest.git" },
  publishConfig: { ...manifest.publishConfig, registry: "https://npm.pkg.github.com" },
};

writeFileSync(manifestPath, `${JSON.stringify(forkManifest, null, 2)}\n`);
try {
  execFileSync("pnpm", ["publish", "--no-git-checks", "--access", "restricted", ...publishArgs], { stdio: "inherit" });
} finally {
  writeFileSync(manifestPath, original);
}
