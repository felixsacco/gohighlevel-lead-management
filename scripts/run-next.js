/**
 * Runs Next.js with NODE_OPTIONS so webpack worker processes inherit the heap limit
 * (Windows/macOS/Linux — no cross-env required).
 */
const path = require("path");
const { spawn } = require("child_process");

const heapFlag = "--max-old-space-size=20480";
const prev = process.env.NODE_OPTIONS || "";
if (!prev.includes("max-old-space-size")) {
  process.env.NODE_OPTIONS = [heapFlag, prev].filter(Boolean).join(" ").trim();
}

const nextBin = path.join(__dirname, "..", "node_modules", "next", "dist", "bin", "next");
const command = process.argv[2] || "dev";
const rest = process.argv.slice(3);

const child = spawn(process.execPath, [nextBin, command, ...rest], {
  stdio: "inherit",
  env: process.env,
  windowsHide: true,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code === null ? 1 : code);
});
