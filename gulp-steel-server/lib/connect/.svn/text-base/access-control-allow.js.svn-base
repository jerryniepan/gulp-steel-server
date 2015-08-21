/**
 * access-control-allow
 * @author Finrila finrila@gmail.com
 */

var fileReg = /\.(eot|ttf|woff|otf)(\?|$)/;

module.exports = function(req, res, next) {
	if (fileReg.test(req.url)) {
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
		res.setHeader("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
	}
	next()
};