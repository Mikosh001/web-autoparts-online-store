const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");

function exactFile(file) {
  const relative = path.relative(root, file);
  assert.ok(!relative.startsWith(".."), `Outside project: ${file}`);
  let parent = root;
  for (const part of relative.split(path.sep)) {
    assert.ok(fs.readdirSync(parent).includes(part), `Missing or case-mismatched path: ${relative}`);
    parent = path.join(parent, part);
  }
  assert.ok(fs.statSync(file).isFile(), relative);
}

test("all eight HTML pages have unique IDs, exact-case assets and ordered script dependencies", () => {
  const files = fs.readdirSync(root).filter(name => name.endsWith(".html"));
  assert.equal(files.length, 8);
  for (const name of files) {
    const html = fs.readFileSync(path.join(root, name), "utf8");
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(new Set(ids).size, ids.length, `Duplicate ID in ${name}`);
    for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
      const target = match[1];
      if (/^(https?:|mailto:|tel:|#)/.test(target)) continue;
      const file = target.split(/[?#]/)[0];
      exactFile(path.resolve(root, decodeURIComponent(file)));
    }
    const scripts = [...html.matchAll(/<script\b[^>]*src="([^"]+)"/g)].map(match => match[1]);
    const dependencies = ["vendor/jquery-3.7.1.min.js", "js/product.js", "js/data.js", "js/common.js", "js/storage.js", "js/auth.js", "js/cart.js"];
    for (let index = 0; index < dependencies.length; index += 1) assert.equal(scripts[index], dependencies[index], `${name} script order`);
    assert.equal(scripts.at(-1), "js/jquery-ui.js");
    assert.match(html, /href="requests.html"/);
  }
});

test("all CSS imports, font and image URLs resolve with exact case", () => {
  const styles = [path.join(root, "style.css")];
  for (const folder of ["css", "vendor"]) for (const file of fs.readdirSync(path.join(root, folder))) if (file.endsWith(".css")) styles.push(path.join(root, folder, file));
  for (const file of styles) {
    const source = fs.readFileSync(file, "utf8");
    for (const match of source.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
      if (/^(data:|https?:|#)/.test(match[1])) continue;
      exactFile(path.resolve(path.dirname(file), match[1].split(/[?#]/)[0]));
    }
  }
});
