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
        components: './src/components/',
        pages: './src/components/pages/',
        html: './src/html/**/*.html',
        assets: './src/assets/**/*.*',
        partials: './src/partials/**/*.html',
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

// HTML file paths
const htmlExtensions = '+(html|njk)';
const htmlFilePaths = [
    paths.src.components + '**/**/*.' + htmlExtensions,
    paths.src.components + '**.' + htmlExtensions,
    paths.src.components + '**/*.' + htmlExtensions,
    paths.src.components + '*.' + htmlExtensions,

    '!' + paths.src.pages + '*.' + htmlExtensions,
    '!' + paths.src.pages + '**/*.' + htmlExtensions,
];

// HTML file pages paths
const htmlFilePagesPaths = [
    paths.src.pages + '**/*.' + htmlExtensions,
    paths.src.pages + '*.' + htmlExtensions,
];

// Pug file paths
const pugFilePaths = [
    paths.src.components + '**/**/*.pug',
    paths.src.components + '**.pug',
    paths.src.components + '**/*.pug',
    paths.src.components + '*.pug',

    '!' + paths.src.pages + '*.pug',
    '!' + paths.src.pages + '**/*.pug',
];

// Pug file pages paths
const pugFilePagesPaths = [
    paths.src.pages + '**/*.pug',
    paths.src.pages + '*.pug',
];

// SCSS file pages paths
const scssFilePaths = [
    paths.src.scss + '/app.scss',
    paths.src.components + '**/**/*.scss',
    paths.src.components + '**/*.scss'
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
    path: ['src/components/']
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
        base: './src/components',
        since: gulp.lastRun('pug')
    })
        // .pipe(data(function (file) {
        //     console.log(file.path);
        //     return JSON.parse(fs.readFileSync('./src/dummy/' + path.basename(file.path) + '.json'));
        // }))
        .pipe(data(pluginDataOptions))
        .pipe(plumber())
        .pipe(pug(pluginPugOptions))
        .pipe(gulp.dest(paths.temp.base))
        .pipe(browserSync.stream());
});

gulp.task('pugPages', function () {
    return gulp.src(pugFilePagesPaths, {
        base: './src/components/pages',
        since: gulp.lastRun('pugPages')
    })
        // .pipe(data(function (file) {
        //     console.log(file.path);
        //     return JSON.parse(fs.readFileSync('./src/dummy/' + path.basename(file.path) + '.json'));
        // }))
        .pipe(data(pluginDataOptions))
        .pipe(plumber())
        .pipe(pug(pluginPugOptions))
        .pipe(gulp.dest(paths.temp.base))
        .pipe(browserSync.stream());
});

gulp.task('html', function () {
    return gulp.src(htmlFilePaths, {
        base: './src/components',
        since: gulp.lastRun('html')
    })
        .pipe(data(pluginDataOptions))
        .pipe(plumber())
        .pipe(nunjucksRender(pluginNunjucksRenderOptions))
        .pipe(gulp.dest(paths.temp.base))
        .pipe(browserSync.stream());
});

gulp.task('htmlPages', function () {
    return gulp.src(htmlFilePagesPaths, {
        base: './src/components/pages',
        since: gulp.lastRun('htmlPages')
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

gulp.task('serve', gulp.series('scss', 'pug', 'pugPages', 'html', 'htmlPages', 'assets', 'vendor', function () {
    browserSync.init({
        server: paths.temp.base
    });

    gulp.watch(scssFilePaths, gulp.series('scss'));
    gulp.watch(htmlFilePaths, gulp.series('html'));
    gulp.watch(htmlFilePagesPaths, gulp.series('htmlPages'));
    gulp.watch(pugFilePaths, gulp.series('pug'));
    gulp.watch(pugFilePagesPaths, gulp.series('pugPages'));
    gulp.watch([paths.src.assets], gulp.series('assets'));
    gulp.watch([paths.src.vendor], gulp.series('vendor'));
}));

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

// Copy Html
gulp.task('copy:dist:html', function () {
    return gulp.src([paths.src.html])
        .pipe(gulp.dest(paths.dist.html));
});

gulp.task('copy:dev:html', function () {
    return gulp.src([paths.src.html])
        .pipe(gulp.dest(paths.dev.html));
});

// Copy pug
gulp.task('copy:dist:pug', function () {
    return gulp.src(pugFilePagesPaths, {
        base: './src/components/pages',
        since: gulp.lastRun('copy:dist:pug')
    })
        .pipe(data(pluginDataOptions))
        .pipe(plumber())
        .pipe(pug(pluginPugOptions))
        .pipe(gulp.dest(paths.dist.base));
});

gulp.task('copy:dev:pug', function () {
    return gulp.src(pugFilePagesPaths, {
        base: './src/components/pages',
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

gulp.task('build:dev', gulp.series('clean:dev', 'copy:dev:css', 'copy:dev:html', 'copy:dev:pug', 'copy:dev:assets', 'beautify:css', 'copy:dev:vendor'));
gulp.task('build:dist', gulp.series('clean:dist', 'copy:dist:css', 'copy:dist:html', 'copy:dist:pug', 'copy:dist:assets', 'minify:css', 'minify:html', 'copy:dist:vendor'));

// Default
gulp.task('default', gulp.series('serve'));