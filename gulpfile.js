'use strict';

const gulp = require('gulp');
const watch = require('gulp-watch');
const less = require('gulp-less');
const clean = require('gulp-clean');
const embedTemplate = require('gulp-angular-embed-templates');
const glob = require('glob');
const exec = require('gulp-exec');
const deploy = require('gulp-gh-pages');
const changed = require('gulp-changed');
const async = require('async');
const fileInclude = require('gulp-file-include');
const XLSX = require('xlsx');
const workbook = XLSX.readFile('Wi-UI.Tung.xlsx');
const rsync = require('gulp-rsync');
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
    directives: 'source/directives/**/*.js',
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
    gulp.watch('source/directives/**/*.js', ['build']);
    gulp.watch('source/js/**/*', ['build']);
    gulp.watch('source/*.js', ['build']);
    gulp.watch('source/img/**/*', ['img']);
    gulp.watch('source/vendor/**/*', ['vendor']);
});

gulp.task('component', function (taskCallback) {
    glob(SOURCE_DIR.components, function (err, files) {
        async.each(files, function (f, cb) {
            if (/\.js$/.test(f)) {
                gulp.src(f)
                    .pipe(embedTemplate())
                    .pipe(gulp.dest(BUILD_DIR.js)).on('end', cb);
            } else if (/\.less$/.test(f)) {
                gulp.src(f)
                    .pipe(less())
                    .pipe(gulp.dest(BUILD_DIR.css)).on('end', cb);
            } else if (/test\.html$/.test(f)) {
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
            if (/.js$/.test(f)) {
                gulp.src(f)
                    .pipe(embedTemplate())
                    .pipe(gulp.dest(BUILD_DIR.js))
                    .on('end', cb);
            } else if (/.less$/.test(f)) {
                gulp.src(f)
                    .pipe(less())
                    .pipe(gulp.dest(BUILD_DIR.css))
                    .on('end', cb);
            } else if (/test.html$/.test(f)) {
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

gulp.task('services', function (callback) {
    glob(SOURCE_DIR.services, function (err, files) {
        async.each(files, function (f, cb) {
                gulp.src(f).pipe(gulp.dest(BUILD_DIR.js))
                    .on('end', cb);
            },
            function (err) {
                if (err) {
                    console.log(err);
                }
                return callback();
            });
    });
});

gulp.task('directives', function (callback) {
    glob(SOURCE_DIR.directives, function (err, files) {
        async.each(files, function (f, cb) {
                gulp.src(f).pipe(gulp.dest(BUILD_DIR.js))
                    .on('end', cb);
            },
            function (err) {
                if (err) {
                    console.log(err);
                }
                return callback();
            });
    });
});

gulp.task('dialogs', function (servicesCb) {
    glob(SOURCE_DIR.dialogs, function (err, files) {
        async.each(files, function (f, cb) {
            if (/.js$/.test(f)) {
                gulp.src(f)
                    .pipe(embedTemplate())
                    .pipe(gulp.dest(BUILD_DIR.js))
                    .on('end', cb);
            } else if (/test.html$/.test(f)) {
                gulp.src(f)
                    .pipe(gulp.dest(BUILD_DIR.root))
                    .on('end', cb);
            } else {
                cb();
            }
        }, function (err) {
            if (err) {
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

gulp.task('include', function () {
    return gulp.src(['./source/html/index.html'])
        .pipe(fileInclude({
            prefix: '@@',
            basepath: '@file',
            indent: true
        }))
        .pipe(gulp.dest('./build'));
});

gulp.task('wi-histogram-include', function () {
    var templateFile = './source/app/components/wi-histogram/template/wi-histogram.html';
    var outputDir = './source/app/components/wi-histogram';

    return gulp.src([templateFile])
        .pipe(fileInclude({
            prefix: '@@',
            basepath: '@file',
            indent: true
        }))
        .pipe(gulp.dest(outputDir));
});

gulp.task('wi-crossplot-include', function () {
    var templateFile = './source/app/components/wi-crossplot/template/wi-crossplot.html';
    var outputDir = './source/app/components/wi-crossplot';

    return gulp.src([templateFile])
        .pipe(fileInclude({
            prefix: '@@',
            basepath: '@file',
            indent: true
        }))
        .pipe(gulp.dest(outputDir));
});

gulp.task('wi-logplot-include', function () {
    var templateFile = './source/app/components/wi-logplot/template/wi-logplot.html';
    var outputDir = './source/app/components/wi-logplot';

    return gulp.src([templateFile])
        .pipe(fileInclude({
            prefix: '@@',
            basepath: '@file',
            indent: true
        }))
        .pipe(gulp.dest(outputDir));
});

gulp.task('wi-explorer-include', function () {
    var templateFile = './source/app/components/wi-explorer/template/wi-explorer.html';
    var outputDir = './source/app/components/wi-explorer';

    return gulp.src([templateFile])
        .pipe(fileInclude({
            prefix: '@@',
            basepath: '@file',
            indent: true
        }))
        .pipe(gulp.dest(outputDir));
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
    var wiUI = require('./preprocess/excel-to-json.js');
    var jsonXML = require('./preprocess/toXML.js');
    wiUI.xlsxToJson(xlsxFile, configFile);
    jsonXML.jsonToXML(configFile);
}

gulp.task('gen-template', ['gen-wi-histogram-template', 'gen-wi-crossplot-template', 'gen-wi-logplot-template', 'gen-wi-explorer-template'], function () {
    var configFile = 'config/ribbon-config.js';
    var xlsxFile = './Wi-UI.Tung.xlsx';
    xlsxToHTML(xlsxFile, configFile);
});

gulp.task('gen-wi-histogram-template', function () {
    var configFile = 'config/wi-histogram.config.js';
    var xlsxFile = './Wi-Histogram.xlsx';
    xlsxToHTML(xlsxFile, configFile);
});

gulp.task('gen-wi-crossplot-template', function () {
    var configFile = 'config/wi-crossplot.config.js';
    var xlsxFile = './Wi-CrossPlot.xlsx';
    xlsxToHTML(xlsxFile, configFile);
});

gulp.task('gen-wi-logplot-template', function () {
    var configFile = 'config/wi-logplot.config.js';
    var xlsxFile = './Wi-LogPlot.Nam.xlsx';
    xlsxToHTML(xlsxFile, configFile);
});
gulp.task('gen-wi-explorer-template', function () {
    var configFile = 'config/wi-explorer.config.js';
    var xlsxFile = './Wi-Explorer.Nam.xlsx';
    xlsxToHTML(xlsxFile, configFile);
});

gulp.task('gen-functions', ['gen-wi-histogram-functions', 'gen-wi-crossplot-functions', 'gen-wi-logplot-functions', 'gen-wi-explorer-functions'], function () {
    var configFile = 'config/ribbon-config.js';
    var xlsxFile = './Wi-UI.Tung.xlsx';
    var templateFile = 'source/js/handlers.js.tmpl';

    var wiUI = require('./preprocess/excel-to-json.js');
    wiUI.genFunctionsFromXlsx(xlsxFile, templateFile, configFile);
});

gulp.task('gen-wi-histogram-functions', function () {
    var configFile = 'config/wi-histogram.config.js';
    var xlsxFile = './Wi-Histogram.xlsx';
    var templateFile = 'source/js/wi-histogram-handlers.js.tmpl';

    var wiUI = require('./preprocess/excel-to-json.js');
    wiUI.genFunctionsFromXlsx(xlsxFile, templateFile, configFile);
});

gulp.task('gen-wi-crossplot-functions', function () {
    var configFile = 'config/wi-crossplot.config.js';
    var xlsxFile = './Wi-CrossPlot.xlsx';
    var templateFile = 'source/js/wi-crossplot-handlers.js.tmpl';

    var wiUI = require('./preprocess/excel-to-json.js');
    wiUI.genFunctionsFromXlsx(xlsxFile, templateFile, configFile);
});

gulp.task('gen-wi-logplot-functions', function () {
    var configFile = 'config/wi-logplot.config.js';
    var xlsxFile = './Wi-LogPlot.Nam.xlsx';
    var templateFile = 'source/js/wi-logplot-handlers.js.tmpl';

    var wiUI = require('./preprocess/excel-to-json.js');
    wiUI.genFunctionsFromXlsx(xlsxFile, templateFile, configFile);
});

gulp.task('gen-wi-explorer-functions', function () {
    var configFile = 'config/wi-explorer.config.js';
    var xlsxFile = './Wi-Explorer.Nam.xlsx';
    var templateFile = 'source/js/wi-explorer-handlers.js.tmpl';

    var wiUI = require('./preprocess/excel-to-json.js');
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

gulp.task('pre', ['gen-template', 'gen-functions'], function () {
});

const mainTasks = ['include', 'css', 'component', 'appcomponent', 'dialogs', 'services', 'directives', 'js', 'img', 'vendor',
                    'wi-histogram-include', 'wi-crossplot-include', 'wi-logplot-include', 'wi-explorer-include'];
gulp.task('build-full', mainTasks, function () {
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
gulp.task('github-page', function () {
    return gulp.src("./build/**/*")
        .pipe(deploy());
});

gulp.task('build', mainTasks, function() {
    gulp.src([
        'build/js/main.js'
    ])
        .pipe(exec('browserify <%= file.path %> -o <%= file.path %>.bundle.js'));
});

gulp.task('build-visualize', mainTasks, function() {
    gulp.src([
        'build/js/main-logplot.js',
        'build/js/main-crossplot.js',
        'build/js/main.js'
    ])
        .pipe(exec('browserify <%= file.path %> -o <%= file.path %>.bundle.js'));
});

gulp.task('deploy', function() {
    return gulp.src("./build/**/*")
        .pipe(rsync({
            root: "build/",
            hostname: "wi.i2g.cloud",
            destination:"/opt/wi-angular/build",
            username: "centos",
			port: 22
        }));
});
gulp.task('deploy-dev', function() {
	return gulp.src("./build/**/*")
        .pipe(rsync({
            root: "build/",
            hostname: "dev.sflow.me",
            destination:"/opt/build",
            username: "ec2-user",
			port: 2221
    }));
});
