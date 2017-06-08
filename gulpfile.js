var gulp = require('gulp');
var watch = require('gulp-watch');
var less = require('gulp-less');
var clean = require('gulp-clean');
var embedTemplate = require('gulp-angular-embed-templates');
var glob = require('glob');
var exec = require('gulp-exec');
var inject = require('gulp-inject');
var runSequence = require('run-sequence');
var deploy = require('gulp-gh-pages');

gulp.task('watch', ['build'], function () {
    gulp.watch('source/components/**/*', ['component']);
    gulp.watch('source/html/**/*', ['html']);
    gulp.watch('source/img/**/*', ['img']);
    gulp.watch('source/js/**/*', ['js']);
    gulp.watch('source/config/**/*', ['config']);
    gulp.watch('source/less/**/*', ['css']);
    gulp.watch('source/vendor/**/*', ['vendor']);
});

gulp.task('component', function () {
    glob('source/components/**/*', function (err, files) {
        files.forEach(function (f) {
            if (f.includes('.js')) {
                gulp.src(f)
                    .pipe(embedTemplate())
                    .pipe(gulp.dest('build/js'));
            }
            if (f.includes('.less')) {
                gulp.src(f)
                    .pipe(less())
                    .pipe(gulp.dest('build/css'));
            }
            if (f.includes('test.html')) {
                gulp.src(f)
                    .pipe(gulp.dest('build'));
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

gulp.task('index', function () {
    var target = gulp.src('build/*.html');
    // It's not necessary to read the files (will speed up things), we're only after their paths:
    var sources = gulp.src(['build/js/*.js', 'build/css/*.css'], {read: false});

    return target.pipe(inject(sources, {relative: true}))
        .pipe(gulp.dest('build'));
});

const mainTasks = ['html', 'css', 'component', 'js', 'img', 'config', 'vendor'];
gulp.task('build', mainTasks, function () {
    glob('build/js/*.js', function (err, files) {
        files.forEach(function (f) {
            if (f.includes('main')) {
                gulp.src(f)
                    .pipe(exec('browserify <%= file.path %> -o <%= file.path %>.bundle.js'));
            }
        });
    });
});
gulp.task('default', ['watch']);

/**
 * Push build to gh-pages
 */
gulp.task('deploy', function () {
    return gulp.src("./build/**/*")
        .pipe(deploy())
});