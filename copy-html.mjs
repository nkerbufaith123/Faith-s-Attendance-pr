import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Recursively copy directory
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      copyDir(srcPath, destPath);
    } else if (!entry.name.startsWith('.')) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy all root-level HTML files
fs.readdirSync(__dirname).forEach((file) => {
  if (file.endsWith('.html')) {
    fs.copyFileSync(path.join(__dirname, file), path.join(distDir, file));
    console.log(`Copied ${file}`);
  }
});

// Copy all root-level JS and CSS files
fs.readdirSync(__dirname).forEach((file) => {
  if ((file.endsWith('.js') || file.endsWith('.css') || file.endsWith('.mjs')) && 
      file !== 'copy-html.mjs' && file !== 'postcss.config.mjs') {
    fs.copyFileSync(path.join(__dirname, file), path.join(distDir, file));
    console.log(`Copied ${file}`);
  }
});

// Copy directories with assets
['js', 'api', 'images', 'server', 'guidelines'].forEach((dir) => {
  const src = path.join(__dirname, dir);
  const dest = path.join(distDir, dir);
  if (fs.existsSync(src)) {
    copyDir(src, dest);
    console.log(`Copied ${dir}/ directory`);
  }
});

console.log('Build post-processing complete!');

