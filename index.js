const express = require('express');
const bodyParser = require('body-parser');
const { Readability } = require('@mozilla/readability');
const { JSDOM } = require('jsdom');

const app = express();

app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.raw({ limit: '10mb' }));

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/api/readability', (req, res) => {
  if (!req.body.hasOwnProperty('article') || !req.body.hasOwnProperty('url')) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (typeof req.body.article !== 'string' || typeof req.body.url !== 'string') {
    return res.status(400).json({ error: 'Invalid field types' });
  }

  const doc = new JSDOM(req.body.article, {
    url: req.body.url
  });

  if (req.body.removeImages) {
    const images = doc.window.document.querySelectorAll('img', 'picture', 'svg', 'canvas');
    images.forEach((image) => {
      if (image.parentNode) {
        image.parentNode.removeChild(image);
      }
    });
  }

  const reader = new Readability(doc.window.document, {
    debug: false,
  });
  const article = reader.parse();

  res.send(article);
});

const port = 9000

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
