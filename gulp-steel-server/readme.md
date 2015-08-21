# gulp-steel-server

## 用途
    搭建本地/开发机服务环境，进行开发、调试、测试、模拟后端数据接口和路由。
## 用法与示例
``` javascript
    var steelServer = require('gulp-steel-server');
    var port = 80;
    var pathnamePrefix = '/t6/apps/fans_service_mobile/';
    var front_base = 'server_front';
    var front_hostname = 'js.t.sinajs.cn img.t.sinajs.cn';
    var back_base = 'server_back'; //模拟后端的文件放置目录
    var back_hostname = 'e.weibo.com e1.weibo.com';
    //后端的HOST，目的是真实模拟后端的页面路由请求，提供出前端可仿真的功能，比如 /index 对应 /html/index.html
    
    gulp.task('server', function() {
        steelServerFn({
            debug: true,//debug状态与否
            pm2: true ,//
            tasks: ['debug', 'watchDebug']//debug状态。若仿真dist状态则为['dist', 'watchDist']
        });
    });
    
    gulp.task('serverStop', function() {
        steelServer.stop();
    });
    
    function steelServerFn(options) {
        steelServer({
            port: port,
            pathnamePrefix: pathnamePrefix,
            front_base: front_base,
            front_hostname: front_hostname, //前端的HOST
            back_base: back_base, //模拟后端的文件放置目录
            back_hostname: back_hostname, //后端的HOST，目的是真实模拟后端的页面路由请求，提供出前端可仿真的功能，比如 /index 对应 /html/index.html
            gzip: !options.debug,
            access_control_allow: true,
            staticProxy: {
                'js*.t.sinajs.cn/*': 'sinajs.xdwscache.glb0.lxdns.com',
                'img*.t.sinajs.cn/*': 'sinajs.xdwscache.glb0.lxdns.com',
                'tjs.sjs.sinajs.cn/*': 'sinajs.xdwscache.glb0.lxdns.com'
            },
            pm2: options.pm2,
            tasks: options.tasks
        });
    }
```
##模拟后端服务器目录

####假页面使用说明
    . 支持 *.jade 和 *.html
    . index.html为目录默认文件
    . 访问 xxx/xxx 时如果 xxx/xxx.html 或者 xxx/xxx.jade 存在则等同于访问 xxx/xxx.html 或者 xxx/xxx.jade
    . *.jade 的请求会被处理成html返回
    
####假数据接口使用说明
    . 假数据相对的目录为 connect任务中定义的属性apiPath值，默认为api目录
    . 接口的文件组织方式与真实接口一致
    . 当接口文件书写错误或者请求与设定method不一致时返回500并提示错误
    . 接口文件的编写规则：
        1. 每个接口都是一个nodejs文件
        2. 文件exports中可以定义两个属性
            [1]. method {string} 可选 默认表示该接口支持GET+POST
            [2]. data {string|object|function} 必选 返回的数据 可以是直接字符串结果、对象数据或者处理本次请求的中间件方法（和使用http模块一样）
        3. 文件名除了必须以js为后缀外，其他部分没有命名要求
        4. 访问时没有去掉js后缀

####实例

``` javascript
    /**
     * 返回字符串的接口实例
     */
    module.exports = {
        method: 'GET',
        data: 'OK!'
    };

    /**
     * 直接JSON数据的使用实例
     */
    module.exports = {
        method: 'GET',
        data: {
            "code": 10004,
            "data": {
                content: 'Hello'
            }
        } 
    };
    
    /**
     * 直接JSON数据的使用实例
     */
    module.exports = {
        method: 'GET',
        data: {
            "code": 10004,
            "data": {
                content: '我是子数据。',
                content2: '我是第三层子数据。'
            }
        } 
    };
    
    /**
     * 使用中间件的接口实例
     */
    module.exports = {
      method: 'GET',
      data: function(req, res, next) {

        if (req.method.toUpperCase() === "GET") {
          res.json({
            code: 10000, 
            data: '中间件'
          }); 
        } else {
          next(); 
        }
     
      }
    };
```


