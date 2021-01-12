const gulp = require('gulp');
const inlineResources = require('./tools/inline-resources');

function copyHtml() {
    return gulp.src('src/app/**/*.html')
        .pipe(gulp.dest('./dist/src/app'));
}

function copyStylesFolder() {
    return gulp.src('src/styles/**/*.{scss,css,png}')
    .pipe(gulp.dest('./dist/src/styles'));
}

function copyStyles() {
    return gulp.src('src/styles.css')
    .pipe(gulp.dest('./dist/src'));
}

function copyDts() {
    return gulp.src('src/app/**/*.d.ts')
    .pipe(gulp.dest('./dist/src/app'));
}

function copyJS() {
    return gulp.src('src/app/**/*.js')
    .pipe(gulp.dest('./dist/src/app'));
}

function copyscriptJS() {
    return gulp.src('src/script/*.js')
        .pipe(gulp.dest('./dist'));
}

function copyScss() {
    return gulp.src('./src/app/**/*.{scss,css}')
    .pipe(gulp.dest('./dist/src/app'));
}

function inlineResource(done) {
    inlineResources('./dist/**');
    done();
}

function copyData() {
    return gulp.src('src/app/**/*.json')
    .pipe(gulp.dest('./dist/src/app'));
};

function copyAssetsi18n() {
    return gulp.src('./src/assets/i18n/*')
        .pipe(gulp.dest('./dist/assets/i18n'));
}

gulp.task('build:copy-html', copyHtml);
gulp.task('build:copy-styles-folder', copyStylesFolder);
gulp.task('build:copy-styles', copyStyles);
gulp.task('build:copy-dts', copyDts);
gulp.task('build:copy-js', copyJS);
gulp.task('build:copy-script-js', copyscriptJS);
gulp.task('build:copy-css', copyScss);
gulp.task('build:copy-json', copyData);
gulp.task('build:copy-assets-i18n', copyAssetsi18n);
gulp.task('build:inline-resources', inlineResource);

gulp.task('default', gulp.series(
  'build:copy-html',
  'build:copy-styles-folder',
  'build:copy-styles',
  'build:copy-dts',
  'build:copy-js',
  'build:copy-script-js',
  'build:copy-css',
  'build:copy-json',
  'build:copy-assets-i18n',
  'build:inline-resources'
));