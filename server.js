// Optional browser-only preview host. The desktop app does not expose a network terminal or file API.
const express = require('express');
const path = require('path');

const app = express();
const root = __dirname;
app.use(express.static(root, { index: 'studio.html', dotfiles: 'deny' }));
app.listen(process.env.PORT || 3000, '127.0.0.1', () => {
  console.log(`All-In Studio preview is available at http://127.0.0.1:${process.env.PORT || 3000}`);
});
