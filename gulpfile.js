// Packages
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const cleanCss = require('gulp-clean-css');
const concat = require('gulp-concat');
const cssbeautify = require('gulp-cssbeautify');
const data = require('gulp-data');
const del = require('del');
const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const npmDist = require('gulp-npm-dist');
const nunjucksRender = require('gulp-nunjucks-render');
const plumber = require('gulp-plumber');
const pug = require('gulp-pug');
const sass = require('gulp-sass')(require('node-sass'));
const sourcemaps = require('gulp-sourcemaps');
const wait = require('gulp-wait');

// Libraries
const { generateRandomNumber } = require('./src/libraries/utility');

// Define paths
const paths = {
    dist: {
        base: './dist/',
        css: './dist/css',
        html: './dist/html',
        assets: './dist/assets',
        img: './dist/assets/img',
        vendor: './dist/vendor'
    },
    dev: {
        base: './html&css/',
        css: './html&css/css',
        html: './html&css/html',
        assets: './html&css/assets',
        img: './html&css/assets/img',
        vendor: './html&css/vendor'
    },
    base: {
        base: './',
        node: './node_modules'
    },
    src: {
        base: './src/',
        css: './src/css',
        components: './src/components',
        nunjucksComponents: './src/components-nunjucks',
        pages: './src/components/pages',
        nunjucksPages: './src/components-nunjucks/pages',
        assets: './src/assets/**/*.*',
        scss: './src/scss',
        node_modules: './node_modules/',
        vendor: './vendor'
    },
    temp: {
        base: './.temp/',
        css: './.temp/css',
        html: './.temp/html',
        pages: './.temp/pages',
        assets: './.temp/assets',
        vendor: './.temp/vendor'
    }
};

// Nunjucks file paths
const nunjucksExtensions = '+(html|njk)';
const nunjucksFilePaths = [
    paths.src.nunjucksComponents + '/**/**/*.' + nunjucksExtensions,
    paths.src.nunjucksComponents + '/**.' + nunjucksExtensions,
    paths.src.nunjucksComponents + '/**/*.' + nunjucksExtensions,
    paths.src.nunjucksComponents + '/*.' + nunjucksExtensions,

    '!' + paths.src.nunjucksPages + '/*.' + nunjucksExtensions,
    '!' + paths.src.nunjucksPages + '/**/*.' + nunjucksExtensions,
];

// Nunjucks file pages paths
const nunjucksFilePagesPaths = [
    paths.src.nunjucksPages + '/**/*.' + nunjucksExtensions,
    paths.src.nunjucksPages + '/*.' + nunjucksExtensions,
];

// Pug file paths
const pugFilePaths = [
    paths.src.components + '/**/**/*.pug',
    paths.src.components + '/**.pug',
    paths.src.components + '/**/*.pug',
    paths.src.components + '/*.pug',

    '!' + paths.src.pages + '/*.pug',
    '!' + paths.src.pages + '/**/*.pug',
];

// Pug file pages paths
const pugFilePagesPaths = [
    paths.src.pages + '/**/*.pug',
    paths.src.pages + '/*.pug',
];

// SCSS file pages paths
const scssFilePaths = [
    paths.src.scss + '/app.scss',
    paths.src.components + '/**/**/*.scss',
    paths.src.components + '/**/*.scss'
];

// Pug options
const pluginPugOptions = {
    locals: {
        generateRandomNumber
    }
};

// Gulp data options
const pluginDataOptions = function (file) {
    return { require };
};

// Gulp data options
const pluginNunjucksRenderOptions = {
    data: {
        generateRandomNumber
    },
    path: [paths.src.nunjucksComponents + '/']
};

