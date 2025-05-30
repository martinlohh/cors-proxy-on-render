const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Enable CORS for all requests
app.use(cors());

// Handle preflight requests
app.options('*', cors());

// Proxy requests to Google Apps Script
app.use('/', createProxyMiddleware({
  target: 'https://script.google.com',
  changeOrigin: true,
  pathRewrite: {
    '^/': '/'
  },
  onProxyRes: (proxyRes, req, res) => {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Headers'] = '*';
  }
}));

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Proxy running on port ${port}`);
});
