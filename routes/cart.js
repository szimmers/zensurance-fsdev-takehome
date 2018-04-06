const _ = require('underscore');
const uuidv4 = require('uuid/v4');

const {TShirtValidationSchema, SweaterValidationSchema, CartItemUpdateQuantitySchema, ItemIdSchema} = require('../validation/validationSchemas');
const {validateAgainstSchema} = require('../validation/validationUtils');
const {MaterialTypes, FabricColors, ItemForm} = require('../imports/consts');

/**
 * let's make an in-memory cart. we'll assume a single user so any cart items belong to
 * our single user. the cart is not persisted, it will go away w/ a server reboot. this will
 * give us enough functionality to test adding to the cart, deleting from it, and pricing it.
 * @type {Array}
 */
let cart = [];

/**
 * dynamically create model numbers based on what the user is ordering. in a real system, these
 * would likely be pre-defined.
 *
 * @param form
 * @param material
 * @param color
 * @returns {string}
 */
function makeModelNumber(form, material, color) {
	return `${form}-${material}-${color}`;
}

/**
 * adds an item to the in-memory cart.
 * @param form
 * @param material
 * @param color
 * @param text
 * @param textColor
 * @param qty
 * @param unitCost
 */
function addCartItem(form, material, color, text, textColor, qty, unitCost) {
	let model = makeModelNumber(form, material, color);

	// look for existing items based on the model number. but we'll keep customized
	// items as their own cart line item, so be sure not to match if text exists.
	let existingItem = _.find(cart, (c) => {
		return (c.model === model) && !c.text;
	});

	if (existingItem) {
		existingItem.qty += qty;
	}
	else {
		let newItem = {
			id: uuidv4(),
			model,
			form,
			material,
			color,
			text,
			textColor,
			qty,
			unitCost
		};

		cart.push(newItem);
	}
}

/**
 * given an item id, removes the item from the cart
 * @param id
 * @returns {boolean}   true if the item was removed, false if it was not found
 */
function removeCartItem(id) {
	let existingItem = _.find(cart, (c) => {
		return (c.id === id);
	});

	if (existingItem) {
		cart = _.filter(cart, (c) => {
			return c.id !== id;
		});

		return true;
	}

	return false;
}

/**
 * given an item id, update its quantity in the cart
 * @param id
 * @param qty
 * @returns {boolean}   true if the item was found, false otherwise
 */
function updateQuantity(id, qty) {
	let existingItem = _.find(cart, (c) => {
		return (c.id === id);
	});

	if (existingItem) {
		existingItem.qty = qty;

		return true;
	}

	return false;
}

/**
 * convenience function for adding t-shirts to the cart
 * @param material
 * @param color
 * @param text
 * @param textColor
 * @param qty
 * @param unitCost
 */
function addTShirtToCart(material, color, text, textColor, qty, unitCost) {
	addCartItem(ItemForm.TShirt, material, color, text, textColor, qty, unitCost);
}

/**
 * convenience function for adding sweaters to the cart
 * @param color
 * @param qty
 * @param unitCost
 */
function addSweaterToCart(color, qty, unitCost) {
	addCartItem(ItemForm.Sweater, MaterialTypes.HeavyCotton, color, undefined, undefined, qty, unitCost);
}

/**
 * gets the cost of the configured t-shirt. in a real system, this would probably
 * be in the db.
 * @param material
 * @param color
 * @param text
 * @param textColor
 * @returns {number}
 */
function getTShirtCost(material, color, text, textColor) {
	// black or white cost
	let cost = 16.95;

	// heavy cotton costs more
	if (material === MaterialTypes.HeavyCotton) {
		cost += 3;
	}

	// "fancy" colors cost more
	if (color === FabricColors.Green || color === FabricColors.Red) {
		cost += 2;
	}

	// text is free if it's in black or white, otherwise it's extra
	if (text && (textColor !== FabricColors.Black) && (textColor !== FabricColors.White)) {
		cost += 3;
	}

	return cost;
}

/**
 * gets the cost of the configured sweater. in a real system, this would probably
 * be in the db.
 * @param color
 * @returns {number}
 */
