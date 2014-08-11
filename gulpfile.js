var gulp = require('gulp'),
    rename = require('gulp-rename'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps');

var path = ['zepto.autocomplete.js'];

gulp.task('jshint', function() {
    return gulp.src(path)
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('build', ['jshint'], function() {
    return gulp.src(path)
        .pipe(rename('zepto.autocomplete.min.js'))
        .pipe(sourcemaps.init())
            .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('.'));
});

gulp.task('watch', function() {
    return gulp.watch(path, ['build']);
});

gulp.task('default', ['build', 'watch']);
