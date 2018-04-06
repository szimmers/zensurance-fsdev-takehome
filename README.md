# Zensurance Full Stack Developer
## Technical Take Home

This project was bootstrapped 
according to
to [this fullstack React tutorial](https://www.fullstackreact.com/articles/using-create-react-app-with-a-server/)
based on [create-react-app](https://github.com/facebook/create-react-app).
I elected to concentrate on the server portion and not create the React app, though
the development environment is set up to handle that.

To set up:

1. clone/download project
1. % cd /path/to/project/root
1. % npm install

To run the app:

1. % cd /path/to/project/root
1. % npm start

Note that this command is intended to start both the client and the server.
Because the client does not exist, npm will complain but will start the server
on port 3001.

Optionally, to run the server only, you can:

1. % cd /path/to/project/root
1. % npm run server

#### Testing via curl

Retrieve the cart contents
```
curl http://localhost:3001/api/cart
```

Retrieve the total price of the cart contents
```
curl http://localhost:3001/api/cart/price
```

Delete the contents of the cart
```
curl -i -X DELETE http://localhost:3001/api/cart
```

Add a t-shirt with text
```
curl -H "Content-Type:application/json" -X POST http://localhost:3001/api/cartitem/tshirt -d '{ "material": "COTTON_LIGHT", "qty": 1, "color": "RED", "text": "Larry", "textColor": "RED" }'
```

Add a t-shirt without text
```
curl -H "Content-Type:application/json" -X POST http://localhost:3001/api/cartitem/tshirt -d '{ "material": "COTTON_HEAVY", "qty": 2, "color": "BLACK" }'
```

Add a sweater
```
curl -H "Content-Type:application/json" -X POST http://localhost:3001/api/cartitem/sweater -d '{ "qty": 2, "color": "BLACK" }'
```

Delete a cart item, using its "id" property
```
curl -i -X DELETE http://localhost:3001/api/cartitem/<itemid>
```

Update quantity of a cart iem
```
curl -H "Content-Type:application/json" -X PUT http://localhost:3001/api/cartitem/quantity/<itemid> -d '{"qty": 77}'
```

#### Allowed values

##### Material types
1. COTTON_LIGHT
1. COTTON_HEAVY

##### Fabric Colors
1. BLACK
1. WHITE
1. GREEN
1. RED
1. PINK
1. YELLOW

##### Text Colors
1. BLACK
1. WHITE
1. GREEN
1. RED

##### Others
1. Maximum quantity: 99
1. Maximum length of text for t-shirt: 8
