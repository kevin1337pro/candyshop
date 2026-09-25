/** Rebuild web assets with Sharp 0.35.x. Originals stay outside public/Docker. */
import { createRequire } from 'node:module';
import { mkdir, copyFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const sharp = require(process.env.CANDY_SHARP_MODULE || 'sharp');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputs = [path.join(root, 'public/images'), path.join(root, 'wordpress/forme/assets')];
for (const dir of outputs) await mkdir(dir, {recursive: true});
const report = [];
async function make(name, input, sizes, options = {}) {
 for (const width of sizes) {
  const file = `${name}${width === sizes.at(-1) ? '' : `-${width}`}.webp`;
  const pipeline = sharp(input);
  if (options.extract) pipeline.extract(options.extract);
  await pipeline.resize({width, withoutEnlargement: true}).webp({quality: options.quality || 82, effort: 6}).toFile(path.join(outputs[0], file));
  await copyFile(path.join(outputs[0], file), path.join(outputs[1], file));
  report.push({file, width, bytes: (await stat(path.join(outputs[0], file))).size});
 }
}
const source = name => path.join(root, 'assets-source', name);
await make('candy-corner-logo', source('candy-corner-logo.png'), [192, 384, 768], {quality: 90});
await make('candy-hero', source('candy-hero.png'), [480, 768, 1152, 1536]);
const products = ['rainbow-bears', 'sour-rainbow-belts', 'double-choco-cookie', 'blue-raspberry'];
for (const [i, name] of products.entries()) {
 await make(name, source('candy-products.png'), [240, 480, 627], {extract: {left: (i % 2) * 627, top: Math.floor(i / 2) * 627, width: 627, height: 627}});
}
const originals = (await Promise.all(['candy-corner-logo.png','candy-hero.png','candy-products.png'].map(async f => (await stat(source(f))).size))).reduce((a,b)=>a+b,0);
const representative = report.filter(x => !/-\d+\.webp$/.test(x.file)).reduce((a,b)=>a+b.bytes,0);
await writeFile(path.join(root,'docs/image-sizes.json'), JSON.stringify({originalBytes: originals,largestWebpBytes: representative,reductionPercent: Math.round((1-representative/originals)*1000)/10,files: report},null,2)+'\n');
console.log(JSON.stringify({originalBytes: originals,largestWebpBytes: representative,reductionPercent: Math.round((1-representative/originals)*1000)/10}));
