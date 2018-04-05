const Ajv = require('ajv');
const validator = new Ajv();

const {TShirtValidationSchema} = require('../validation/validationSchemas');
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
 * @param qty
 */
function addCartItem(form, material, color, qty) {
    let key = makeKey(form, material, color);

    if (cart[key]) {
        cart[key].qty += qty;
    }
    else {
        cart[key] = {
            form,
            material,
            color,
            qty
        };
    }
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

function getTShirtCost(material, color) {
    let cost = 16.95;

    if (material === MaterialTypes.HeavyCotton) {
        cost += 3;
    }

    if (color === FabricColors.Green || color === FabricColors.Red) {
        cost += 2;
    }

    return cost;
}

const AddTShirt = function(req, res) {
    let valid = validator.validate(TShirtValidationSchema, req.body);

    if (!valid) {
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

    let costPerUnit = getTShirtCost(material, color);
    let totalCost = costPerUnit * qty;

    addCartItem(ItemForm.TShirt, material, color, qty);
    console.log(cart)

    res.json({
        cartItemCosts: totalCost
    });
};

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

module.exports = {AddTShirt, DeleteTShirt};