function getSweaterCost(color) {
	// black or white cost
	let cost = 28.95;

	if (color === FabricColors.Pink || color === FabricColors.Yellow) {
		cost += 4;
	}

	return cost;
}

/**
 * gets the contents of the cart
 * @param req
 * @param res
 * @constructor
 */
const CartContents = function (req, res) {
	res.json({
		cartItems: cart
	});
};

/**
 * gets the total price of all items in the cart
 * @param req
 * @param res
 * @constructor
 */
const PriceCart = function (req, res) {
	let cartCost = 0;

	for (const [key, value] of Object.entries(cart)) {
		cartCost += (value.unitCost * value.qty);
	}

	res.json({
		cartCost: cartCost
	});
};

/**
 * adds some quantity of t-shirts to the cart
 * @param req
 * @param res
 * @returns {*}
 * @constructor
 */
const AddTShirt = function (req, res) {
	if (!validateAgainstSchema(TShirtValidationSchema, req.body)) {
		let msg = 'Cannot add t-shirt, invalid configuration';
		return res.status(400).send({error: msg});
	}

	let material = req.body.material;
	let color = req.body.color;
	let qty = req.body.qty || 1;

	// text is optional, but its color is required if it exists
	let text = req.body.text;
	let textColor = req.body.textColor;

	let costPerUnit = getTShirtCost(material, color, text, textColor);
	let totalCost = costPerUnit * qty;

	addTShirtToCart(material, color, text, textColor, qty, costPerUnit);

	res.json({
		cartItemCosts: totalCost
	});
};

/**
 * adds some quantity of sweaters to the cart.
 * @param req
 * @param res
 * @returns {*}
 * @constructor
 */
const AddSweater = function (req, res) {
	if (!validateAgainstSchema(SweaterValidationSchema, req.body)) {
		let msg = 'Cannot add sweater, invalid configuration';
		return res.status(400).send({error: msg});
	}

	let color = req.body.color;
	let qty = req.body.qty || 1;

	let costPerUnit = getSweaterCost(color);
	let totalCost = costPerUnit * qty;

	addSweaterToCart(color, qty, costPerUnit);

	res.json({
		cartItemCosts: totalCost
	});
};

/**
 * given an id and a quantity, update the cart to that new quantity
 * @param req
 * @param res
 * @returns {*}
 * @constructor
 */
const UpdateCartItemQuantityById = function (req, res) {
	// the quantity is in the body
	if (!validateAgainstSchema(CartItemUpdateQuantitySchema, req.body)) {
		let msg = 'Cannot update quantity, invalid configuration';
		return res.status(400).send({error: msg});
	}

	// the id is in the params
	if (!validateAgainstSchema(ItemIdSchema, req.params)) {
		let msg = 'Cannot update quantity, invalid configuration';
		return res.status(400).send({error: msg});
	}

	let itemId = req.params.id;
	let qty = req.body.qty;

	if (updateQuantity(itemId, qty)) {
		res.end();
	}
	else {
		let msg = 'Cannot update quantity, item id not found';
		return res.status(400).send({error: msg});
	}
};

/**
 * allows user to delete a line item from the cart, by its id. all quantities of that
 * item are deleted.
 * @param req
 * @param res
 * @returns {*}
 * @constructor
 */
const DeleteCartItemById = function (req, res) {
	if (!validateAgainstSchema(ItemIdSchema, req.params)) {
		let msg = 'Cannot remove item(s), invalid configuration';
		return res.status(400).send({error: msg});
	}

	let itemId = req.params.id;

	if (removeCartItem(itemId)) {
		res.end();
	}
	else {
		let msg = 'Cannot remove item(s), item id not found';
		return res.status(400).send({error: msg});
	}
};

/**
 * clears out the cart
 * @param req
 * @param res
 * @constructor
 */
const EmptyCart = function (req, res) {
	cart = [];

	res.end();
};

module.exports = {
	AddTShirt,
	PriceCart,
	AddSweater,
	CartContents,
	EmptyCart,
	DeleteCartItemById,
	UpdateCartItemQuantityById
};
