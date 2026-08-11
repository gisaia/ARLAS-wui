const fs = require("node:fs");
const { spawnSync } = require("node:child_process");

// List of directories containing package-specific patch files.
const patchDirs = [
  "node_modules/arlas-web-core/patches",
  "node_modules/arlas-d3/patches",
  "node_modules/arlas-map/patches",
  "node_modules/arlas-maplibre/patches",
];

for (const patchDir of patchDirs) {
  // Skip patch directories that are not available, for example when
  // dependencies are installed with workspaces disabled.
  if (!fs.existsSync(patchDir)) {
    console.log(`Skipping missing patch directory: ${patchDir}`);
    continue;
  }

  console.log(`Applying patches from ${patchDir}`);

  // Use the Windows executable on Windows and the regular command
  // on Linux and macOS.
  const result = spawnSync(
    process.platform === "win32" ? "patch-package.cmd" : "patch-package",
    ["--patch-dir", patchDir],
    {
      // Forward the command output to the current process.
      stdio: "inherit",
    }
  );

  // Stop the postinstall process if applying the patches fails.
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}