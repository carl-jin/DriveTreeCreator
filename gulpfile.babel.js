import gulp from 'gulp'
import path from 'path'
import fs from 'fs'
import browserSync from 'browser-sync'
import sass from 'gulp-sass'
import sourcemaps from 'gulp-sourcemaps'
import uglify from 'gulp-uglify'
import saveLicense from 'uglify-save-license'
import stripDebug from 'gulp-strip-debug'
import htmlmin from 'gulp-htmlmin'
import clean from 'gulp-clean-css'
import autop from 'gulp-autoprefixer'
import gutil from 'gulp-util'
import newer from 'gulp-newer'
import globby from 'globby'
import deporder from 'gulp-deporder'
import effectiveJs from 'gulp-ejs'
import imagemin from 'gulp-imagemin'
import plumber from 'gulp-plumber'

// browserify
import browserify from 'browserify'
import source from 'vinyl-source-stream'
import buffer from 'vinyl-buffer'
import babelify from 'babelify'

// - - - - - - - - - - - - - - - - - - - Basic defined  - - - - - - - - - - - - - - - - - - -
const DIR = {
  app: 'app',
  build: 'build',
  dist: 'dist',
  database: 'database',
  sources: 'sources'
}

const JS = {
  devPath: '/js',
  fileSuffix: 'entry'
}

const CSS = {
  devPath: '/scss',
  outPutPath: '/css'
}

// - - - - - - - - - - - - - - - - - - - handle js files - - - - - - - - - - - - - - - - - - -
let jsFileTransform = fileName => {
  return browserify({
    entries: fileName,
    debug: true,
  })
  .transform('babelify', {
    'presets': [
      '@babel/preset-env'
    ],
    'retainLines': true,
    'plugins': [
      '@babel/plugin-transform-runtime',
      '@babel/plugin-transform-async-to-generator'
    ]
  })
  .on('error', err => gutil.log(gutil.colors.red('[Error]'), err.toString()))
  .bundle()
  .pipe(source(path.basename(fileName).replace(`.${JS.fileSuffix}`, '')))
  .pipe(buffer())
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest(`${DIR.build}${JS.devPath}/`))
}

/**
 * es6 transform to es5 by browserify
 */
gulp.task('es6-transform', async () => {
  let files = await globby(`${DIR.app}${JS.devPath}/**/*.${JS.fileSuffix}.js`)
  files.map((fileName, key) => {
    jsFileTransform(fileName)
    key === files.length - 1 && setTimeout(() => browserSync.reload(), 300)
  })
})

/**
 * uglify js
 */
gulp.task('uglify-js', gulp.series('es6-transform', () => {
  return gulp.src(`${DIR.build}${JS.devPath}/**/*.js`)
  .pipe(deporder())
  .pipe(stripDebug())
  .pipe(sourcemaps.init())
  .pipe(uglify({
    output: {
      comments: saveLicense
    }
  }))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest(`${DIR.dist}${JS.devPath}/`))
}))


// - - - - - - - - - - - - - - - - - - - handle ejs files - - - - - - - - - - - - - - - - - - -
gulp.task('ejs-transform', async () => {
  //  load database
  let files = await globby(`${DIR.app}/${DIR.database}/**/*.json`)
  let data = {}
  files.map(filePath => data[path.basename(filePath).replace('.json', '')] = JSON.parse(fs.readFileSync(filePath, 'utf8')))

  return gulp.src(`${DIR.app}/*.ejs`)
  .pipe(plumber())
  .pipe(effectiveJs(data, {}, {ext: '.html'}))
  .pipe(gulp.dest(`${DIR.build}`))
})

gulp.task('html-copy', () => {
  return gulp.src(`${DIR.build}/**/*.html`)
  .pipe(htmlmin({collapseWhitespace: true}))
  .pipe(gulp.dest(`${DIR.dist}/`));
})


// - - - - - - - - - - - - - - - - - - - handle scss files - - - - - - - - - - - - - - - - - - -
gulp.task('scss-transform', () => {
  return gulp.src(`${DIR.app}/${CSS.devPath}/**/*.scss`)
  .pipe(sourcemaps.init())
  .pipe(sass.sync({
    outputStyle: 'nested',
    precision: 3,
  })
  .on('error', sass.logError))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest(`${DIR.build}${CSS.outPutPath}/`))
  .pipe(browserSync ? browserSync.reload({stream: true}) : gutil.noop())
})

gulp.task('clean-css', gulp.series('scss-transform', () => {
  return gulp.src(`${DIR.build}/${CSS.outPutPath}/**/*.css`)
  .pipe(sourcemaps.init())
  .pipe(clean())
  .pipe(autop({browsers: ['last 10 versions']}))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest(`${DIR.dist}${CSS.outPutPath}/`))
}))


// - - - - - - - - - - - - - - - - - - - source - - - - - - - - - - - - - - - - - - -
gulp.task('sources-copy', () => {
  return gulp.src(`${DIR.app}/${DIR.sources}/**/*.*`)
  .pipe(newer(`${DIR.build}/${DIR.sources}/`))
  .pipe(gulp.dest(`${DIR.build}/${DIR.sources}/`))
})

gulp.task('images-minify', () => {
  return gulp.src(`${DIR.build}/${DIR.sources}/**/*.{jpg,jpeg,png,gif,svg}`)
  .pipe(newer(`${DIR.dist}/${DIR.sources}/`))
  .pipe(imagemin([
    imagemin.gifsicle({optimizationLevel: 5}),
    imagemin.jpegtran({optimizationLevel: 5}),
    imagemin.optipng({optimizationLevel: 5}),
  ], {
    verbose: true
  }))
  .pipe(gulp.dest(`${DIR.dist}/${DIR.sources}/`))
})

// - - - - - - - - - - - - - - - - - - - dev server - - - - - - - - - - - - - - - - - - -
let createDevServer = () => {
  return browserSync.init({
    server: `${DIR.build}/`,
    port: 3000,
    // logLevel: 'debug',
    open: 'local',
    notify: true,
    ghostMode: false
  })
}

gulp.task('browsersync',
  gulp.parallel('ejs-transform',
    gulp.parallel('scss-transform',
      gulp.parallel('es6-transform',
        gulp.parallel('sources-copy', () => createDevServer())))))

gulp.task('start', gulp.parallel('browsersync', () => {
  //  ejs
  gulp.watch(`${DIR.app}/**/*.ejs`, gulp.series('ejs-transform')).on('change', browserSync.reload)
  gulp.watch(`${DIR.app}/${DIR.database}/*.json`, gulp.series('ejs-transform')).on('change', browserSync.reload)

  //  js
  gulp.watch(`${DIR.app}${JS.devPath}/**/*.js`, gulp.series('es6-transform'))

  //  scss
  gulp.watch(`${DIR.app}${CSS.devPath}/**/*.scss`, gulp.series('scss-transform'))

  //  source
  gulp.watch(`${DIR.app}/${DIR.sources}/**/*.*`, gulp.series('sources-copy')).on('change', browserSync.reload)
}))


// - - - - - - - - - - - - - - - - - - - build - - - - - - - - - - - - - - - - - - -
gulp.task('build', gulp.parallel('uglify-js', gulp.parallel('clean-css', gulp.parallel('images-minify', gulp.series('html-copy', done => done())))))


//  处理data更新时生成ejs
