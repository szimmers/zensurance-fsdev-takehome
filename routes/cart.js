const Ajv = require('ajv');
const validator = new Ajv();

const {TShirtValidationSchema, SweaterValidationSchema} = require('../validation/validationSchemas');
const {MaterialTypes, FabricColors, ItemForm} = require('../imports/consts');

/**
 * let's make an in-memory cart. we'll assume a single user so any cart items belong to
 * our single user. the cart is not persisted, it will go away w/ a server reboot. this will
 * give us enough functionality to test adding to the cart, deleting from it, and pricing it.
 * @type {{}}
 */
let cart = {};

/**
 * our cart items need a key. the value will be the quantity of that item.
 * @param form
 * @param material
 * @param color
 * @returns {string}
 */
function makeKey(form, material, color) {
   return `${form}|${material}|${color}`;
}

/**
 * adds an item to the in-memory cart.
 * @param form
 * @param material
 * @param color
 * @param text
 * @param textColor
 * @param qty
 */
function addCartItem(form, material, color, text, textColor, qty) {
    let key = makeKey(form, material, color);

    if (cart[key]) {
        cart[key].qty += qty;
    }
    else {
        cart[key] = {
            form,
            material,
            color,
            text,
            textColor,
            qty
        };
    }
}

/**
 * convenience function for adding t-shirts to the cart
 * @param material
 * @param color
 * @param text
 * @param textColor
 * @param qty
 */
function addTShirtToCart(material, color, text, textColor, qty) {
    addCartItem(ItemForm.TShirt, material, color, text, textColor, qty);
}

/**
 * convenience function for adding sweaters to the cart
 * @param color
 * @param qty
 */
function addSweaterToCart(color, qty) {
    addCartItem(ItemForm.Sweater, MaterialTypes.HeavyCotton, color, undefined, undefined, qty);
}

/**
 * reduces the quantity of cart items. will delete the line item from the cart if the qty
 * goes to zero.
 * @param form
 * @param material
 * @param color
 * @param qtyToDelete
 * @returns {boolean} true if the operation worked, false if the item didn't exist in the cart or the
 * specified qty was greater than the number of items in the cart.
 */
function reduceQtyCartItems(form, material, color, qtyToDelete) {
    let key = makeKey(form, material, color);

    if (!cart[key]) {
        return false;
    }

    let existingQty = cart[key].qty;

    if (qtyToDelete > existingQty) {
        return false;
    }

    if (qtyToDelete === existingQty) {
        delete cart[key];
    }
    else {
        cart[key].qty -= qtyToDelete;
    }

    return true;
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
 * gets the total price of all items in the cart
 * @param req
 * @param res
 * @constructor
 */
const PriceCart = function(req, res) {
    let cartCost = 0;

    for (const [key, value] of Object.entries(cart)) {
        if (value.form === ItemForm.TShirt) {
            let costPerUnit = getTShirtCost(value.material, value.color, value.text, value.textColor);
            cartCost += costPerUnit * value.qty;
        }
        else if (value.form === ItemForm.Sweater) {
            let costPerUnit = getSweaterCost(value.color);
            cartCost += costPerUnit * value.qty;
        }
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
const AddTShirt = function(req, res) {
    let valid = validator.validate(TShirtValidationSchema, req.body);

    if (!valid) {
        console.error(validator.errors);
        validator.errors.forEach(e => {
            let msg = `property <${e.dataPath}>: ${e.message}`;
            console.error(msg);
        });

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

    addTShirtToCart(material, color, text, textColor, qty);

    res.json({
        cartItemCosts: totalCost
    });
};

/**
 * deletes some quantity of t-shirts from the cart
 * @param req
 * @param res
 * @returns {*}
 * @constructor
 */
const DeleteTShirt = function(req, res) {
    let valid = validator.validate(TShirtValidationSchema, req.body);

    if (!valid) {
        validator.errors.forEach(e => {
            let msg = `property <${e.dataPath}>: ${e.message}`;
            console.error(msg);
        });

        let msg = 'Cannot remove t-shirt(s), invalid configuration';
        return res.status(400).send({error: msg});
    }

    let material = req.body.material;
    let color = req.body.color;
    let qty = req.body.qty || 1;

    if (!reduceQtyCartItems(ItemForm.TShirt, material, color, qty)) {
        let msg = 'Cannot remove t-shirt(s), there are not that many in the cart';
        return res.status(400).send({error: msg});
    }

    res.end();
};

/**
 * adds some quantity of sweaters to the cart.
 * @param req
 * @param res
 * @returns {*}
 * @constructor
 */
const AddSweater = function(req, res) {
    let valid = validator.validate(SweaterValidationSchema, req.body);

    if (!valid) {
        validator.errors.forEach(e => {
            let msg = `property <${e.dataPath}>: ${e.message}`;
            console.error(msg);
        });

        let msg = 'Cannot add sweater, invalid configuration';
        return res.status(400).send({error: msg});
    }

    let color = req.body.color;
    let qty = req.body.qty || 1;

    let costPerUnit = getSweaterCost(color);
    let totalCost = costPerUnit * qty;

    addSweaterToCart(color, qty);

    res.json({
        cartItemCosts: totalCost
    });
};

/**
 * deletes some quantity of sweaters from the cart.
 * @param req
 * @param res
 * @returns {*}
 * @constructor
 */
const DeleteSweater = function(req, res) {
    let valid = validator.validate(SweaterValidationSchema, req.body);

    if (!valid) {
        validator.errors.forEach(e => {
            let msg = `property <${e.dataPath}>: ${e.message}`;
            console.error(msg);
        });

        let msg = 'Cannot remove sweater(s), invalid configuration';
        return res.status(400).send({error: msg});
    }

    let color = req.body.color;
    let qty = req.body.qty || 1;

    if (!reduceQtyCartItems(ItemForm.Sweater, MaterialTypes.HeavyCotton, color, qty)) {
        let msg = 'Cannot remove sweater(s), there are not that many in the cart';
        return res.status(400).send({error: msg});
    }

    res.end();
};

module.exports = {AddTShirt, DeleteTShirt, PriceCart, AddSweater, DeleteSweater};
