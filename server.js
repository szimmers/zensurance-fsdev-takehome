const express = require('express');

const {MaterialTypes, FabricColors} = require('./imports/consts');

const app = express();
const bodyParser = require('body-parser');

const port = process.env.PORT || 3001;

const jsonParser = bodyParser.json();

app.post('/api/tshirt', jsonParser, function (req, res) {
    let material = req.body.material;
    let color = req.body.color;

    console.log("material:", material);
    console.log("color:", color);

    if (material === MaterialTypes.HeavyCotton) {
        console.log('found heavy');
    }
    else if (material === MaterialTypes.LightCotton) {
        console.log('found light');
    }

    res.json({"yup":"yup"})

});

app.listen(port, () => console.log(`Listening on port ${port}`));

