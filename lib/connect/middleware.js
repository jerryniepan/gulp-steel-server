/**
 * gruont-contrib-connect的中间件
 * @author wangzheng4@Finrila
 */

var http_api = require('./http_api');
var http_php_route = require('./http_php_route');
var connect_json = require('./connect-json');
var connect_proxy = require('./connect-proxy');
var pathnamePrefix = require('./pathnamePrefix');
var access_control_allow = require('./access-control-allow');
var http = require('http');
var path = require('path');

module.exports = function(connect, options, middleware) {
  middleware = middleware || [];
  //使用404资源静态代理
  var staticProxyFn;
  
  if (options.staticProxy) {
    middleware.push(staticProxyFn = connect_proxy(options.staticProxy));
    //setInterval(function() {
    //    http.get('http://127.0.0.1:' + options.port, function(res) {});
    //}, 60000);
  }

  //access_control_allow
  if (options.access_control_allow) {
    middleware.unshift(access_control_allow);  
  }
  
  //gzip
  if (options.gzip) {
    middleware.unshift(connect.compress({level:9}));
  }
  //当文件访问需要加前缀时需要
  if (options.pathnamePrefix) {
    middleware.unshift(pathnamePrefix(connect, options, staticProxyFn));
  }
  middleware.unshift(http_api(connect, options));
  middleware.unshift(http_php_route(connect, options));
  middleware.unshift(connect_json);
  if (options.bodyParser) {
    middleware.unshift(connect.bodyParser());
  }
  middleware.unshift(connect.query());
  
  middleware.unshift(function(req, res, next) {
    var host = req.headers.host.replace(/:.*$/, '');
	req.__real_url__ = req.url.replace(/\/+/g, '/');
	if (options.back_hostname.split(/ +/).indexOf(host) > -1) {
		req.url = path.join('/' + options.back_base, req.url);
		req.__back_requrest__ = true;
	} else if (options.front_hostname.split(/ +/).indexOf(host) > -1) {
		req.url = path.join('/' + options.front_base, req.url);
		req.__front_requrest__ = true;
	}
	req.url = req.url.replace(/\\+/g, '/');
	next();
  });
  
  
  return middleware;
}; 