const stream = require('stream');
const path = require('path');
const fs = require('fs');
const child_process = require('child_process');
const unzipper = require('unzipper');
const rimraf = require('rimraf');

const lib = 'lib4.zip';
const _getLibFiles = cb => {
  fs.readdir(__dirname, (err, files) => {
    if (!err) {
      files = files
        .filter(f => f.startsWith(lib))
        .sort()
        .map(f => path.join(__dirname, f));
      cb(null, files);
    } else {
      cb(err);
    }
  });
};
const _getLibsStream = cb => {
  _getLibFiles((err, files) => {
    if (!err) {
      const s = new stream.PassThrough();
      s.files = files;
      const _recurse = (i = 0) => {
        if (i < files.length) {
          const file = files[i];
          const s2 = fs.createReadStream(file);
          s2.pipe(s, {end: false});
          s2.on('end', () => {
            _recurse(i + 1);
          });
          s2.on('error', err => {
            throw err;
          });
        } else {
          s.end();
        }
      };
      _recurse();
      cb(null, s);
    } else {
      cb(err);
    }
  });
};

_getLibsStream((err, rs) => {
  if (!err) {
    const ws = rs.pipe(unzipper.Extract({
      path: __dirname,
    }));
    ws.on('close', () => {
      for (let i = 0; i < rs.files.length; i++) {
        /* rimraf(rs.files[i], err => {
          if (err) {
            throw err;
          }
        }); */
      }
    });
  } else {
    throw err;
  }
});

process.on('uncaughtException', err => {
  console.warn(err.stack);
});
