const express = require('express');
const {AddTShirt, DeleteTShirt} = require('./routes/cart');

const app = express();
const bodyParser = require('body-parser');

const port = process.env.PORT || 3001;

const jsonParser = bodyParser.json();

app.post('/api/cartitem/tshirt', jsonParser, AddTShirt);
app.delete('/api/cartitem/tshirt', jsonParser, DeleteTShirt);

app.listen(port, () => console.log(`Listening on port ${port}`));
