var gulp       = require('gulp'),
    nodeResolve = require('rollup-plugin-node-resolve'),
    commonjs    = require('rollup-plugin-commonjs'),
    rollup = require('rollup').rollup;
    sourcemaps = require('gulp-sourcemaps');

gulp.task('bundle', function () {
  return rollup({
    entry: 'source/index.js',
    plugins: [
      nodeResolve(),
      commonjs()
    ]
  }).then(function (bundle) {
    return bundle.write({
      format: 'iife',
      moduleName: 'MyBundle',
      useStrict: false, //for push.js compatibility
      dest: 'distribution/index.js'
    });
  });
});

gulp.task('watch', function(){
   gulp.watch('source/**/*.js', ['bundle']); 
});

gulp.task('default', ['watch']);