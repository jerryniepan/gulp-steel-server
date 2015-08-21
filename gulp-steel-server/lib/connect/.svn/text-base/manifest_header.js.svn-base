
var fileReg = /\.(manifest)(\?|$)/;

module.exports = function(req, res, next) {
	if (fileReg.test(req.url)) {
		res.setHeader("Content-Type", 'text/cache-manifest; charset="UTF-8"');
	}
	next();
};