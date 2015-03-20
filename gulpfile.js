var gulp = require('gulp'),
  semver = require('semver'),
  shell = require('gulp-shell'),
  watch = require('gulp-watch'),
  bump = require('gulp-bump'),
  pkg = require('./package.json'),
  watch = require('gulp-watch'),
  sass = require('gulp-sass'),
  htmlreplace = require('gulp-html-replace');

gulp.task('styles', function() {
  return gulp.src('src/scss/main.scss')
    .pipe(sass())
    .pipe(gulp.dest('src/css'))
});

gulp.task('deploy-master', function() {
  var newVer = semver.inc(pkg.version, 'patch');
  return gulp.src(['./package.json'])
    .pipe(bump({
      version: newVer
    }))
    .pipe(gulp.dest('./'))
    .on('end', shell.task([
      'git add --all',
      'git commit -m "' + newVer + '"',
      'git tag -a "' + newVer + '" -m "' + newVer + '"',
      'git push origin master',
      'git push origin --tags'
    ]));
});

gulp.task('deploy', ['build'], function() {
  return gulp.src(['./'])
    .on('end', shell.task([
      'aws s3 sync ./build s3://gdn-cdn/embed/aus/2015/mar/interactive-searchable/ --profile interactive --acl public-read --cache-control="max-age=0, no-cache"'
    ]));
});

gulp.task('build', ['styles'], function() {
  gulp.src('./')
    .pipe(shell([
      'jspm bundle-sfx src/lib/index',
      'cp -f ./build.js ./build/',
      'cp -rf ./src/css ./build && cp -rf ./src/images ./build/images',
      'cp -f jspm_packages/traceur-runtime.js ./build',
      'cp -f ./src/boot.js ./build'
    ]));

  gulp.src('./src/index.html')
    .pipe(htmlreplace({
      src: 'src/index.html',
      'js': {
        src: ['traceur-runtime.js', 'build.js']
      }
    }))
    .pipe(gulp.dest('build/'));
});

gulp.task('watch', function() {
  gulp.watch(['src/**/*'], ['build']);
});
