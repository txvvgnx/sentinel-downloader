This tool assists in downloading and converting 2016 Sentinel-2 cloudless map tiles from [`EOX's AWS S3 bucket`](https://eox.at/2017/03/sentinel-2-cloudless-original-tiles-available/), which is by far the most affordable way to host Sentinel-2 imagery offline.

## Important notice
The S3 bucket is set to **requester pays**, meaning that your download **may not be free**. Check pricing using [the AWS calculator](https://calculator.aws/#/createCalculator/S3). The tileset is hosted in `eu-central-1` and has a size of ~200GB when fully downloaded (estimation only, based on full 2016 data sets for sale).

## Setup
1. Run `npm i` to install all dependencies.
2. Install and sign in to the AWS CLI.
3. Install `gdal` tools and make sure they are accessible from the terminal.

## Usage
*To understand the map tiling system and what "rows and columns" mean, read [this section](#but-how-do-map-tiles-work)*
1. Identify the latitude and longitude boundaries of the area you wish to download satellite images for.
2. Use `npm run parser` and input Lat/Lng coordinates and zoom values. The parser will return CRS84 and Web Mercator row and column (XY) values. *For example: 1308,1188*
3. After converting both boundary points to CRS84, use `npm run download` to download tiles from your specified starting and ending row and column values.
4. To make these map tiles usable in applications, convert them from `WGS84 (EPSG:4326)` to `Web Mercator (EPSG:3857)` by running `tiler.sh`
5. Use `npm run server` to run the map server. Tiles are served in the format `http://localhost:8080/{zoomLevel}/{x}/{y}.png`

## But how do map tiles work?
The Earth is really, really big, and so it is simply not possible to store a very detailed image of it in a single file. To solve this, maps are broken up into many small images (tiles), and mapping software pieces these tiles together to create a detailed image.

Tiles are stored in a table-like structure, and mapping software obtains these tiles by accessing a particular row and column, which corresponds to a specific tile that represents a place on Earth. `parser.js` translates Latitude/Longitude coordinates into rows and columns in the tile table. 

Zoom levels influence the level of detail a tileset has. A higher zoom = bigger table = more tiles, meaning that a particular row and column for one zoom level does not represent the same location at a different zoom level.

Finally, there are multiple ways in which tiles can be stored. The original tileset uses the WGS84 system, whereas most mapping software require a Web Mercator tileset. These 2 tiling systems are not compatible and a rather complicated conversion is required to switch between the two. Fortunately, there already exists an open source tool `gdal` that can do all the work for us.

## Contributing/issues
This tool has not been thoroughly tested, especially with very large data sets (i.e. converting/downloading the entire tileset at once). Feel free to report any issues and/or contribute features/bug fixes.