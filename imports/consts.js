/**
 * the form of the item (tshirt vs sweater)
 * @type {{TShirt: string, Sweater: string}}
 */
const ItemForm = {
    TShirt: 'TSHIRT',
    Sweater: 'SWEATER'
};

/**
 * the different types of materials the user can order
 * @type {{LightCotton: string, HeavyCotton: string}}
 */
const MaterialTypes = {
    LightCotton: 'COTTON_LIGHT',
    HeavyCotton: 'COTTON_HEAVY'
};

/**
 * all the fabric colors available for ordering
 * @type {{Black: string, White: string, Green: string, Red: string, Pink: string, Yellow: string}}
 */
const FabricColors = {
    Black: 'BLACK',
    White: 'WHITE',
    Green: 'GREEN',
    Red: 'RED',
    Pink: 'PINK',
    Yellow: 'YELLOW'
};

module.exports = {MaterialTypes, FabricColors, ItemForm};