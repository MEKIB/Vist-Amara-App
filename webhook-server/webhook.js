const express = require('express');
     const app = express();
     app.use(express.json());

     app.post('/chapa/webhook', (req, res) => {
       console.log('Webhook received:', req.body);
       res.status(200).send('Webhook received');
     });

     app.listen(3000, () => console.log('Server running on http://localhost:3000'));