const gulp = require('gulp')
const mocha = require('gulp-mocha')
const eslint = require('gulp-eslint')

const running = {}
const watching = {}

gulp.task('test', () => {
  running.test = ['test/**/*.js', 'lib/**/*.js']
  return gulp.src(running.test[0])
    .pipe(mocha({reporter: 'spec'}))
})

gulp.task('lint', () => {
  running.lint = ['test/**/*.js', 'lib/**/*.js', 'gulpfile.js']
  return gulp.src(running.lint)
    .pipe(eslint())
    .pipe(eslint.format())
})

gulp.task('watch', () => {
  return Object
    .keys(running)
    .filter(key => !watching[key])
    .map(key => {
      watching[key] = true
      return gulp.watch(running[key], [key])
    })
})
