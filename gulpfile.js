const { src, dest, watch, series, parallel } = require("gulp");
const browserSync = require("browser-sync").create();
const del = require("del");

//плагины
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const fileInclude = require("gulp-file-include");
const htmlmin = require("gulp-htmlmin");
const size = require("gulp-size");
const less = require("gulp-less");
const sourcemaps = require("gulp-sourcemaps");
const autoprefixer = require("gulp-autoprefixer");
const rename = require("gulp-rename");
const cleanCss = require("gulp-clean-css");
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");
const concat = require("gulp-concat");
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");

//Удаление директории
const clear = () => {
    return del(["./public", "!public/img"]);
}


//обработка html
const html = () => {
    return src("./src/html/*.html")
    .pipe(plumber({
        errorHandler: notify.onError(error =>({
            title: "HTML",
            message: error.message
        }))
    }))
    .pipe(fileInclude())
    .pipe(size({ title: "До сжатия"}))
    .pipe(htmlmin({
        collapseWhitespace: true
    }))
    .pipe(size({ title: "После сжатия"}))
    .pipe(dest("./public"))
    .pipe(browserSync.stream());
}

//Обработка css
const styles = () => {
    return src("./src/less/**/*.less")
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(autoprefixer({
        cascade: false
    }))
    .pipe(cleanCss({
        level: 2
    }))
    .pipe(rename({
        basename: "style",
        suffix: ".min"
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(size({
        showFiles: true
    }))
    .pipe(dest("./public/css"))
    .pipe(browserSync.stream())
}

//скрипты
const scripts = () => {
    return src("./src/scripts/**/*.js")
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(uglify())
    .pipe(concat("main.min.js"))
    .pipe(sourcemaps.write('.'))
    .pipe(size({
        showFiles: true
    }))
    .pipe(dest("./public/js"))
    .pipe(browserSync.stream())
}

//Изображения
const img = () => {
    return src("./src/img/**/*.*")
    .pipe(newer("./public/img"))
    .pipe(imagemin({
        progressive: true
    }))
    .pipe(size({
        showFiles: true
    }))
    .pipe(dest("./public/img"))
}


//Сервер
const server = () => {
    browserSync.init({
        server: {
            baseDir: "./public"
        }
    });
}

//Наблюдение
const watcher = () => {
    watch("./src/html/**/*.html", html);
    watch("./src/less/**/*.less", styles);
    watch("./src/scripts/**/*.js", scripts);
}

//задачи
exports.html = html;
exports.watch = watcher;
exports.clear = clear;
exports.styles = styles;
exports.scripts = scripts;
exports.img = img;

//Сборка
exports.dev = series(
    clear,
    html,
    parallel(watcher, server, styles, scripts, img)
);