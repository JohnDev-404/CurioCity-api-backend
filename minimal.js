const express = require('express');
const app = express();
app.get('/ping', (req, res) => res.json({ ok: true }));
app.listen(5001, '0.0.0.0', () => console.log('Minimal server on 5001'));