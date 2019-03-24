const stream = require('stream');
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');
const os = require('os');
const unbr = require('unbr');
const rimraf = require('rimraf');

const lib = path.join(__dirname, 'lib4.tar.br');
const libFiles = ['lib4.tar.br01', 'lib4.tar.br02'].map(f => path.join(__dirname, f));
const platform = (() => {
  if (process.env['LUMIN'] !== undefined) {
    return 'lumin';
  } else if (process.env['ANDROID'] !== undefined) {
    return 'android';
  } else {
    return os.platform();
  }
})();
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
if (platform === 'linux') {
  try {
    unbr(libFiles, lib);
    child_process.execFileSync('tar', ['-xf', lib], {
      cwd: __dirname,
    });
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }
}
_cleanup();