// Compile SCSS
gulp.task('scss', function () {
    return gulp.src(scssFilePaths)
        .pipe(wait(500))
        .pipe(sourcemaps.init())
        .pipe(
            sass({
                includePaths: ['node_modules']
            })
            .on('error', sass.logError)
        )
        .pipe(concat('all.css')) // concat will combine all files declared in your "src"
        .pipe(autoprefixer({
            overrideBrowserslist: ['> 1%']
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.temp.css))
        .pipe(browserSync.stream());
});

gulp.task('pug', function () {
    return gulp.src(pugFilePaths, {
        base: paths.src.components,
        since: gulp.lastRun('pug')
    })
        .pipe(data(pluginDataOptions))
        .pipe(plumber())
        .pipe(pug(pluginPugOptions))
        .pipe(gulp.dest(paths.temp.base))
        .pipe(browserSync.stream());
});

gulp.task('pugPages', function () {
    return gulp.src(pugFilePagesPaths, {
        base: paths.src.pages,
        since: gulp.lastRun('pugPages')
    })
        .pipe(data(pluginDataOptions))
        .pipe(plumber())
        .pipe(pug(pluginPugOptions))
        .pipe(gulp.dest(paths.temp.base))
        .pipe(browserSync.stream());
});

gulp.task('nunjucks', function () {
    return gulp.src(nunjucksFilePaths, {
        base: paths.src.nunjucksComponents,
        since: gulp.lastRun('nunjucks')
    })
        .pipe(data(pluginDataOptions))
        .pipe(plumber())
        .pipe(nunjucksRender(pluginNunjucksRenderOptions))
        .pipe(gulp.dest(paths.temp.base))
        .pipe(browserSync.stream());
});

gulp.task('nunjucksPages', function () {
    return gulp.src(nunjucksFilePagesPaths, {
        base: paths.src.nunjucksPages,
        since: gulp.lastRun('nunjucksPages')
    })
        .pipe(data(pluginDataOptions))
        .pipe(plumber())
        .pipe(nunjucksRender(pluginNunjucksRenderOptions))
        .pipe(gulp.dest(paths.temp.base))
        .pipe(browserSync.stream());
});

gulp.task('assets', function () {
    return gulp.src([paths.src.assets])
        .pipe(gulp.dest(paths.temp.assets))
        .pipe(browserSync.stream());
});

gulp.task('vendor', function() {
    return gulp.src(npmDist(), { base: paths.src.node_modules })
      .pipe(gulp.dest(paths.temp.vendor));
});

gulp.task(
    'serve',
    gulp.series(
        [
            'scss',
            'pug',
            'pugPages',
            // 'nunjucks',
            // 'nunjucksPages',
            'assets',
            'vendor'
        ],
        function () {
            browserSync.init({
                server: paths.temp.base
            });

            gulp.watch(scssFilePaths, gulp.series('scss'));
            // gulp.watch(nunjucksFilePaths, gulp.series('nunjucks'));
            // gulp.watch(nunjucksFilePagesPaths, gulp.series('nunjucksPages'));
            gulp.watch(pugFilePaths, gulp.series('pug'));
            gulp.watch(pugFilePagesPaths, gulp.series('pugPages'));
            gulp.watch([paths.src.assets], gulp.series('assets'));
            gulp.watch([paths.src.vendor], gulp.series('vendor'));
        }
    )
);

// Beautify CSS
gulp.task('beautify:css', function () {
    return gulp.src([
        paths.dev.css + '/all.css'
    ])
        .pipe(cssbeautify())
        .pipe(gulp.dest(paths.dev.css))
});

// Minify CSS
gulp.task('minify:css', function () {
    return gulp.src([
        paths.dist.css + '/all.css'
    ])
    .pipe(cleanCss())
    .pipe(gulp.dest(paths.dist.css))
});

// Minify Html
gulp.task('minify:html', function () {
    return gulp.src([paths.dist.html + '/**/*.html'])
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest(paths.dist.html))
});

// Clean
gulp.task('clean:dist', function () {
    return del([paths.dist.base]);
});

gulp.task('clean:dev', function () {
    return del([paths.dev.base]);
});

