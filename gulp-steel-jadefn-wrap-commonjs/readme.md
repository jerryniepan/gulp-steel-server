# gulp-steel-jadefn-wrap-commonjs

## 用途
    把jade文件进行处理，处理成返回fn(data)的js文件。
## 用法
``` javascript
    var steelJadefnWrapCommonjs = require('gulp-steel-jadefn-wrap-commonjs');
    steelJadefnWrapCommonjs();
```
## 示例
``` javascript
    gulp.src(['src/js/**/*.jade'])
        .pipe($.steelJadefnWrapCommonjs())
        .pipe(gulp.dest('server_front/js/'));
```
