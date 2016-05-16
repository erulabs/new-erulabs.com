/*eslint-disable no-console */
'use strict'

const CLIENT_PORT = process.env.CLIENT_PORT || 8080
const ASSET_URL = process.env.ASSET_URL || '/'
const COMPRESS = process.env.COMPRESS || false
const OUTPUT = '_build'

const gulp = require('gulp')
const connect = require('gulp-connect')
const less = require('gulp-less')
const rename = require('gulp-rename')
const modRewrite = require('connect-modrewrite')
const watch = require('gulp-watch')
const webpack = require('gulp-webpack')
const seq = require('run-sequence')
const uglify = require('gulp-uglify')
const jade = require('gulp-jade')
const stripCssComments = require('gulp-strip-css-comments')
const removeEmptyLines = require('gulp-remove-empty-lines')
const fs = require('fs')

gulp.task('posts', function () {
  let postIndex = []
  try {
    postIndex = require('./src/postIndex.json').posts
  } catch (e) {
    postIndex = []
  }
  const originalNumberOfPosts = postIndex.length

  fs.readdir('src/posts', function (err, posts) {
    if (err) {
      return new Error(err)
    }
    for (let p in posts) {
      const post = posts[p]
      let found = false
      for (let pI in postIndex) {
        if (postIndex[pI].file + '.jade' === post) {
          found = true
        }
      }
      if (!found && post.substr(0, 1) !== '_') {
        const postIndexObj = {
          file: post.replace(/\.jade$/, ''),
          date: fs.statSync('src/posts/' + post).ctime.valueOf()
        }
        postIndex.push(postIndexObj)
      }
    }
    if (originalNumberOfPosts !== postIndex.length) {
      fs.writeFile(
        'src/postIndex.json',
        JSON.stringify({
          posts: postIndex
        }, null, '  '),
        function (writeErr) {
          if (writeErr) {
            return new Error(writeErr)
          }
          seq('webpack')
        }
      )
    }
  })
  return gulp.src(['src/posts/*.jade'])
    .pipe(jade())
    .pipe(removeEmptyLines())
    .pipe(gulp.dest(OUTPUT + '/posts'))
    .pipe(connect.reload())
})

gulp.task('less', function () {
  return gulp.src(['src/style/index.less'])
    .pipe(less({
      compress: COMPRESS,
      rootpath: ASSET_URL
    }))
    .on('error', function (err) {
      console.log(err.toString())
      this.emit('end')
    })
    .pipe(stripCssComments({ all: true }))
    .pipe(removeEmptyLines())
    .pipe(rename('bundle.css'))
    .pipe(gulp.dest(OUTPUT + '/assets'))
    .pipe(connect.reload())
})

gulp.task('webpack', function () {
  const stream = gulp.src('./src/index.js')
    .pipe(webpack({
      module: {
        loaders: [
          { test: /\.js$/, exclude: /node_modules/, loader: 'babel' }
        ]
      },
      output: { filename: 'bundle.js' }
    }))
    .on('error', function (err) {
      console.log(err.toString())
      this.emit('end')
    })
  if (COMPRESS) {
    stream.pipe(uglify())
  }
  stream.pipe(gulp.dest(OUTPUT + '/assets'))
    .pipe(connect.reload())
})

gulp.task('client_assets', function () {
  // TODO: Compress images?
  // TODO: Compress models?
  // TODO: Automatically upload to a CDN?
  return gulp.src('./src/assets/**/*')
    .pipe(gulp.dest(OUTPUT + '/assets'))
    .pipe(connect.reload())
    .on('error', function (err) {
      console.log(err.toString())
      this.emit('end')
    })
})

gulp.task('html', function () {
  // TODO: Automatically upload to a CDN?
  return gulp.src('./src/index.html')
    .pipe(gulp.dest(OUTPUT))
    .pipe(connect.reload())
    .on('error', function (err) {
      console.log(err.toString())
      this.emit('end')
    })
})

gulp.task('semantic:setup', function () {
  gulp.src('src/style/semantic.less')
    .pipe(gulp.dest('node_modules/semantic-ui-less/'))
  gulp.src('src/style/theme.config')
    .pipe(gulp.dest('node_modules/semantic-ui-less/'))
  return gulp.src('node_modules/semantic-ui-less/themes/default/assets/fonts/*')
    .pipe(gulp.dest(OUTPUT + '/themes/default/assets/fonts/'))
    .pipe(connect.reload())
})

gulp.task('semantic:ui', function () {
  // Compile semantic into a vendor.css bundle
  gulp.src('node_modules/semantic-ui-less/semantic.less')
    .pipe(less({
      compress: process.env.COMPRESS || false,
      rootpath: '/'
    }))
    .on('error', function (err) {
      console.log(err.toString())
      this.emit('end')
    })
    .pipe(stripCssComments({ all: true }))
    .pipe(removeEmptyLines())
    .pipe(rename('vendor.css'))
    .pipe(gulp.dest(OUTPUT + '/assets'))
    .pipe(connect.reload())
})

const defaultTasks = [
  'html', 'posts', 'semantic:ui', 'less', 'webpack', 'client_assets', 'semantic:setup'
]

gulp.task('default', function () {
  seq('semantic:setup', defaultTasks)
})

gulp.task('connect', ['default'], function () {
  connect.server({
    root: OUTPUT,
    port: CLIENT_PORT,
    livereload: true,
    middleware: function () {
      return [modRewrite([
        '^(?!\/assets|\/posts).*$ /index.html' // Proxy all requests to index
      ])]
    }
  })
})

gulp.task('watch', ['connect'], function () {
  watch(['./src/style/*.less'], function () { seq('less') })
  watch(['./src/style/theme.config', './src/style/semantic.less'], function () {
    seq('semantic:setup', 'semantic:ui')
  })
  watch(['./src/*.html'], function () { seq('html') })
  watch(['./src/posts/*'], function () { seq('posts') })
  watch(['./src/index.js', './src/scripts/*.js', './src/postIndex.json'], function () {
    seq('webpack')
  })
  watch(['./src/assets/*'], function () { seq('client_assets') })
})
