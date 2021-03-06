/**
 * schema for valid configurations of t-shirt orders
 * @type {{required: string[], additionalProperties: boolean, properties: {material: {type: string, enum: string[]}, color: {type: string, enum: string[]}, qty: {type: string, minimum: number, maximum: number}}}}
 */
const TShirtValidationSchema = {
    required: ["material", "color"],
    additionalProperties: false,
    properties: {
        material: {
            type: "string",
            enum: ["COTTON_LIGHT", "COTTON_HEAVY"]
        },
        color: {
            type: "string",
            enum: ["BLACK", "WHITE", "GREEN", "RED"]
        },
        text: {
            type: "string",
            minLength: 1,
            maxLength: 8
        },
        textColor: {
            type: "string",
            enum: ["BLACK", "WHITE", "GREEN", "RED"]
        },
        qty: {
            type: "integer",
            minimum: 1,
            maximum: 99
        }
    },
    if: {
        properties: {
            text: {
                minLength: 1
            },
        },
        required: ["text"],
    },
    then: {required: ["textColor"]},
};

/**
 * schema for valid configurations of sweater orders
 * @type {{required: string[], additionalProperties: boolean, properties: {color: {type: string, enum: string[]}, qty: {type: string, minimum: number, maximum: number}}}}
 */
const SweaterValidationSchema = {
    required: ["color"],
    additionalProperties: false,
    properties: {
        color: {
            type: "string",
            enum: ["BLACK", "WHITE", "PINK", "YELLOW"]
        },
        qty: {
            type: "integer",
            minimum: 1,
            maximum: 99
        }
    }
};

/**
 * schema for setting a new quantity on a line item
 * @type {{required: string[], additionalProperties: boolean, properties: {qty: {type: string, minimum: number, maximum: number}}}}
 */
const CartItemUpdateQuantitySchema = {
    required: ["qty"],
    additionalProperties: false,
    properties: {
        qty: {
            type: "integer",
            minimum: 1,
            maximum: 99
        }
    }
};

/**
 * schema for the ids assigned in the cart. they're always 36 chars.
 * @type {{required: string[], additionalProperties: boolean, properties: {id: {type: string, minLength: number, maxLength: number}}}}
 */
const ItemIdSchema = {
    required: ["id"],
    additionalProperties: false,
    properties: {
        id: {
            type: "string",
            minLength: 36,
            maxLength: 36
        }
    }
};

module.exports = {TShirtValidationSchema, SweaterValidationSchema, CartItemUpdateQuantitySchema, ItemIdSchema};