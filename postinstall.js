const stream = require('stream');
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');
const unbr = require('unbr');
const rimraf = require('rimraf');

const lib = path.join(__dirname, 'lib4.tar.br');
const libFiles = ['lib4.tar.br01', 'lib4.tar.br02'].map(f => path.join(__dirname, f));
const _cleanup = () => {
  const files = libFiles.concat([lib]);
  for (let i = 0; i < files.length; i++) {
    rimraf(files[i], err => {
      if (err) {
        throw err;
      }
    });
  }
};
unbr(libFiles, lib);
child_process.execFileSync('tar', ['-xf', lib], {
  cwd: __dirname,
});
_cleanup();

process.on('uncaughtException', err => {
  console.warn(err.stack);
});
