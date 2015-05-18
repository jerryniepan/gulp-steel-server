/**
 * proxy
 * @author wangzheng4@Finrila
 */
var owns = {}.hasOwnProperty;
var url = require('url');

module.exports = function proxyMiddleware(options) {

	var httpLib = options.protocol === 'https:' ? 'https' : 'http';
	var request = require(httpLib).request;
	options = options || {};
	options.hostname = options.host;
	options.port = options.port;
	options.pathname = '/';

	var hostProxyObject = {
		hostname: options.hostname,
		port: options.hostname && (options.port || 80),
		map: {},
		regList: []
	};
	for (var key in options) {
		if (key.indexOf('.') !== -1) {
			var proxyHost = options[key];
			if (typeof proxyHost === 'string') {
				proxyHost = {
					hostname: proxyHost,
					port: 80
				};
			} else {
				proxyHost.port = proxyHost.port || 80;
			}
			if (key.indexOf('*') === -1) {
				hostProxyObject.map[key] = proxyHost;
			} else {
				hostProxyObject.regList.push({
					reg: URIToReg(key),
					proxyHost: proxyHost
				});
			}
		}
	}
	return function(req, resp, next) {
		var opts = extend({}, options);

		opts.path = slashJoin(options.pathname, req.__real_url__);
		opts.method = req.method;
		opts.headers = options.headers ? merge(req.headers, options.headers) : req.headers;
		applyViaHeader(req.headers, opts, opts.headers);

		// Forwarding the host breaks dotcloud
		var proxyHost = hostProxyMatch(opts.headers.host, req.__real_url__);
		//console.log(proxyHost, opts.headers.host, req.__real_url__);
		if (!proxyHost) {
			return next();
		}
		opts.hostname = proxyHost.hostname;
		opts.port = proxyHost.port;
		var myReq = request(opts, function(myRes) {
			var statusCode = myRes.statusCode;
			var headers = myRes.headers;
			var location = headers.location;
			// Fix the location
			if (statusCode > 300 && statusCode < 304 && location.indexOf(options.href) > -1) {
				// absoulte path
				headers.location = location.replace(options.href, slashJoin('', slashJoin((options.route || ''), '')));
			}
			applyViaHeader(myRes.headers, opts, myRes.headers);
			resp.writeHead(myRes.statusCode, myRes.headers);
			myRes.on('error', function(err) {
				next(err);
			});
			myRes.pipe(resp);
		});
		myReq.on('error', function(err) {
			next(err);
		});
		if (!req.readable) {
			myReq.end();
		} else {
			req.pipe(myReq);
		}
	};


	function hostProxyMatch(host, pathname) {
		var UIR = host + pathname;
		var proxyHost = hostProxyObject.map[UIR];
		if (proxyHost) {
			return proxyHost;
		}
		var regList = hostProxyObject.regList;
		for (var i = 0, l = regList.length; i < l; ++i) {
			if (regList[i].reg.test(UIR)) {
				return (hostProxyObject.map[UIR] = regList[i].proxyHost);
			}
		}
		if (hostProxyObject.hostname) {
			return (hostProxyObject.map[UIR] = {
				hostname: hostProxyObject.hostname,
				port: hostProxyObject.port
			});
		}
	}
};

/**
 * host to Reg object
 * @param  {string} host [description]
 * @return {RegExp}
 * @scripts.codezz.cn
 */
function URIToReg(host) {
	return new RegExp('^' + host.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
}

function applyViaHeader(existingHeaders, opts, applyTo) {

	if (!opts.via) {
		return;
	}

	var viaName = (true === opts.via) ?
		// use the host name
		require('os').hostname() :
		// or use whatever was passed as the options.via value
		opts.via;

	var viaHeader = '1.1 ' + viaName;

	if (existingHeaders.via) {
		viaHeader = existingHeaders.via + ', ' + viaHeader;
	}

	applyTo.via = viaHeader;

}

function slashJoin(p1, p2) {
	if (p1.length && p1[p1.length - 1] === '/') {
		p1 = p1.substring(0, p1.length - 1);
	}
	if (p2.length && p2[0] === '/') {
		p2 = p2.substring(1);
	}
	return p1 + '/' + p2;
}

function extend(obj, src) {
	for (var key in src)
		if (owns.call(src, key)) obj[key] = src[key];
	return obj;
}

//merges data without changing state in either argument
function merge(src1, src2) {
	var merged = {};
	extend(merged, src1);
	extend(merged, src2);
	return merged;
}