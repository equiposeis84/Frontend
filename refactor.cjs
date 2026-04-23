const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'frontend', 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

files.forEach(file => {
  const p = path.join(pagesDir, file);
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(/import axios from ['"]axios['"];?/g, "import api from '../api';");
  content = content.replace(/http:\/\/localhost:3000/g, "");
  content = content.replace(/axios\./g, "api.");
  fs.writeFileSync(p, content);
});

const ctxPath = path.join(__dirname, 'frontend', 'src', 'context', 'CartContext.jsx');
let ctxContent = fs.readFileSync(ctxPath, 'utf8');
ctxContent = ctxContent.replace(/import axios from ['"]axios['"];?/g, "import api from '../api';");
ctxContent = ctxContent.replace(/http:\/\/localhost:3000/g, "");
ctxContent = ctxContent.replace(/axios\./g, "api.");
fs.writeFileSync(ctxPath, ctxContent);

console.log("Refactor complete.");
