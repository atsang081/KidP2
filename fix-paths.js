const fs = require('fs');
const path = require('path');

// Function to replace absolute paths with relative paths in a file
function fixPathsInFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace absolute paths with relative paths
  content = content.replace(/href="\/([^"]*)"/g, 'href="./$1"');
  content = content.replace(/src="\/([^"]*)"/g, 'src="./$1"');
  
  // Special case for favicon
  content = content.replace(/href="\."/g, 'href="./favicon.ico"');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed paths in ${filePath}`);
}

// Fix paths in index.html
const indexPath = path.join(__dirname, 'dist', 'index.html');
fixPathsInFile(indexPath);

console.log('Path fixing completed!');