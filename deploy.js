const fs = require('fs');
const path = require('path');

// Create 404.html file for client-side routing
const notFoundContent = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Kids Piggy Bank</title>
    <script>
      // Redirect to the correct path for SPA routing
      var pathSegmentsToKeep = 0;
      var l = window.location;
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
        l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );
    </script>
  </head>
  <body>
  </body>
</html>`;

// Create .nojekyll file to prevent GitHub Pages from processing files
const noJekyllContent = '';

// Write files to dist folder
const distPath = path.join(__dirname, 'dist');

// Create 404.html
fs.writeFileSync(path.join(distPath, '404.html'), notFoundContent);
console.log('Created 404.html');

// Create .nojekyll
fs.writeFileSync(path.join(distPath, '.nojekyll'), noJekyllContent);
console.log('Created .nojekyll');

console.log('Deployment preparation completed!');