// Compile and copy scss/css
gulp.task('copy:dist:css', function () {
    return gulp.src([paths.src.components + '/**/**/*.scss', paths.src.scss + '/app.scss'])
        .pipe(wait(500))
        .pipe(sourcemaps.init())
        .pipe(
            sass({
                includePaths: ['node_modules']
            })
            .on('error', sass.logError)
        )
        .pipe(concat('all.css')) // concat will combine all files declared in your "src"
        .pipe(autoprefixer({
            overrideBrowserslist: ['> 1%']
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.dist.css))
});

gulp.task('copy:dev:css', function () {
    return gulp.src([paths.src.components + '/**/**/*.scss', paths.src.scss + '/app.scss'])
        .pipe(wait(500))
        .pipe(sourcemaps.init())
        .pipe(
            sass({
                includePaths: ['node_modules']
            })
            .on('error', sass.logError)
        )
        .pipe(concat('all.css')) // concat will combine all files declared in your "src"
        .pipe(autoprefixer({
            overrideBrowserslist: ['> 1%']
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.dev.css))
});

// Copy nunjucks
gulp.task('copy:dist:nunjucks', function () {
    return gulp.src(nunjucksFilePagesPaths)
        .pipe(data(pluginDataOptions))
        .pipe(plumber())
        .pipe(nunjucksRender(pluginNunjucksRenderOptions))
        .pipe(gulp.dest(paths.dist.base));
});

gulp.task('copy:dev:nunjucks', function () {
    return gulp.src(nunjucksFilePagesPaths)
        .pipe(data(pluginDataOptions))
        .pipe(plumber())
        .pipe(nunjucksRender(pluginNunjucksRenderOptions))
        .pipe(gulp.dest(paths.dev.base));
});

// Copy pug
gulp.task('copy:dist:pug', function () {
    return gulp.src(pugFilePagesPaths, {
        base: paths.src.pages,
        since: gulp.lastRun('copy:dist:pug')
    })
        .pipe(data(pluginDataOptions))
        .pipe(plumber())
        .pipe(pug(pluginPugOptions))
        .pipe(gulp.dest(paths.dist.base));
});

gulp.task('copy:dev:pug', function () {
    return gulp.src(pugFilePagesPaths, {
        base: paths.src.pages,
        since: gulp.lastRun('copy:dev:pug')
    })
        .pipe(data(pluginDataOptions))
        .pipe(plumber())
        .pipe(pug(Object.assign(pluginPugOptions, {
            pretty: true
        })))
        .pipe(gulp.dest(paths.dev.base));
});

// Copy assets
gulp.task('copy:dist:assets', function () {
    return gulp.src(paths.src.assets)
        .pipe(gulp.dest(paths.dist.assets))
});

gulp.task('copy:dev:assets', function () {
    return gulp.src(paths.src.assets)
        .pipe(gulp.dest(paths.dev.assets))
});

// Copy node_modules to vendor
gulp.task('copy:dist:vendor', function() {
    return gulp.src(npmDist(), { base: paths.src.node_modules })
      .pipe(gulp.dest(paths.dist.vendor));
});

gulp.task('copy:dev:vendor', function() {
    return gulp.src(npmDist(), { base: paths.src.node_modules })
      .pipe(gulp.dest(paths.dev.vendor));
});

gulp.task('build:dev', gulp.series(
    'clean:dev',
    'copy:dev:css',
    // 'copy:dev:nunjucks',
    'copy:dev:pug',
    'copy:dev:assets',
    'beautify:css',
    'copy:dev:vendor'
));
gulp.task('build:dist', gulp.series(
    'clean:dist',
    'copy:dist:css',
    // 'copy:dist:nunjucks',
    'copy:dist:pug',
    'copy:dist:assets',
    'minify:css',
    'minify:html',
    'copy:dist:vendor'
));

// Default
gulp.task('default', gulp.series('serve'));