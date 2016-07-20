// Include gulp and plugins
var gulp = require('gulp'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    watch = require('gulp-watch'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    sourcemaps = require('gulp-sourcemaps'),
    rename = require('gulp-rename'),
    pug = require('gulp-pug'),
    bower = require('gulp-bower'),
    gzip = require('gulp-gzip'),
    tar = require('gulp-tar'),
    args = require('yargs').argv,
    gulpif = require('gulp-if'),
    duration = require('gulp-duration'),
    size = require('gulp-size'),
    flatten = require('gulp-flatten'),
    clean = require('gulp-clean'),
    runSequence = require('run-sequence'),
    minify = require('gulp-html-minifier');

// Init dirs
var dirs = {
    src: {
        main: './src/',
        img: './src/img/',
        fonts: './src/fonts/',
        css: './src/css/',
        js: './src/js/',
        vendor: './src/vendor/'
    },
    build: './build/'
};

/*
 *
 *  Build tasks
 *
 */

// Sass task
gulp.task('sass', function () {
    gulp
        .src(dirs.src.css + '**/*.{sass,scss}')
        .pipe(sourcemaps.init())
        .pipe(sass({
            noCache: true,
            outputStyle: "compressed"
        }))
        .pipe(flatten())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(dirs.build + 'css'));
});


// Watch CSS task
gulp.task('css', ['sass'], function () {
    gulp
        .src(dirs.build + 'css/**/*.css')
        .pipe(sourcemaps.init())
        .pipe(concat("style.min.css"))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(dirs.build + 'css'));
});

// JS task
gulp.task('js', function () {
    return gulp
        .src(dirs.src.js + "**/*.js")
        .pipe(sourcemaps.init())
        .pipe(concat('scripts.min.js'))
        .pipe(gulp.dest(dirs.build + 'js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(dirs.build + 'js'));
});

// Vendor task
gulp.task('vendor', ['vendor-js', 'vendor-css']);

// Vendor CSS
gulp.task('vendor-css', ['vendor-sass'], function () {
    gulp
        .src(dirs.build + 'vendor/**/*.css')
        .pipe(sourcemaps.init())
        .pipe(concat('vendor.min.css'))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(dirs.build + 'vendor/'))
        .pipe(notify({
            onLast: true,
            message: "Vendors just got minified in style!"
        }));
});

// Vendor SASS
gulp.task('vendor-sass', function () {
    gulp
        .src(dirs.src.vendor + '**/*.{sass,scss}')
        .pipe(sourcemaps.init())
        .pipe(sass({
            noCache: true,
            outputStyle: "compressed"
        }))
        .pipe(rename({dirname: dirs.build + 'vendor/'}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(dirs.build + 'vendor/'));
});

// Vendor JS
gulp.task('vendor-js', function () {
    gulp
        .src(dirs.src.vendor + "**/*.js")
        .pipe(sourcemaps.init())
        .pipe(concat('vendor.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(dirs.build + 'vendor/'));
});

// Copy assets
gulp.task('assets', ['img-assets', 'font-assets'], function () {
    return gulp.src(dirs.src.main + 'bower.json')
        .pipe(gulp.dest(dirs.build))
});

gulp.task('img-assets', function () {
    return gulp
        .src(dirs.src.img + '**/*.*')
        .pipe(gulp.dest(dirs.build + 'img/'));
});
gulp.task('font-assets', function () {
    return gulp
        .src(dirs.src.fonts + '**/*.*')
        .pipe(gulp.dest(dirs.build + 'fonts/'));
});

// Covert pug files
gulp.task('pug', function () {
    return gulp
        .src(dirs.src.main + '*.pug')
        .pipe(pug())
        .pipe(gulp.dest(dirs.build));
});

// ... and then Minify all html
gulp.task('minify', ['pug'], function () {
    return gulp
        .src(dirs.src.main + '*.html')
        .pipe(minify({collapseWhitespace: true, minifyCSS: true, minifyJS: true, removeEmptyAttributes: true}))
        .pipe(gulp.dest(dirs.build));
});

// Install all bower components
gulp.task('bower', function () {
    return bower({cmd: 'install', directory: 'bower_components', cwd: dirs.build});
});

// Clean the build directory
gulp.task('clean', function () {
    return gulp
        .src(dirs.build, {read: false})
        .pipe(clean({force: true}));
});

// Build task
gulp.task('default', function () {
    return runSequence('build');
})
gulp.task('build', function () {
    return runSequence('clean', ['assets'], ['js', 'pug', 'bower', 'sass', 'vendor-sass', 'vendor-js'], ['minify', 'css', 'vendor-css']);
});

// Release task
gulp.task('release', ['build'], function () {
    if (args.name !== 'undefined') {
        gulp.src(dirs.build + '**/*')
            .pipe(tar(args.name + '.tar'))
            .pipe(gzip())
            .pipe(gulp.dest('.'));
    } else {
        gulp.src(dirs.build + '**/*')
            .pipe(tar('release.tar'))
            .pipe(gzip())
            .pipe(gulp.dest('.'));
    }
});


/*
 *
 *  Watch Tasks
 *
 */

// Default
gulp.task('sources', ['watch-vendor-css', 'watch-css', 'watch-js', 'watch-vendor-js', 'watch-pug']);

// Watch
gulp.task('watch', function () {
    gulp.watch(dirs.src.vendor + "**/*.{sass,scss,css}", ['watch-vendor-css']);
    gulp.watch(dirs.src.vendor + "**/*.js", ['watch-vendor-js']);
    gulp.watch(dirs.src.css + "**/*.{sass,scss,css}", ['watch-css']);
    gulp.watch(dirs.src.js + "**/*.js", ['watch-js']);
    gulp.watch(dirs.src.main + "*.pug", ['watch-pug']);
});

// Watch Vendor Sass task
gulp.task('watch-vendor-sass', function () {
    return gulp
        .src(dirs.src.vendor + '**/*.{sass,scss}')
        .pipe(sourcemaps.init())
        .pipe(sass({}))
        .pipe(flatten())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(dirs.src.vendor));
});

// Watch Vendor CSS task
gulp.task('watch-vendor-css', ['watch-vendor-sass'], function () {
    gulp
        .src(dirs.src.vendor + '**/*.css')
        .pipe(sourcemaps.init())
        .pipe(concat("vendor.min.css"))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(dirs.src.vendor));
});


// Watch Sass task
gulp.task('watch-sass', function () {
    gulp
        .src(dirs.src.css + '**/*.{sass,scss}')
        .pipe(sourcemaps.init())
        .pipe(sass({}))
        .pipe(flatten())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(dirs.src.css));
});

// Watch CSS task
gulp.task('watch-css', ['watch-sass'], function () {
    gulp
        .src(dirs.src.css + '**/*.css')
        .pipe(sourcemaps.init())
        .pipe(concat("style.min.css"))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(dirs.src.css));
});

// Watch JS task
gulp.task('watch-js', function () {
    return gulp
        .src(dirs.src.js + "**/*.js")
        .pipe(sourcemaps.init())
        .pipe(concat('scripts.min.js'))
        .pipe(gulp.dest(dirs.build + 'js'))
        // .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(dirs.src.js));
});

// Watch Vendor JS
gulp.task('watch-vendor-js', function () {
    gulp
        .src(dirs.src.vendor + "**/*.js")
        .pipe(sourcemaps.init())
        .pipe(concat('vendor.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(dirs.src.vendor));
});


// Covert pug files
gulp.task('watch-pug', function () {
    return gulp
        .src(dirs.src.main + '*.pug')
        .pipe(pug())
        .pipe(gulp.dest(dirs.src.main));
});
