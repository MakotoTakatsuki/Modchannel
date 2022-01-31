// System
const fs = require('fs');
const path = require('path');

// misc
const glob = require("glob");
const sassGraph = require('sass-graph');

// Gulp
const gulp = require('gulp');
const cleanCSS = require('gulp-clean-css');
const sass = require('gulp-sass')(require('sass'));
const sassVariables = require('gulp-sass-variables');
const sourcemaps = require('gulp-sourcemaps');
const nunjucks = require('gulp-nunjucks-render');
const rename = require('gulp-rename');
const htmlmin = require('gulp-htmlmin');
const terser = require('gulp-terser');
const gulpif = require('gulp-if');
const cache = require('gulp-cache');
const del = require('del');

// Environment variables
const PRODUCTION_MODE = process.env.NODE_ENV === 'production' ? true : false;
const PRODUCTION_MODE_STR = PRODUCTION_MODE ? 'true' : 'false';
const PRODUCTION_MODE_STR_INV = PRODUCTION_MODE ? 'false' : 'true';
const CACHE_KEY_PREFIX = process.env.NODE_ENV !== 'production' ? 'dev-' : '';

const KC_ENABLED_LANGUAGES = (process.env.KC_ENABLED_LANGUAGES || 'en,jp').split(',');
const KC_DEFAULT_LANGUAGE = process.env.KC_DEFAULT_LANGAUGE || KC_ENABLED_LANGUAGES[0];
const KC_SCSS_VARIABLES_PATH = process.env.KC_SCSS_VARIABLES_PATH || 'src/scss/default/_variables.scss';
const KC_SOURCEMAPS_ENABLED = (process.env.KC_SOURCEMAPS_ENABLED || PRODUCTION_MODE_STR_INV) === 'true';
const KC_MINIFIED_DEFAULT_ENABLED = process.env.KC_MINIFIED_DEFAULT_ENABLED || PRODUCTION_MODE_STR;
const KC_MINIFIED_CSS_ENABLED = (process.env.KC_MINIFIED_CSS_ENABLED || KC_MINIFIED_DEFAULT_ENABLED) === 'true';
const KC_MINIFIED_CSS_LEVEL = (Number(process.env.KC_MINIFIED_CSS_LEVEL) || 2);
const KC_MINIFIED_HTML_ENABLED = (process.env.KC_MINIFIED_HTML_ENABLED || KC_MINIFIED_DEFAULT_ENABLED) === 'true';
const KC_MINIFIED_JS_ENABLED = (process.env.KC_MINIFIED_JS_ENABLED || KC_MINIFIED_DEFAULT_ENABLED) === 'true';
const KC_SNOWFLAKE_COUNT = (Number(process.env.KC_SNOWFLAKE_COUNT) || 24);

var data = {};

var gulpfile = {};

gulpfile.init = function() {

  gulpfile.gulpTasks();

};

gulpfile.genStaticUnixTimestamps = function() {

  var graph = sassGraph.parseDir(process.cwd() + '/src/scss', {
    extensions: ['scss']
  });

  var graphIndex = graph.index;

  function newestScssTimestamp(scssFile, graphIndex, depth) {
    var cur = {
      filepath: scssFile,
      modified: graphIndex[scssFile].modified
    };
    for (var i = 0; i < graphIndex[scssFile].imports.length; i++) {
      if (graphIndex[scssFile].imports[i] == scssFile) {
        continue;
      }
      var tmp = newestScssTimestamp(graphIndex[scssFile].imports[i], graphIndex, depth - 1);
      if (tmp.modified > cur.modified) {
        cur = {
          filepath: scssFile,
          modified: tmp.modified
        };
      }
    }
    return cur;
  }

  var scssFiles = Object.keys(graphIndex).filter(filepath => path.basename(filepath).substring(0, 1) != '_').map(x => newestScssTimestamp(x, graphIndex, 10));

  var jsFiles = glob.sync('**/*.+(js|json)', {
    cwd: process.cwd() + '/src',
    absolute: true
  }).map(x => ({
    filepath: x,
    modified: fs.statSync(x).mtime
  }));

  var otherStaticFiles = glob.sync('**/*.+(js|css)', {
    cwd: process.cwd() + '/static',
    absolute: true
  }).map(x => ({
    filepath: x,
    modified: fs.statSync(x).mtime
  }));

  var combinedFiles = [].concat(scssFiles, jsFiles, otherStaticFiles);

  var result = {};

  for (var i = 0; i < combinedFiles.length; i++) {
    var offset = combinedFiles[i].filepath.substring(process.cwd().length).slice(0, 5) == '/src/' ? 5 : 8;
    var convertedFilepath = combinedFiles[i].filepath.substring(process.cwd().length + offset);
    if (path.extname(convertedFilepath) == '.scss') {
      convertedFilepath = convertedFilepath.substring(1, convertedFilepath.lastIndexOf('.')) + '.css';
    } else if (path.extname(convertedFilepath) == '.json') {
      convertedFilepath = 'js/' + convertedFilepath.substring(0, convertedFilepath.lastIndexOf('.')) + '.js';
    }
    convertedFilepath = '/.static/' + convertedFilepath;
    result[convertedFilepath] = +combinedFiles[i].modified;
  }

  return result;

};

