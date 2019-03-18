'use strict';

const dir = {
  src: './dev/',
  build: './public/',
};

const { series, parallel, src, dest, watch } = require('gulp');
const plumber = require('gulp-plumber');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const browserSync = require('browser-sync').create();
const del = require('del');
const pug = require('gulp-pug');
const replace = require('gulp-replace');

function compilePug() {
  return src('./dev/components/**/*.pug')
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err.message);
        this.emit('end');
      }
    }))
    .pipe(pug())
    .pipe(replace(/^(\s*)(<button.+?>)(.*)(<\/button>)/gm, '$1$2\n$1  $3\n$1$4'))
    .pipe(replace(/^( *)(<.+?>)(<script>)([\s\S]*)(<\/script>)/gm, '$1$2\n$1$3\n$4\n$1$5\n'))
    .pipe(replace(/^( *)(<.+?>)(<script\s+src.+>)(?:[\s\S]*)(<\/script>)/gm, '$1$2\n$1$3$4'))
    .pipe(dest(dir.build + 'components/'));
}
exports.compilePug = compilePug;

function compileStylesComponents() {
  return src(dir.src + 'components/**/*.scss')
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err.message);
        this.emit('end');
      }
    }))
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(postcss([
      autoprefixer({ browsers: ['last 2 version'] }),
    ]))
    .pipe(dest(dir.build + '/components/'))
    .pipe(browserSync.stream());
}
exports.compileStylesComponents = compileStylesComponents;

function compileStyles() {
  return src(dir.src + 'scss/style.scss')
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err.message);
        this.emit('end');
      }
    }))
    .pipe(sourcemaps.init())
    .pipe(sass({outputStyle: 'compressed'}))
    .pipe(postcss([
      autoprefixer({ browsers: ['last 2 version'] }),
    ]))
    .pipe(sourcemaps.write('/'))
    .pipe(dest(dir.build + 'css/'))
    .pipe(browserSync.stream());
}
exports.compileStyles = compileStyles;

function compilePugIndex() {
  return src(dir.src + 'pages/**/*.pug')
    .pipe(plumber({
      errorHandler: function (err) {
        console.log(err.message);
        this.emit('end');
      }
    }))
    .pipe(pug())
    .pipe(replace(/^(\s*)(<button.+?>)(.*)(<\/button>)/gm, '$1$2\n$1  $3\n$1$4'))
    .pipe(replace(/^( *)(<.+?>)(<script>)([\s\S]*)(<\/script>)/gm, '$1$2\n$1$3\n$4\n$1$5\n'))
    .pipe(replace(/^( *)(<.+?>)(<script\s+src.+>)(?:[\s\S]*)(<\/script>)/gm, '$1$2\n$1$3$4'))
    .pipe(dest(dir.build));
}
exports.compilePugIndex = compilePugIndex;

function clean() {
  return del(dir.build)
}
exports.clean = clean;

function copyImages() {
  return src(dir.src + 'components/**/*.{jpg,jpeg,png,svg,webp,gif}')
    .pipe(dest(dir.build + '/components/'));
}
exports.copyImages = copyImages;

function serve() {
  browserSync.init({
    server: dir.build,
    startPath: 'index.html',
    open: false,
    port: 8080,
  });
  watch([
    dir.src + 'scss/*.scss',
    dir.src + 'scss/blocks/*.scss',
  ], compileStyles);
  watch([
    dir.src + 'components/**/*.scss',
  ], compileStylesComponents);
  watch([
    dir.src + 'components/**/*.pug',
  ], compilePug);
  watch([
    dir.src + 'pages/*.pug',
    dir.src + 'templates/default/*.pug',
  ], compilePugIndex);
  watch([
    dir.build + '*.html',
    dir.build + 'components/**/*.html',
  ]).on('change', browserSync.reload);
}

exports.default = series(
  clean,
  parallel(compileStyles, compileStylesComponents, compilePug, compilePugIndex,copyImages),
  serve
);
