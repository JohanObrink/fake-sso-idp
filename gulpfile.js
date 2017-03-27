const gulp = require('gulp')
const mocha = require('gulp-mocha')

const running = {}
const watching = {}

gulp.task('test', () => {
  running.test = ['test/**/*.js', 'lib/**/*.js']
  return gulp.src(running.test[0])
    .pipe(mocha({reporter: 'spec'}))
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
