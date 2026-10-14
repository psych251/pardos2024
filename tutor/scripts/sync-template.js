// Copies the Psych 251 template's data-saving files from the repository root into
// public/template/, so the OATutor build uses exactly the same firebase-config.js, Firebase
// bundle and DataSaver as the template. Runs automatically before `npm start` and `npm run build`.
const fs = require("fs");
const path = require("path");

const repoRoot = path.join(__dirname, "..", "..");
const outDir = path.join(__dirname, "..", "public", "template");
const files = {
  "firebase-config.js": path.join(repoRoot, "firebase-config.js"),
  "firebase-bundle.js": path.join(repoRoot, "lib", "firebase-bundle.js"),
  "save.js": path.join(repoRoot, "src", "save.js"),
};

fs.mkdirSync(outDir, { recursive: true });
for (const [name, src] of Object.entries(files)) {
  if (!fs.existsSync(src)) {
    console.error(`sync-template: missing ${path.relative(repoRoot, src)} (is tutor/ inside the template repository?)`);
    process.exit(1);
  }
  fs.copyFileSync(src, path.join(outDir, name));
}
console.log("sync-template: copied firebase-config.js, lib/firebase-bundle.js, src/save.js into public/template/");
