const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
require('dotenv').config();

const app = express();
const cache = new NodeCache({ stdTTL: 120 }); // Cache with 2-minute expiration
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.all('/*', (req, res) => {
  console.log('originalUrl', req.originalUrl); // /products/main?res=all console.log('body', req.body); // { name: 'product-1', count: '12' }
  console.log('method', req.method); // POST, GET
  const recipient = req.originalUrl.split('/')[1]; 
  console.log('recipient', recipient);
  const recipientURL = process.env[`${recipient.toUpperCase()}_SERVICE_URL`]; 
  console.log('recipientURL', recipientURL);

  const url = `${recipientURL}${req.originalUrl.slice(recipient.length+1)}`;

  // Check if the request is already cached
  const cacheKey = `${req.method}:${url}:${JSON.stringify(req.body)}`;
  const cachedResponse = cache.get(cacheKey);

  if (cachedResponse) {
    console.log('Response from cache');
    return res.status(cachedResponse.status).json(cachedResponse.data);
  }

  if(recipientURL) {
    const axiosConfig = {
      method: req.method,
      url: url, 
      ...(Object.keys(req.body || {}).length > 0 && {data: req.body})
    };
    
    console.log('axiosConfig: ', axiosConfig);
    
    axios (axiosConfig)
    .then(function (response) {
      console.log('response from recipient', response.data); 
      cache.set(cacheKey, { status: response.status, data: response.data }); // cachhe data
      res.json(response.data);
    })
    .catch(error => {
      console.log('some error:', JSON.stringify(error));
      if(error.response) {
        const {
          status,
          data
        } = error.response;

        res.status(status).json(data);
      } else {
        res.status(500).json({error: error.message});
      }
    });

  } else {
    res.status(502).json({error: 'Cannot process request'});
  }
})


app.listen(PORT, () => {
  console.log(`BFF Service is listening on port ${PORT}`);
});
