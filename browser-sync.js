const exec = require('child_process').exec;
const gulp = require('gulp');
const browserSync = require('browser-sync').create();

const KC_LYNXCHAN_IP = process.env.KC_LYNXCHAN_IP || 'localhost';
const KC_LYNXCHAN_PORT = process.env.KC_LYNXCHAN_PORT || '8080';

gulp.task('reload-lynx', function(cb) {
  exec('lynxchan -nd -rfe -r -cc', (error, stdout, stderr) => {
    if (error) {
      console.error('stderr', stderr);
      throw error
    }
    console.log('stdout', stdout);
    cb();
  });
});

gulp.task('build', function(cb) {
  exec('gulp', (error, stdout, stderr) => {
    if (error) {
      console.error('stderr', stderr);
      throw error
    }
    console.log('stdout', stdout);
    cb();
  });
});

gulp.task('default', function() {
  browserSync.init({
    proxy: KC_LYNXCHAN_IP + ':' + KC_LYNXCHAN_PORT,
    notify: false
  });
  gulp.watch(["src/**/*", "config/kohlnumbra.json", "gulpfile.js"]).on('change', gulp.series(
    gulp.task('build'),
    gulp.task('reload-lynx'),
    browserSync.reload
  ));
});
