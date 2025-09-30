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
  content = content.replace(/href="\/KidP2\/([^"]*)"/g, 'href="./KidP2/$1"');
  content = content.replace(/src="\/KidP2\/([^"]*)"/g, 'src="./KidP2/$1"');
  content = content.replace(/href="\/([^"]*(?!KidP2)[^"]*)"/g, 'href="./$1"');
  content = content.replace(/src="\/([^"]*(?!KidP2)[^"]*)"/g, 'src="./$1"');
  
  // Fix any remaining absolute paths that don't have KidP2
  content = content.replace(/="\/(?!KidP2)([^"]*)"/g, '="./$1"');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed paths in ${filePath}`);
}

// Fix paths in index.html
const indexPath = path.join(__dirname, 'dist', 'index.html');
fixPathsInFile(indexPath);

// Fix paths in 404.html if it exists
const notFoundPath = path.join(__dirname, 'dist', '404.html');
if (fs.existsSync(notFoundPath)) {
  fixPathsInFile(notFoundPath);
}

console.log('Path fixing completed!');