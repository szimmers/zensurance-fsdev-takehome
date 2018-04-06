const Ajv = require('ajv');
const validator = new Ajv();

/**
 * given an Ajv schema and data, validate the data against the schema. if it fails,
 * log to the error console.
 * @param schema
 * @param data
 * @returns {boolean}   true if the data passes, false otherwise
 */
const validateAgainstSchema = function(schema, data) {
    let valid = validator.validate(schema, data);

    if (!valid) {
        validator.errors.forEach(e => {
            let msg = `property <${e.dataPath}>: ${e.message}`;
            console.error(msg);
        });

        return false;
    }

    return true;
};

module.exports = {validateAgainstSchema};
