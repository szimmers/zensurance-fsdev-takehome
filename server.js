const express = require('express');
const Ajv = require('ajv');
const validator = new Ajv();

const {MaterialTypes, FabricColors} = require('./imports/consts');

const app = express();
const bodyParser = require('body-parser');

const port = process.env.PORT || 3001;

const jsonParser = bodyParser.json();

/**
 * schema for validating tshirt orders
 * @type {{properties: {material: {enum: string[]}, color: {enum: string[]}}}}
 */
const tshirtSchema = {
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

app.post('/api/tshirt', jsonParser, function (req, res) {
    let valid = validator.validate(tshirtSchema, req.body);

    if (!valid) {
        validator.errors.forEach(e => {
            let msg = `property <${e.dataPath}>: ${e.message}`;
            console.error(msg);
        });

        let msg = 'Invalid configuration';
        return res.status(400).send({error: msg});
    }

    let material = req.body.material;
    let color = req.body.color;
    let qty = req.body.qty || 1;

    let costPerUnit = getTShirtCost(material, color);
    let totalCost = costPerUnit * qty;

    res.json({
        "totalCost": totalCost
    });

});

app.listen(port, () => console.log(`Listening on port ${port}`));

