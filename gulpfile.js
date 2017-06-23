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
    services: 'source/services/**/*.js',
    html: 'source/html/**/*.html',
    img: 'source/img/**/*',
    less: 'source/less/**/*.less',
    vendor: 'source/vendor/**/*'
};

gulp.task('watch', ['build'], function () {
    // 'include', 'css', 'component', 'appcomponent', 'dialogs', 'services', 'js', 'img', 'vendor'
    gulp.watch('source/html/**/*', ['include']);
    gulp.watch('source/less/**/*', ['css']);
    gulp.watch('source/components/**/*', ['build']);
    gulp.watch('source/app/components/**/*', ['build']);
    gulp.watch('source/dialogs/**/*', ['build']);
    gulp.watch('source/services/**/*.js', ['build']);
    gulp.watch('source/js/**/*', ['build']);
    gulp.watch('source/*.js', ['build']);
    gulp.watch('source/img/**/*', ['img']);
    gulp.watch('source/vendor/**/*', ['vendor']);
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

gulp.task('services', function(callback) {
    glob(SOURCE_DIR.services, function(err, files) {
        async.each(files, function(f, cb) {
            gulp.src(f).pipe(gulp.dest(BUILD_DIR.js))
                .on('end', cb);
        },
        function(err) {
            if(err){
                console.log(err);
            }
            return callback();
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

gulp.task('wi-logplot-include', function() {
    var templateFile = './source/app/components/wi-logplot/template/wi-logplot.html';
    var outputDir = './source/app/components/wi-logplot';
    /*try {
        fs.unlinkSync(outputFile);
    }
    catch(err) {
        console.log(err);
    }*/
    return gulp.src([templateFile])
        .pipe(fileInclude({
            prefix: '@@',
            basepath: '@file',
            indent: true
        }))
        .pipe(gulp.dest(outputDir));
});

const mainTasks = ['include', 'css', 'component', 'appcomponent', 'dialogs', 'services', 'js', 'img', 'vendor'];
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

function xlsxToHTML(xlsxFile, configFile) {
    var wiUI = require('./preprocess/wi-ui-v1.js');
    var jsonXML = require('./preprocess/toXML.js');
    wiUI.xlsxToJson(xlsxFile, configFile);
    jsonXML.jsonToXML(configFile);
}
gulp.task('gen-index', function() {
    var configFile = 'config.js';
    var xlsxFile = './Wi-UI.xlsx';
    xlsxToHTML(xlsxFile, configFile);
});
gulp.task('gen-wi-logplot-template', function() {
    var configFile = 'wi-logplot.config.js';
    var xlsxFile = './Wi-LogPlot.xlsx';
    xlsxToHTML(xlsxFile, configFile);
});

gulp.task('gen-functions', function() {
    var configFile = 'config.js';
    var xlsxFile = './Wi-UI.xlsx';
    var templateFile = 'source/js/handlers.js.tmpl';
    try {
        fs.unlinkSync(templateFile);
    }
    catch(err) {
        console.log(err);
    }
    var wiUI = require('./preprocess/wi-ui-v1.js');
    wiUI.genFunctionsFromXlsx(xlsxFile, templateFile, configFile);
});

gulp.task('gen-wi-logplot-functions', function() {
    var configFile = 'wi-logplot.config.js';
    var xlsxFile = './Wi-LogPlot.xlsx';
    var templateFile = 'source/js/wi-logplot-handlers.js.tmpl';
    try {
        fs.unlinkSync(templateFile);
    }
    catch(err) {
        console.log(err);
    }
    var wiUI = require('./preprocess/wi-ui-v1.js');
    wiUI.genFunctionsFromXlsx(xlsxFile, templateFile, configFile);
});

gulp.task('config', function () {
    var config = to_json(workbook);

    fs.writeFile('./build/js/wi-config.js', config, 'utf-8', function (er) {
        if (er) {
            console.log(er);
        }
    })
});
