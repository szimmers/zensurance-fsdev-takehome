const express = require('express');
const {AddTShirt, PriceCart, AddSweater, CartContents, EmptyCart, DeleteCartItemById, UpdateCartItemQuantityById} = require('./routes/cart');

const app = express();
const bodyParser = require('body-parser');

const port = process.env.PORT || 3001;

const jsonParser = bodyParser.json();

//------------------------------------------------------------------------------
// cart meta-operations
//------------------------------------------------------------------------------

// gets the total cart price
app.get('/api/cart/price', PriceCart);

// gets the cart contents
app.get('/api/cart', CartContents);

// empties the cart
app.delete('/api/cart', EmptyCart);

//------------------------------------------------------------------------------
// item operations
//------------------------------------------------------------------------------

// allows the user to add t-shirts to the cart
app.post('/api/cartitem/tshirt', jsonParser, AddTShirt);

// allows the user to add sweaters to the cart
app.post('/api/cartitem/sweater', jsonParser, AddSweater);

// sets an items new quantity
app.put('/api/cartitem/quantity/:id', jsonParser, UpdateCartItemQuantityById);

// deletes a cart item by its id
app.delete('/api/cartitem/:id', DeleteCartItemById);

app.listen(port, () => console.log(`Listening on port ${port}`));
