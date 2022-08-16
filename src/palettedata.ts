

// Tileset
const TILESET_BLOCK_1 = [ 
    0,
    0b100100,
    0b011011,
    0b111111
];
const TILESET_BLOCK_2 = [ 
    0,
    0b100100,
    0b111001,
    -1
];
const TILESET_BLOCK_3 = [ 
    0,
    0b010101,
    0b101010,
    -1
];
const TILESET_BLOCK_4 = [ 
    0,
    0b100100,
    0b111001,
    0b111111
];
const TILESET_BLOCK_5 = [ 
    0,
    0b100100,
    0b111001,
    0b011011
];
const TILESET_BLOCK_6 = [ 
    0,
    -1,
    0b011011,
    0b111111
];


export const PALETTE1 = [

    // Line 1
    TILESET_BLOCK_1, TILESET_BLOCK_1, TILESET_BLOCK_1, TILESET_BLOCK_2, 
    TILESET_BLOCK_5, TILESET_BLOCK_4, TILESET_BLOCK_6, TILESET_BLOCK_3, 
    TILESET_BLOCK_2, TILESET_BLOCK_1,
    // Line 2
    TILESET_BLOCK_2, TILESET_BLOCK_2, TILESET_BLOCK_2, TILESET_BLOCK_2, 
    TILESET_BLOCK_2, TILESET_BLOCK_2, TILESET_BLOCK_6, TILESET_BLOCK_3,  
    TILESET_BLOCK_2, TILESET_BLOCK_1,

    // Line 3
    TILESET_BLOCK_2, TILESET_BLOCK_2, TILESET_BLOCK_2, TILESET_BLOCK_2,
    TILESET_BLOCK_2, TILESET_BLOCK_2, TILESET_BLOCK_2, TILESET_BLOCK_2,
    TILESET_BLOCK_2, TILESET_BLOCK_2,

    // Line 4
    TILESET_BLOCK_2, TILESET_BLOCK_2, TILESET_BLOCK_2, TILESET_BLOCK_2,
    TILESET_BLOCK_2, TILESET_BLOCK_2, TILESET_BLOCK_2, TILESET_BLOCK_2,
    TILESET_BLOCK_2, TILESET_BLOCK_2,

    // Line 5
    TILESET_BLOCK_2, TILESET_BLOCK_2, TILESET_BLOCK_2, TILESET_BLOCK_2,
    TILESET_BLOCK_2, TILESET_BLOCK_2, TILESET_BLOCK_2, TILESET_BLOCK_2,
    TILESET_BLOCK_2, TILESET_BLOCK_2,

    // Line 6
    TILESET_BLOCK_2, TILESET_BLOCK_2, TILESET_BLOCK_2, TILESET_BLOCK_2,
    TILESET_BLOCK_2, TILESET_BLOCK_2, TILESET_BLOCK_2, TILESET_BLOCK_2,
    TILESET_BLOCK_2, TILESET_BLOCK_2,
];
