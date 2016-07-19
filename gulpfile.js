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

// Sass task
gulp.task('sass', function () {
    gulp
        .src(dirs.src.css + '**/*.{sass,scss}')
        .pipe(sourcemaps.init())
        .pipe(sass({
            noCache: true,
            outputStyle: "compressed"
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(dirs.build + 'css'))
        .pipe(notify({
            message: "You just got super Sassy!"
        }));
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
        .pipe(gulp.dest(dirs.build + 'js'))
        .pipe(notify({
            message: "You're ugly!"
        }));
});

// Vendor task
gulp.task('vendor', function () {


    // Vendor JS
    gulp
        .src(dirs.src.vendor + "**/*.js")
        .pipe(sourcemaps.init())
        .pipe(concat('vendor.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(dirs.build + 'vendor/'))
        .pipe(notify({
            message: "Vendors like haggling!"
        }));

    // // Vendor SASS
    // gulp
    //     .src(dirs.src.vendor + '**/*.{sass,scss}')
    //     .pipe(sourcemaps.init())
    //     .pipe(concat('vendor.min.sass'))
    //     .pipe(sass({
    //         noCache: true,
    //         outputStyle: "compressed"
    //     }))
    //     .pipe(sourcemaps.write('./'))
    //     .pipe(gulp.dest(dirs.build + 'vendor/'))
    //     .pipe(notify({
    //         message: "Vendors just got super Sassy!"
    //     }));
});

// Copy assets
gulp.task('assets', function () {
    gulp
        .src(dirs.src.img + '**/*.*')
        .pipe(gulp.dest(dirs.build + 'img/'))
        .pipe(notify({
            message: "Image assets are liabilities!"
        }));
    gulp
        .src(dirs.src.fonts + '**/*.*')
        .pipe(gulp.dest(dirs.build + 'fonts/'))
        .pipe(notify({
            message: "Font assets are liabilities!"
        }));
});

// Covert pug files
gulp.task('pug', function buildHTML() {
    return gulp
        .src(dirs.src.main + '*.pug')
        .pipe(pug())
        .pipe(gulp.dest(dirs.build))
        .pipe(notify({
            message: "Pugs are cute!"
        }));
});

// ... and then Minify all html
gulp.task('minify', ['pug'], function () {
    return gulp
        .src(dirs.src.main + '*.html')
        .pipe(minify({collapseWhitespace: true, minifyCSS: true, minifyJS: true, removeEmptyAttributes: true}))
        .pipe(gulp.dest(dirs.build))
        .pipe(notify({
            message: "Mini Mouse!"
        }));
});

// Install all bower components
gulp.task('bower', function () {
    gulp
        .src(dirs.src.main + 'bower.json')
        .pipe(gulp.dest(dirs.build));
    return bower({cmd: 'update', directory: 'bower_components', cwd: dirs.build});
});

// Build task
gulp.task('build', ['sass', 'js', 'vendor', 'pug', 'minify', 'assets', 'bower']);
