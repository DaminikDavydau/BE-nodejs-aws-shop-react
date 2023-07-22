const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.all('/*', (req, res) => {
})


app.listen(PORT, () => {
  console.log(`BFF Service is listening on port ${PORT}`);
});
