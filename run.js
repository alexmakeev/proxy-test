'use strict';
const express = require('express');
const proxy = require('http-proxy-middleware');
const request = require('request');

let app = express();

app.use('/proxy', proxy({
  target: 'https://useless-initially-required-uri.com',
  changeOrigin: true,
  headers: {
    accept: '*/*'
  },
  // secure: true,
  // protocolRewrite: true,
  hostRewrite: true,
  autoRewrite: true,
  // protocolRewrite: true,
  xfwd: false,
  router: function (req) {
    return 'http://webfoundation.org';
  },
  pathRewrite: function (path, req) {
    return '/about/vision/history-of-the-web/';
  },
  onProxyRes: function (proxyRes, req, res) {
    if ([301, 302, 303, 307, 308].indexOf(proxyRes.statusCode) > -1 && proxyRes.headers.location) {
      console.log('Queried:', req.query.uri, req.parsed_uri);
      console.log('Status code:', proxyRes.statusCode, proxyRes.headers);
    }
  }
}));

app.get('/request', function(req,res,next){
  request.get({
    uri: 'http://webfoundation.org/about/vision/history-of-the-web/',
    headers: {
      accept: '*/*',
    }
  }, function (error, response, body) {
    console.log('Error:', error);
    console.log('gotten response', response.statusCode, body)
    res.send(body);
  })
});

///////////// Error display

app.use(function (err, req, res, next) {
  console.log('Error:', err, 'Status:', err.status);
  let status = err.status || 500;
  res.setHeader('err-message', err.message);
  res.status(err.status || 500);
  let status_str = 'Error ' + status;// + ': ' + (errors.statuses_description[status] || 'Unknown error');
  let rows = err.stack.split('\n');
  let rows_out = [];
  rows.forEach(function (row, i) {
    let row_out = row.replace('    ', '&nbsp;&nbsp;&nbsp; ');
    if (i !== 0) row_out = '<small>' + row_out + '</small>';
    if (i !== 0 && row_out.indexOf('node_modules') === -1) row_out = '<b style="color:red">' + row_out + '</b>';
    rows_out.push(row_out);
  });
  res.send('<h1>' + status_str + '</h1><br>\n' + rows_out.join('<br>\n') + '');
});

let port = process.env.PORT || 8123;
module.exports = app.listen(port, function (err) {
  if (err) {
    console.log(err);
    return;
  }
});
