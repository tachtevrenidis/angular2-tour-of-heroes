var gulp = require('gulp');
var del = require('del');
var glob = require('glob');
var $ = require('gulp-load-plugins')({lazy: true});
var lite = require('lite-server');
var argv = require('yargs').argv;
var replace = require('gulp-replace');
var gulpif = require('gulp-if');

var config = {
    build: './dist/build.js',
    plugins: [
        'node_modules/core-js/client/shim.min.js',
        'node_modules/zone.js/dist/zone.js'
    ],
    index: {
        run: 'index.html',
        aot: 'index-aot.html',
        min: 'index-min.html',
        aotgz: 'index-aot-gzip.html',
        jit: 'index-jit.html'
    },
    dest: './dist',
    root: './'
};

gulp.task('help', $.taskListing);
gulp.task('default', ['help']);

gulp.task('prep-manifest', function() {
    gulp.src(['manifest.yml'])
        .pipe(gulpif(argv.pullrequestid != 'false', replace(/(host:.+)/g, '$1-PR' + argv.pullrequestid)))
        .pipe(gulpif(argv.pullrequestid == 'false' && argv.branchname != "master", replace(/(host:.+)/g, '$1-' + argv.branchname)))
        .pipe(gulpif(argv.pullrequestid != 'false', replace(/(name:.+)/g, '$1-PR' + argv.pullrequestid)))
        .pipe(gulpif(argv.pullrequestid == 'false' && argv.branchname != "master", replace(/(name:.+)/g, '$1-' + argv.branchname)))
        .pipe(gulp.dest('.'));
});

gulp.task('prep-package', function() {
    gulp.src(['package.json'])
        .pipe(gulpif(argv.pullrequestid != 'false', replace(/(\"name\":\ +)(.+)(\")/g, "$1\"@ecm/$2_PR" + argv.pullrequestid + "\"")))
        .pipe(gulpif(argv.pullrequestid == 'false' && argv.branchname != "master", replace(/(\"name\":\ +)(.+)(\")/g, "$1\"@ecm/$2_" + argv.branchname + "\"")))
        .pipe(gulp.dest('.'));
});

gulp.task('gzip', function () {
    log('gzipping');
    var source = [].concat(config.plugins, config.build);

    return gulp.src(source)
        .pipe($.gzip())
        .pipe(gulp.dest(config.dest));
});

gulp.task('copy-aot-gzip', ['gzip', 'clean'], function () {
    log('copy aot gzip');
    return copyIndex(config.index.aotgz);
});

gulp.task('copy-aot', ['clean'], function () {
    log('copy aot');
    return copyIndex(config.index.aot);
});

gulp.task('copy-min', ['clean'], function () {
    log('copy min');
    return copyIndex(config.index.min);
});

function copyIndex(source) {
    return gulp.src(source)
        .pipe($.rename(config.index.run))
        .pipe(gulp.dest(config.root));
}

gulp.task('copy-jit', ['clean'], function () {
    log('copy jit');
    return copyIndex(config.index.jit);
});

gulp.task('clean', function (done) {
    log('clean');
    del([config.index.run]).then(paths => { done(); });
});

gulp.task('clean-js', function() {
    return glob('./app/**/*.ts', function(err, files) {
        del(files.map(filterJs));
    })
});

gulp.task('clean-map', function() {
    return glob('./app/**/*.ts', function(err, files) {
        del(files.map(filterMap));
    })
});

var filterJs = function (file, ext) {
    return file.replace(/.ts$/, ".js");
};

var filterMap = function (file, ext) {
    return file.replace(/.ts$/, ".js.map");
};

function log(msg) {
    if (typeof (msg) === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item)) {
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    } else {
        $.util.log($.util.colors.blue(msg));
    }
}

module.exports = gulp;
