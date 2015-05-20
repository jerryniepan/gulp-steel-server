/**
 * response json function
 * @author Finrila finrila@gmail.com
 */

module.exports = function(req, res, next) {
  res.json = function(obj) {
    var callback = (req.url.match(/[\?\&]callback=([^&]*)/) || [])[1];

    if (callback) {
      res.setHeader('Content-Type', 'text/javascript')
      res.end(callback + '(' + (typeof(obj) === 'object' ? JSON.stringify(obj) : obj) + ')')
    } else {
      res.setHeader('Content-Type', 'application/json')
      res.end((typeof(obj) === 'object' ? JSON.stringify(obj, null, 2) : obj))
    }
  }
  next()
};