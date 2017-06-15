var gulp = require('gulp');
var watch = require('gulp-watch');
var less = require('gulp-less');
var clean = require('gulp-clean');
var embedTemplate = require('gulp-angular-embed-templates');
var glob = require('glob');
var exec = require('gulp-exec');
var deploy = require('gulp-gh-pages');
var changed = require('gulp-changed');
var async = require('async');
var fileInclude = require('gulp-file-include');
var XLSX = require('xlsx');
var workbook = XLSX.readFile('Wi-UI.xlsx');
const fs = require('fs');

const BUILD_DIR = {
    root: 'build',
    js: 'build/js',
    css: 'build/css',
    img: 'build/img',
    vendor: 'build/vendor'
};
const SOURCE_DIR = {
    root: 'source',
    main: 'source/*.js',
    js: 'source/js/**/*.js',
    components: 'source/components/**/*',
    appComponents: 'source/app/components/**/*',
    dialogs: 'source/dialogs/**/*',
    html: 'source/html/**/*.html',
    img: 'source/img/**/*',
    less: 'source/less/**/*.less',
    vendor: 'source/vendor/**/*'
};

gulp.task('watch', ['build'], function () {
    // 'include', 'css', 'component', 'appcomponent', 'dialogs', 'js', 'img', 'vendor'
    gulp.watch('source/html/**/*', ['html']);
    gulp.watch('source/less/**/*', ['css']);
    gulp.watch('source/components/**/*', ['component']);
    gulp.watch('source/app/components/**/*', ['appcomponent']);
    gulp.watch('source/js/**/*', ['js']);
    gulp.watch('source/img/**/*', ['img']);
    gulp.watch('source/vendor/**/*', ['vendor']);
    gulp.watch('source/dialogs/**/*', ['dialogs']);
});

gulp.task('component', function (taskCallback) {
    glob(SOURCE_DIR.components, function (err, files) {
        async.each(files, function (f, cb) {
            if (f.includes('.js')) {
                gulp.src(f)
                    .pipe(embedTemplate())
                    .pipe(gulp.dest(BUILD_DIR.js)).on('end', cb);
            } else if (f.includes('.less')) {
                gulp.src(f)
                    .pipe(less())
                    .pipe(gulp.dest(BUILD_DIR.css)).on('end', cb);
            } else if (f.includes('test.html')) {
                gulp.src(f)
                    .pipe(gulp.dest(BUILD_DIR.root)).on('end', cb);
            } else {
                cb();
            }
        }, function (error) {
            if (error) {
                console.log(error);
            }
            return taskCallback();
        });
    });
});

gulp.task('appcomponent', function (taskCallback) {
    glob(SOURCE_DIR.appComponents, function (err, files) {
        async.each(files, function (f, cb) {
            if (f.includes('.js')) {
                gulp.src(f)
                    .pipe(embedTemplate())
                    .pipe(gulp.dest(BUILD_DIR.js))
                    .on('end', cb);
            } else if (f.includes('.less')) {
                gulp.src(f)
                    .pipe(less())
                    .pipe(gulp.dest(BUILD_DIR.css))
                    .on('end', cb);
            } else if (f.includes('test.html')) {
                gulp.src(f)
                    .pipe(gulp.dest(BUILD_DIR.root))
                    .on('end', cb);
            } else {
                cb();
            }
        }, function (error) {
            if (error) {
                console.log(error);
            }
            return taskCallback();
        });
    });
});

gulp.task('dialogs', function (servicesCb) {
    glob(SOURCE_DIR.dialogs, function (err, files) {
        async.each(files, function (f, cb) {
            if(f.includes('.js')){
                gulp.src(f)
                    .pipe(embedTemplate())
                    .pipe(gulp.dest(BUILD_DIR.js))
                    .on('end', cb);
            } else if(f.includes('test.html')){
                gulp.src(f)
                    .pipe(gulp.dest(BUILD_DIR.root))
                    .on('end', cb);
            } else {
                cb();
            }
        },function (err) {
            if(err){
                console.log(err);
            }
            return servicesCb();
        });
    });
});


gulp.task('img', function () {
    var DEST = BUILD_DIR.img;
    return gulp.src(SOURCE_DIR.img).pipe(changed(DEST)).pipe(gulp.dest(DEST));
});
gulp.task('js', function () {
    var DEST = BUILD_DIR.js;
    return gulp.src([SOURCE_DIR.js, SOURCE_DIR.main]).pipe(gulp.dest(DEST));
});
gulp.task('html', function () {
    var DEST = BUILD_DIR.root;
    return gulp.src(SOURCE_DIR.html).pipe(gulp.dest(DEST));
});
gulp.task('css', function () {
    var DEST = BUILD_DIR.css;
    return gulp.src(SOURCE_DIR.less).pipe(less()).pipe(gulp.dest(DEST));
});
gulp.task('vendor', function () {
    var DEST = BUILD_DIR.vendor;
    return gulp.src(SOURCE_DIR.vendor).pipe(changed(DEST)).pipe(gulp.dest(DEST));
});

gulp.task('clean', function () {
    return gulp.src(BUILD_DIR.root)
        .pipe(clean({force: true}));
});

gulp.task('include', function() {
    return gulp.src(['./source/html/index.html'])
        .pipe(fileInclude({
            prefix: '@@',
            basepath: '@file',
            indent: true
        }))
        .pipe(gulp.dest('./build'));
});

const mainTasks = ['include', 'css', 'component', 'appcomponent', 'dialogs', 'js', 'img', 'vendor'];
gulp.task('build', mainTasks, function () {
    glob('build/js/*.js', function (err, files) {
        files.forEach(function (f) {
            if (f.includes('main') && !f.includes('bundle')) {
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
        .pipe(deploy());
});

function to_json(workbook) {
    var text = '';
    workbook.SheetNames.forEach(function (sheetName) {
        var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
        if (roa.length > 0) {
            // result[sheetName] = roa;
            text += 'var ' + sheetName + ' = ' + JSON.stringify(roa, null, 2) + '\n';
        }
    });
    return text;
}

gulp.task('config', function () {
    var config = to_json(workbook);

    fs.writeFile('./build/js/wi-config.js', config, 'utf-8', function (er) {
        if (er) {
            console.log(er);
        }
    })
});