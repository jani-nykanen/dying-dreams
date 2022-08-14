

export const COLUMN_COUNT = 7; // Amount of tiles per row in tileset bitmap


const getTile = (data : Array<number>, width : number, height : number, x : number, y : number, def = 1) : number => {

    if (x < 0 || y < 0 || x >= width || y >= height)
        return def;

    return data[y*width + x];
}


const computeTerrainDataForGroundTile = (data : Array<number>, width : number, height : number, 
    out : Array<number>, x : number, y : number) : void => {

    let neighborhood = new Array<boolean> (9);
    for (let j = -1; j <= 1; ++ j) {

        for (let i = -1; i <= 1; ++ i) {

            neighborhood[(j+1) * 3 + (i+1)] = getTile(data, width, height, x+i, y+j) == 1;
        }
    }
    
    let p = (y*2) * width * 2 + x*2;

    // Top-left tile
    out[p] = 0;
    if (!neighborhood[1] || !neighborhood[3]) {

        if (neighborhood[1])
            out[p] = 4;
        else if (neighborhood[3])
            out[p] = 1;   
        else {

            out[p] = 2;
            if (x > 0) {

                out[p-1] = COLUMN_COUNT + 7;
            }
        }
    }
    else if (!neighborhood[0]) {

        out[p] = 5;
    }

    // Top-right tile
    out[++ p] = 0;
    if (!neighborhood[1] || !neighborhood[5]) {

        if (neighborhood[1])
            out[p] = COLUMN_COUNT + 4;
        else if (neighborhood[5])
            out[p] = 1;   
        else {

            out[p] = 3;
            if (x < width-1) {

                out[p+1] = 7;
            }
        }
    }
    else if (!neighborhood[2]) {

        out[p] = 6;
    }

    // Bottom left tile
    p += (width*2) - 1;
    out[p] = 0;
    if (!neighborhood[7] || !neighborhood[3]) {

        if (neighborhood[7])
            out[p] = 4;
        else if (neighborhood[3])
            out[p] = COLUMN_COUNT+1;   
        else 
            out[p] = COLUMN_COUNT+2;
    }
    else if (!neighborhood[6]) {

        out[p] = COLUMN_COUNT + 5;
    }

    // Bottom right tile
    out[++ p] = 0;
    if (!neighborhood[7] || !neighborhood[5]) {

        if (neighborhood[7])
            out[p] = COLUMN_COUNT + 4;
        else if (neighborhood[5])
            out[p] = COLUMN_COUNT+1;   
        else 
            out[p] = COLUMN_COUNT+3;
    }
    else if (!neighborhood[8]) {

        out[p] = COLUMN_COUNT + 6;
    }
}



export const createTerrainMap = (data : Array<number>, width : number, height : number) : Array<number> => {

    let out = (new Array<number> (width*height*4)).fill(-1);

    let tid : number;
    for (let y = 0; y < height; ++ y) {

        for (let x = 0; x < width; ++ x) {

            tid = data[y * width + x];
            if (tid != 1)
                continue;

            computeTerrainDataForGroundTile(data, width, height, out, x, y);
        }
    }
    return out;
}
