var gulp       = require('gulp'),
    nodeResolve = require('rollup-plugin-node-resolve'),
    commonjs    = require('rollup-plugin-commonjs'),
    rollup = require('rollup').rollup,
    sourcemaps = require('gulp-sourcemaps'),
    babel = require('rollup-plugin-babel');

gulp.task('bundle', function () {
  return rollup({
    entry: 'source/index.js',
    plugins: [
      nodeResolve(),
      commonjs(),
      babel()
    ]
  }).then(function (bundle) {
    return bundle.write({
      format: 'iife',
      moduleName: 'GoodBytes',
      useStrict: false, //for push.js compatibility
      dest: 'distribution/index.js'
    });
  });
});

gulp.task('watch', function(){
   gulp.watch('source/**/*.js', ['bundle']); 
});

gulp.task('default', ['watch']);