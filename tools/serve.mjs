// Optional local preview: node tools/serve.mjs. No package installation needed.
import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".svg": "image/svg+xml", ".ttf": "font/ttf" };
const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const target = path.resolve(root, `.${pathname === "/" ? "/index.html" : pathname}`);
    if (!target.startsWith(path.resolve(root) + path.sep)) {
      response.writeHead(403); response.end("Forbidden"); return;
    }
    const content = await readFile(target);
    response.writeHead(200, { "Content-Type": types[path.extname(target)] || "application/octet-stream", "Cache-Control": "no-store" });
    response.end(content);
  } catch {
    response.writeHead(404); response.end("Not found");
  }
});
server.on("error", error => { console.error(`Cannot start preview: ${error.message}`); process.exitCode = 1; });
server.listen(4173, "127.0.0.1", () => console.log("AutoParts preview: http://127.0.0.1:4173 (Ctrl+C to stop)"));
