const path = require('path');
const fs = require('fs');
const os = require('os');
const child_process = require('child_process');
const unzipper = require('unzipper');
const rimraf = require('rimraf');

const splitFiles = ['lib4.xz'];

['lib4.xz'].map(lib => {
  const _unpack = () => {
    const cp = child_process.spawn('tar', ['-xJf', path.join(__dirname, lib)], {
      stdio: 'inherit',
    });
    cp.on('exit', code => {
      if (code === 0) {
        rimraf(path.join(__dirname, lib), err => {
          if (err) {
            throw err;
          }
        });
        const platform = (() => {
          if (process.env['LUMIN'] !== undefined) {
            return 'lumin';
          } else if (process.env['ANDROID'] !== undefined) {
            return 'android';
          } else {
            return os.platform();
          }
        })();
        switch (platform) {
          case 'win32': {
            ['macos', 'linux', 'android', 'ios', 'arm64', 'magicleap'].forEach(p => {
              rimraf(path.join(__dirname, lib.replace(/\.xz$/, ''), p), err => {
               if (err) {
                  throw err;
                }
             });
            });
            break;
          }
          case 'darwin': {
            ['windows', 'linux', 'android', 'ios', 'arm64', 'magicleap'].forEach(p => {
              rimraf(path.join(__dirname, lib.replace(/\.xz$/, ''), p), err => {
                if (err) {
                  throw err;
                }
              });
            });
            break;
          }
          case 'linux': {
            ['windows', 'macos', 'android', 'ios', 'arm64', 'magicleap'].forEach(p => {
              rimraf(path.join(__dirname, lib.replace(/\.xz$/, ''), p), err => {
                if (err) {
                  throw err;
                }
              });
            });
            break;
          }
          case 'android': {
            ['windows', 'macos', 'linux', 'android', 'ios', 'magicleap'].forEach(p => {
              rimraf(path.join(__dirname, lib.replace(/\.xz$/, ''), p), err => {
                if (err) {
                  throw err;
                }
              });
            });
            break;
          }
          case 'lumin': {
            ['windows', 'macos', 'linux', 'android', 'ios', 'arm64'].forEach(p => {
              rimraf(path.join(__dirname, lib.replace(/\.xz$/, ''), p), err => {
                if (err) {
                  throw err;
                }
              });
            });
            break;
          }
          default: throw new Error('unknown platform: ' + platform);
        }
      } else {
        throw new Error(`invalid status code ${code}`);
      }
    });
  };

  if (splitFiles.includes(lib)) {
    fs.readdir(__dirname, (err, files) => {
      if (!err) {
        files = files
          .filter(f => f.startsWith(lib))
          .sort();

        const libPath = path.join(__dirname, lib);
        const _recurse = (i = 0) => {
          if (i < files.length) {
            const file = files[i];
            const filePath = path.join(__dirname, file);
            const rs = fs.createReadStream(filePath);
            const ws = fs.createWriteStream(libPath, {
              flags: (i === 0) ? 'w' : 'a',
            });
            rs.pipe(ws);
            ws.on('finish', () => {
              rimraf(filePath, err => {
                if (err) {
                  throw err;
                }
              });

              _recurse(i + 1);
            });
            ws.on('error', err => {
              throw err;
            });
          } else {
            _unpack();
          }
        };
        _recurse();
      } else {
        throw err;
      }
    });
  } else {
    _unpack();
  }
});

process.on('uncaughtException', err => {
  console.warn(err.stack);
});
