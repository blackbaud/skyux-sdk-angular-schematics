const fs = require('fs-extra');
const path = require('path');

function copyFilesToDist() {
  const pathsToCopy = [
    ['README.md'],
    ['CHANGELOG.md'],
    ['package.json'],
    ['collection.json'],
    ['src/schematics/ng-generate/lib-resources-module/files/lib/shared/__name@dasherize__-resources.module.ts.template']
  ];

  pathsToCopy.forEach(pathArr => {
    const sourcePath = path.join(...pathArr);
    const distPath = path.join('dist', ...pathArr);
    if (fs.existsSync(sourcePath)) {
      fs.copySync(sourcePath, distPath);
      console.log(`Successfully copied ${sourcePath} to ${distPath}`);
    } else {
      throw `File not found: ${sourcePath}`;
    }
  });
}

copyFilesToDist();
