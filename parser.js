const readline = require("readline");
const GlobalMercator = require('./converter');
const globalMercator = new GlobalMercator();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

let coords = [];
rl.question("Enter lat, lon, zoom: ", (input) => {
    coords = input.split(',').map(item => item.trim());

    const lat = Number(coords[0]);
    const lon = Number(coords[1]);
    const zoom = Number(coords[2]);

    const tile = globalMercator.LatLonToTile(lat, lon, zoom);
    const googleTile = globalMercator.GoogleTile(tile.tx, tile.ty, zoom);
    process.stdout.write("Web Mercator: ");
    console.log(googleTile);

    const degreesPerPixel = 1 / ( ((2**zoom) / 360) * 512 );
    const crs84Tile = globalMercator.LatLonToCRS84Tile(lat, lon, degreesPerPixel);
    process.stdout.write("CRS84: ");
    console.log(crs84Tile);

    console.log(`Google Map: http://mt1.google.com/vt/hl=en&z=${zoom}&y=${googleTile.ty}&x=${googleTile.tx}`)
    console.log(`Satellite:  http://mt1.google.com/vt/lyrs=s&x=${googleTile.tx}&y=${googleTile.ty}&z=${zoom}`)
    rl.close();
});