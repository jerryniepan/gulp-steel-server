/**
 * define transport
 * @author wangzheng4@Finrila
 */
'use strict';

var extend = require('util')._extend;
var path = require('path');
var server = require('./server');
var middleware = require('./lib/connect/middleware');

module.exports = function(options) {
    options = extend({
        'port': 80,
		'front_base': 'server_front',
		'hostname': '*',//HOST
		'back_base': 'server_back',//模拟后端的文件放置目录
		'back_hostname': 'test.weibo.com test1.weibo.com',//后端的HOST，目的是真实模拟后端的页面路由请求，提供出前端可仿真的功能，比如 /index 对应 /html/index.html
		'pathnamePrefix': '/', //默认为'/'
		'gzip': false,
		'access_control_allow': false,
		'staticProxy': {
			'js*.t.sinajs.cn/*': 'sinajs.xdwscache.glb0.lxdns.com',
            'img*.t.sinajs.cn/*': 'sinajs.xdwscache.glb0.lxdns.com',
            'tjs.sjs.sinajs.cn/*': 'sinajs.xdwscache.glb0.lxdns.com'
		},
		middleware: middleware
    }, options);
	
	server(options)
};
