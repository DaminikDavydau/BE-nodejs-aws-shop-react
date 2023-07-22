const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
require('dotenv').config();

const app = express();
const cache = new NodeCache({ stdTTL: 120 }); // Cache with 2-minute expiration
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.all('/*', (req, res) => {
  const recipient = req.originalUrl.split('/')[1]; 
  const recipientURL = process.env[`${recipient.toUpperCase()}_SERVICE_URL`]; 

  const url = `${recipientURL}${req.originalUrl.slice(recipient.length+1)}`;

  // Check if the request is already cached
  const cacheKey = `${req.method}:${url}:${JSON.stringify(req.body)}`;
  const cachedResponse = cache.get(cacheKey);

  if (cachedResponse) {
    return res.status(cachedResponse.status).json(cachedResponse.data);
  }

  if(recipientURL) {
    const axiosConfig = {
      method: req.method,
      url: url, 
      ...(Object.keys(req.body || {}).length > 0 && {data: req.body})
    };
    
    
    axios (axiosConfig)
    .then(function (response) {
      cache.set(cacheKey, { status: response.status, data: response.data }); // cachhe data
      res.json(response.data);
    })
    .catch(error => {
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
