const express = require('express');
const Ajv = require('ajv');
const ajv = new Ajv();

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
    "properties": {
        "material": { "enum": ["COTTON_LIGHT", "COTTON_HEAVY"] },
        "color": { "enum": ["BLACK", "WHITE", "GREEN", "RED"] }
    }
};

app.post('/api/tshirt', jsonParser, function (req, res) {
    let material = req.body.material;
    let color = req.body.color;

    /*
    console.log("material:", material);
    console.log("color:", color);

    if (material === MaterialTypes.HeavyCotton) {
        console.log('found heavy');
    }
    else if (material === MaterialTypes.LightCotton) {
        console.log('found light');
    }
    */

    let valid = ajv.validate(tshirtSchema, req.body);

    if (!valid) {
        ajv.errors.forEach(e => {
            let msg = `property <${e.dataPath}>: ${e.message}`;
            console.error(msg);
        });

        let msg = 'Invalid configuration';
        return res.status(400).send({error: msg});
    }

    res.json({"yup":"yup"})

});

app.listen(port, () => console.log(`Listening on port ${port}`));

