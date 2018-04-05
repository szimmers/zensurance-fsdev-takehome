const express = require('express');
const {AddTShirt, DeleteTShirt, PriceCart, AddSweater, DeleteSweater} = require('./routes/cart');

const app = express();
const bodyParser = require('body-parser');

const port = process.env.PORT || 3001;

const jsonParser = bodyParser.json();

// gets the total cart price
app.get('/api/cart', jsonParser, PriceCart);

// allows the user to add and remove t-shirts to/from the cart
app.post('/api/cartitem/tshirt', jsonParser, AddTShirt);
// note that a supplied quantity (qty) indicates how many to delete
app.delete('/api/cartitem/tshirt', jsonParser, DeleteTShirt);

// allows the user to add and remove sweaters to/from the cart
app.post('/api/cartitem/sweater', jsonParser, AddSweater);
// note that a supplied quantity (qty) indicates how many to delete
app.delete('/api/cartitem/sweater', jsonParser, DeleteSweater);

app.listen(port, () => console.log(`Listening on port ${port}`));
