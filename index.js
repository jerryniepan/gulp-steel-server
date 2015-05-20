/**
 * gulp-steel-server
 * @author Finrila finrila@gmail.com
 */
'use strict';

var extend = require('util')._extend;
var gulp = require('gulp');
var path = require('path');
var server = require('./server');
var pm2_serverName = 'Steel_pm2_' + __dirname.replace(/\:/g, '').replace(/\/|\\/g, '_');
var isWindows = require('os').platform().toLowerCase().indexOf('win') > -1;
var pm2;
if (!isWindows) {
    pm2 = require('pm2');
}

exports = module.exports = function(options, pm2_options) {

    options = extend({
        'port': 80,
        'front_base': 'server_front',
        'hostname': '*', //HOST
        'back_base': path.resolve('./server_back'), //模拟后端的文件放置目录
        'back_hostname': 'test.weibo.com test1.weibo.com', //后端的HOST，目的是真实模拟后端的页面路由请求，提供出前端可仿真的功能，比如 /index 对应 /html/index.html
        'pathnamePrefix': '/', //默认为'/'
        'gzip': false,
        'access_control_allow': false,
        'staticProxy': {
            'js*.t.sinajs.cn/*': 'sinajs.xdwscache.glb0.lxdns.com',
            'img*.t.sinajs.cn/*': 'sinajs.xdwscache.glb0.lxdns.com',
            'tjs.sjs.sinajs.cn/*': 'sinajs.xdwscache.glb0.lxdns.com'
        },
        pm2: false
    }, options);


    if (isWindows || !options.pm2) {
        if (isWindows) {
            doStartServer();
        } else {
            pm2.connect(function(err) {
                deletePm2();
            });
            doStartServer();
        }

        return;
    }

    function doStartServer() {
        gulp.start(options.tasks);
        server(options);
    }

    process.env['server_options'] = JSON.stringify(options);

    pm2_options = extend({
        script: path.join(__dirname, './pm2_boot.js'),
        name: pm2_serverName
    }, pm2_options);

    // Connect or launch PM2
    pm2.connect(function(err) {

        deletePm2();

        pm2.list(function(err, process_list) {
            // Disconnect to PM2

            pm2.start(pm2_options, function(err, proc) {
                if (err) throw new Error('err');
                // Get all processes running
                pm2.list(function(err, process_list) {
                    pm2.disconnect(function() {
                        process.exit(0)
                    });
                });
            });
        });
        //pm2.delete(pm2_serverName);
        // Start a script on the current folder

    })

};

exports.stop = function() {
    pm2.connect(function(err) {
        deletePm2();
    });
};

function deletePm2() {
    pm2.list(function(err, process_list) {
        process_list.forEach(function(item) {
            if (item.name === pm2_serverName) {
                pm2.delete(item.pm_id);
            }
        });
    });
}