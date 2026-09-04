// Prepara as fotos de serviços em assets/images/services/<slug>/:
// para cada arquivo que não for .webp, converte para .webp e apaga o
// original — a pasta fica só com .webp no final. Arquivos que já são
// .webp são mantidos como estão (não reconverte, não perde qualidade
// à toa).
//
// Convenção de nomes esperada por scripts/generate-services.mjs:
//   <CÓDIGO>-01.<ext> / <CÓDIGO>-02.<ext>   par antes/depois (01 = depois,
//                                            02 = antes; <CÓDIGO> é livre,
//                                            ex: AA, AB, AC...)
//   OTHERS-01.<ext>, OTHERS-02.<ext>, ...   fotos avulsas da galeria
//
// Rodar sempre que fotos novas forem colocadas em alguma pasta de
// serviço, antes de rodar generate-services.mjs:
//
//   npm install        (uma vez só, instala o sharp)
//   node scripts/prepare-service-images.mjs

import { readdirSync, statSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, basename } from 'node:path';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SVC_IMAGES_DIR = join(ROOT, 'assets', 'images', 'services');

const CONVERTIBLE_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.tiff', '.bmp', '.avif']);
const WEBP_QUALITY = 82;

async function convertFile(dir, file) {
  const ext = extname(file).toLowerCase();

  if (ext === '.webp') {
    console.log(`  mantido:   ${file}`);
    return;
  }
  if (!CONVERTIBLE_EXT.has(ext)) {
    console.log(`  ignorado:  ${file} (extensão não é imagem conhecida)`);
    return;
  }

  const srcPath = join(dir, file);
  const destName = `${basename(file, ext)}.webp`;
  const destPath = join(dir, destName);

  await sharp(srcPath).webp({ quality: WEBP_QUALITY }).toFile(destPath);
  unlinkSync(srcPath);
  console.log(`  convertido: ${file} -> ${destName}`);
}

async function processServiceFolder(slug) {
  const dir = join(SVC_IMAGES_DIR, slug);
  const files = readdirSync(dir).filter((f) => statSync(join(dir, f)).isFile());
  if (!files.length) return;

  console.log(`\n${slug}/`);
  for (const file of files) {
    await convertFile(dir, file);
  }
}

async function main() {
  if (!existsSyncSafe(SVC_IMAGES_DIR)) {
    console.log(`Nenhuma pasta encontrada em ${SVC_IMAGES_DIR} — nada para preparar.`);
    return;
  }

  const slugs = readdirSync(SVC_IMAGES_DIR).filter((f) => statSync(join(SVC_IMAGES_DIR, f)).isDirectory());
  if (!slugs.length) {
    console.log('Nenhuma pasta de serviço com imagens ainda.');
    return;
  }

  for (const slug of slugs) {
    await processServiceFolder(slug);
  }

  console.log('\nPronto. Rode "node scripts/generate-services.mjs" para atualizar as páginas com as novas fotos.');
}

function existsSyncSafe(path) {
  try {
    statSync(path);
    return true;
  } catch {
    return false;
  }
}

main();
