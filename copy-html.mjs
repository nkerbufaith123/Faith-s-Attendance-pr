import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// List of HTML files to copy to dist
const htmlFiles = [
  'login.html',
  'signup.html',
  'dashboard.html',
  'attendance.html',
  'reports.html',
  'settings.html',
  'admin-dashboard.html',
  'task.html',
];

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy HTML files
htmlFiles.forEach((file) => {
  const source = path.join(__dirname, file);
  const destination = path.join(distDir, file);
  
  // Only copy if source exists
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, destination);
    console.log(`Copied ${file} to dist/`);
  } else {
    console.warn(`Warning: ${file} not found`);
  }
});

console.log('Build post-processing complete!');
