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

module.exports = {TShirtValidationSchema};