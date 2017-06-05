var gulp = require('gulp');
var watch = require('gulp-watch');
var less = require('gulp-less');
var del = require('del');
var clean = require('gulp-clean');
var embedTemplate = require('gulp-angular-embed-templates');
var glob = require('glob');

gulp.task('watch', ['build'], function () {
    gulp.watch('source/components/**/*', ['js:component']);
    gulp.watch('source/html/**/*', ['html']);
    gulp.watch('source/img/**/*', ['img']);
    gulp.watch('source/js/**/*', ['js']);
    gulp.watch('source/config/**/*', ['config']);
    gulp.watch('source/less/**/*', ['css']);
});

gulp.task('js:component', function () {
    glob('source/components/**/*', function (err, files) {
        files.forEach(function (f, i) {
            if (f.includes('.js')) {
                gulp.src(f)
                    .pipe(embedTemplate())
                    .pipe(gulp.dest('build/js'));
            }
        });
    });
});
gulp.task('img', function () {
    return gulp.src('source/img/**/*')
        .pipe(gulp.dest('build/img'));
});
gulp.task('js', function () {
    return gulp.src('source/js/*.js')
        .pipe(gulp.dest('build/js'));
});
gulp.task('config', function () {
    return gulp.src('source/config/*.js')
        .pipe(gulp.dest('build/js'));
});
gulp.task('html', function () {
    return gulp.src('source/html/*.html').pipe(gulp.dest('build'));
});
gulp.task('css', function () {
    return gulp.src('source/less/*.less').pipe(less()).pipe(gulp.dest('build/css'));
});
gulp.task('vendor', function () {
    return gulp.src('source/vendor/**/*').pipe(gulp.dest('build/vendor'));
});

gulp.task('clean', function () {
    return gulp.src('build')
        .pipe(clean({force: true}));
});

gulp.task('build', ['html', 'css', 'js:component', 'js', 'img', 'config', 'vendor']);
gulp.task('default', ['watch']);
