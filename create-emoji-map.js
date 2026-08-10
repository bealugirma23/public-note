const fs = require('fs');
const path = require('path');

const emojisDir = path.join(__dirname, 'public/icons/emojis');

function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = `${dir}/${file}`;
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else {
      if (name.endsWith('.png') || name.endsWith('.svg') || name.endsWith('.jpg') || name.endsWith('.gif')) {
        files.push(name);
      }
    }
  }
  return files;
}

const files = getFiles(emojisDir);
console.log(`Found ${files.length} images.`);

const hashmap = {};
files.forEach((file, index) => {
  const relativePath = file.split('public/icons/emojis/')[1];
  // use the file name without extension as a key or just an ID
  const ext = path.extname(file);
  const baseName = path.basename(file, ext);
  
  // Format the id: remove spaces, lowercase, etc.
  const id = `emoji_${index + 1}_${baseName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
  
  hashmap[id] = {
    id,
    name: baseName,
    path: `/icons/emojis/${relativePath}`,
    category: path.dirname(relativePath)
  };
});

fs.writeFileSync(path.join(__dirname, 'app/lib/emojis.json'), JSON.stringify(hashmap, null, 2));
console.log('Created app/lib/emojis.json');
