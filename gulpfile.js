var gulp = require('gulp'),
    size = require('gulp-size'),
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
        .pipe(size({title: '(original)'}))
        .pipe(rename('zepto.autocomplete.min.js'))
        .pipe(sourcemaps.init())
            .pipe(uglify())
            .pipe(size({title: '(minified)'}))
            .pipe(size({title: '(gzipped)', gzip: true}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('.'));
});

gulp.task('watch', function() {
    return gulp.watch(path, ['build']);
});

gulp.task('default', ['build', 'watch']);
