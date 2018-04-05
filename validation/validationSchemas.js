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
        qty: {
            type: "integer",
            minimum: 1,
            maximum: 99
        }
    }
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

module.exports = {TShirtValidationSchema, SweaterValidationSchema};