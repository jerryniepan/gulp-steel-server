/**
 * pm2 boot js
 */

var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var server_options = JSON.parse(process.env['server_options']);

require(path.join(process.cwd(), 'gulpfile.js'));
gulp.start(server_options.tasks);

require('./server')(server_options);