gulpfile.gulpTasks = function() {

  const langs = KC_ENABLED_LANGUAGES.map((lang) => {
    return {
      name: lang,
      json: Object.assign(JSON.parse(fs.readFileSync('./src/lang/' + lang + '.json')))
    }
  });

  gulpfile.nunjucks_translate = function(name, json) {
    return gulp.src('src/njk/**/*.njk')
      .pipe(nunjucks({path: 'src/njk', ext: '.njk', data: json}))
      .pipe(gulpif(KC_MINIFIED_HTML_ENABLED, cache(
        htmlmin({
          collapseWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          useShortDoctype: true,
          minifyCss: true
        }),
        {name: CACHE_KEY_PREFIX + 'htmlmin-' + name}
      )))
      .pipe(rename({extname: '.html'}))
      .pipe(gulp.dest('./dist/html/' + name + '/templates'))
  };

  const timestamps = gulpfile.genStaticUnixTimestamps();

  langs.forEach(function(lang){
    gulp.task('html-' + lang.name, () => {
      var mod_json = lang.json;
      mod_json['LANG'] = lang.name;
      mod_json['SNOWFLAKE_COUNT'] = KC_SNOWFLAKE_COUNT;
      mod_json['config'] = JSON.parse(fs.readFileSync('config/kohlnumbra.json', 'utf-8'));
      mod_json['cb'] = timestamps;
      return gulpfile.nunjucks_translate(
        lang.name,
        mod_json
      );
    });
    gulp.task('js-' + lang.name, function(cb){
      var str = 'var lang={};lang=' + JSON.stringify(lang.json.lang) + ';';
      fs.writeFile('./dist/js/lang/' + lang.name + '.js', str, cb);
    });
  });

  gulp.task('css', () => {
    return gulp.src('./src/scss/**/*.scss')
      .pipe(gulpif(KC_SOURCEMAPS_ENABLED, sourcemaps.init()))
      .pipe(sassVariables({
        $snowflake_count: KC_SNOWFLAKE_COUNT
      }))
      .pipe(sass())
      .pipe(gulpif(KC_MINIFIED_CSS_ENABLED, cache(
        cleanCSS({level: KC_MINIFIED_CSS_LEVEL}), {name: CACHE_KEY_PREFIX + 'css' + '-lvl' + KC_MINIFIED_CSS_LEVEL}
      )))
      .pipe(gulpif(KC_SOURCEMAPS_ENABLED, sourcemaps.write('./maps')))
      .pipe(gulp.dest('./dist/css'));
  });

  gulp.task('js', function() {
    return gulp.src([
      'src/js/**/*.js',
    ])
      .pipe(gulpif(KC_SOURCEMAPS_ENABLED, sourcemaps.init()))
      .pipe(gulpif(KC_MINIFIED_JS_ENABLED, cache(
        terser(), {name: CACHE_KEY_PREFIX + 'uglify'}
      )))
      .pipe(gulpif(KC_SOURCEMAPS_ENABLED, sourcemaps.write('./maps')))
      .pipe(gulp.dest('dist/js'))
  });

  gulp.task('staticSymlinks', function() {
    return gulp.src([
      'dist/js',
      'dist/css',
      'dist/html/' + KC_DEFAULT_LANGUAGE + '/templates/static/pages'
    ])
      .pipe(gulp.symlink('static/'));
  });

  gulp.task('templatesSymlink', function() {
    return gulp.src('dist/html/' + KC_DEFAULT_LANGUAGE + '/templates')
      .pipe(gulp.symlink('.'));
  });

  gulp.task('scssVariablesSymlink', function() {
    return gulp.src(KC_SCSS_VARIABLES_PATH)
      .pipe(gulp.symlink('src/scss'));
  });

  gulp.task('rootImagesSymlink', function() {

    var pipeline = gulp.src('images');

    langs.forEach(function(lang) {
      var destination = 'dist/html/' + lang.name + '/templates';
      pipeline = pipeline.pipe(gulp.symlink(destination));
    });

    return pipeline;

  });

  gulp.task('clean', function() {
    cache.clearAll();
    return del([
      'src/scss/_variables.scss',
      'static/css',
      'static/js',
      'static/css',
      'static/pages',
      'templates',
      'dist/*'
    ]);
  });

  gulp.task('langDir', function () {

    return gulp.src('*.*', {read: false})
      .pipe(gulp.dest('./dist/js/lang'))
  });

  gulpfile.html_lang = gulp.parallel.apply(null, langs.map((lang) => {return 'html-' + lang.name}));

  gulpfile.js_lang = gulp.parallel.apply(null, langs.map((lang) => {return 'js-' + lang.name}));

  gulp.task('default', gulp.series(
    gulp.parallel(
      gulpfile.html_lang,
      gulp.series(
        'langDir',
        gulpfile.js_lang
      ),
      gulp.series(
        'scssVariablesSymlink',
        'css'
      ),
      'js'
    ),
    gulp.parallel(
      'staticSymlinks',
      gulp.series(
        'templatesSymlink',
        'rootImagesSymlink'
      )
    )
  ));

};

gulpfile.init();
