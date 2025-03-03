const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const readlineSync = require('readline-sync');
const path = require('path');
const fs = require('fs');

function parseCoordinates(input) {
    const parts = input.split(',').map(part => part.trim());
    if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) {
        console.log(`Please enter coordinates in "num,num" format`);
        process.exit(1);
    }
    return parts.map(Number);
}

const crs84StartXY = parseCoordinates(readlineSync.question('Enter CRS84 starting XY/RowCol: '));
const crs84EndXY = parseCoordinates(readlineSync.question('Enter CRS84 ending XY/RowCol: '));

const zoomLevel = Number(readlineSync.question('Enter zoom level: ').trim());
if (isNaN(zoomLevel)) { console.log(`Enter only 1 number`); process.exit(1); }

console.log('\nCoordinates to download:');
console.log({ crs84StartXY, crs84EndXY });
console.log(`Zoom level: ${zoomLevel}`)

const cont = readlineSync.question("\nThe following process may not be free. Make sure you have the right coordinates. Continue? (Y/N) ");
if (cont.toLowerCase() != 'y') process.exit(1);

// Z(ZOOM) --> X(COL) --> Y(ROW)

const s3 = new S3Client({ region: 'eu-central-1' });

async function downloadTile(x, y) {
    const params = {
        Bucket: 'eox-s2maps',
        Key: `tiles/${zoomLevel}/${y}/${x}.tif`,
        RequestPayer: 'requester'
    };
    const outputPath = path.join(process.cwd(), 'rawtiles', `level${zoomLevel.toString()}`, `${zoomLevel.toString()}-${y.toString()}-${x.toString()}.tif`);

    try {
        const dirPath = path.dirname(outputPath);
        fs.mkdirSync(dirPath, { recursive: true });

        const { Body } = await s3.send(new GetObjectCommand(params));
        const fileStream = fs.createWriteStream(outputPath);
        Body.pipe(fileStream);
        fileStream.once('close', () => {
            console.log(`Downloaded tiles/${zoomLevel}/${y}/${x}.tif to ${outputPath}`);
        });
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
}

async function downloadTilesInRange() {
    for (i = crs84StartXY[0]; i <= crs84EndXY[0]; i++) {
        for (j = crs84StartXY[1]; j <= crs84EndXY[1]; j++) {
            await downloadTile(i, j);
        }
    }
}
downloadTilesInRange();