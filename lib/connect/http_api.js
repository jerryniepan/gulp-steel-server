/**
 * 假接口数据服务的处理文件
 * @author wangzheng4@Finrila
 */
var fs = require("fs");
var path = require("path");
var jsReg = /\.js$/i;
var methodReg = /^POST|GET$/i;

module.exports = function(connect, options) {

  var apiPath = fs.realpathSync(options.back_base);

  var apiRouteMap = {}; 

  function _pathToRoute(path) {
    return path.replace(apiPath, '').replace(/\.js$/i, '');
  }

  function _setApiRouteMap(filePath) {

    var apiObject;

    if (apiObject = requireLatest(filePath, true, true)) {
      apiRouteMap[_pathToRoute(filePath)] = apiObject;  
    }
  }
  
  return function(req, res, next) {
	if (!req.__back_requrest__) {
		return next();
	}
	
    var pathname = req.__real_url__.replace(/\?.*?$/, '')
          .replace(/\/+/g, '/')
          .substr(1);
		  
	var __real_url__ = req.__real_url__;
	//console.log(222, __real_url__, pathname)
    
    var apiObject = requireLatest(path.join(apiPath, pathname) + '.js', true);
    
    var error, method, data;

    if (apiObject) {

      if (error = apiObject.error) {
        return endError('api set error:' + error);
      }

      if (method = apiObject.method) {
        method = method.toUpperCase();
        if (!methodReg.test(method)) {
          return endError('api set method(' + method + ') error!');
        }
        if (req.method !== method) {
          return endError('only support method ' + method + '!');
        }
      }

      if (data = apiObject.data) {
        if (typeof(data) === 'function') {
          return data(req, res, next);
        } else {
          return res.json(data);
        }
      }

      return endError('api set (' + JSON.stringify(apiObject) + ') is not work!!');
    }
    next();

    function endError(error) {
      res.statusCode = 500;
      res.end('http_api throw error:' + error);
    }
  };

};

/**
 * require最新的文件
 */
function requireLatest(filePath, removeCache, fileExits) {
  if (fileExits || fs.existsSync(filePath)) {
    if (removeCache) {
      var cacheName = require.resolve(filePath);
      require.cache[cacheName] && delete require.cache[cacheName];
    }
    try {
      return require(filePath);
    } catch (e) {
      return 'path(' + filePath + '):' + e;
    }
  }
}