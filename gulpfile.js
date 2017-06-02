var gulp = require('gulp');
var watch = require('gulp-watch');
var less = require('gulp-less');
var open = require('gulp-open');
var embedTemplate = require('gulp-angular-embed-templates');
var glob = require('glob');

gulp.task('watch', function () {
    gulp.watch('source/components/**/*', ['js:component']);
    gulp.watch('source/html/**/*', ['html']);
    gulp.watch('source/img/**/*', ['img']);
    gulp.watch('source/js/**/*', ['js']);
    gulp.watch('source/less/**/*', ['css']);
});

gulp.task('js:component', function () {
    glob('source/components/**/*', function (err, files) {
        files.forEach(function (f, i) {
            gulp.src(f)
                .pipe(embedTemplate())
                .pipe(gulp.dest('build/js'));
        });
    });
});
gulp.task('img', function () {
    return gulp.src('source/img/*')
        .pipe(gulp.dest('build/img'));
});
gulp.task('js', function () {
    return gulp.src('source/js/*.js')
        .pipe(gulp.dest('build/js'))
        .pipe(live_reload());
});
gulp.task('html', function () {
    return gulp.src('source/html/*.html').pipe(gulp.dest('build'));
});
gulp.task('css', function () {
    return gulp.src('source/less/*.less').pipe(less()).pipe(gulp.dest('build/css'));
});


gulp.task('run', function () {
    gulp.src('build/index.html').pipe(open());
});
gulp.task('build', ['html', 'css', 'js:component', 'js', 'img']);
gulp.task('default', ['watch']);
