/**
 * 服务访问路径的前缀
 * @author wangzheng4@Finrila
 */

var path = require('path');

module.exports = function(connect, options, staticProxyFn) {

    pathnamePrefix = options.pathnamePrefix.replace(/\/+/g, '/').replace(/\/$/, '');

    return function(req, res, next) {
        if (!req.__front_requrest__) {
            return next();
        }
        var __real_url__ = req.__real_url__;
        var url = req.url.replace(/\/+/g, '/');
        var match = __real_url__.match(new RegExp('^' + pathnamePrefix + '(.*)$'));
        if (match) {
            if (match[1] === '' || /^\?/.test(match[1])) {
                match[1] = '/' + match[1];
            } else if (!/^\//.test(match[1])) { //处理路径与文件名字有重合的情况
                match = null;
            }
        }
        require('fs').writeFileSync('/data/steel/weibo_sell/pm2out.log', [__real_url__, match, pathnamePrefix, new RegExp('^' + pathnamePrefix + '(.*)$')].join());

        //console.log(__real_url__, match, pathnamePrefix, new RegExp('^' + pathnamePrefix + '(.*)$'));
        if (match) {
            req.url = path.join('/' + options.front_base, match[1]).replace(/\\+/g, '/').replace(/\/+/g, '/');
            next();
        } else if (/^\/*$/.test(__real_url__)) {
            res.setHeader('Content-Type', 'text/html');
            res.end('<h1><a href="' + pathnamePrefix + '">use ' + pathnamePrefix + '</a></h1>');
            return;
        } else {
            if (staticProxyFn) {
                staticProxyFn(req, res, next);
            } else {
                res.statusCode = 404;
                res.end();
            }
        }
    };
};