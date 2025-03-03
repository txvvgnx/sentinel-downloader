#!/bin/bash

read -p "Enter directory where tiles are stored: " TIFF_DIR
read -p "Enter the zoom level of the tileset: " ZOOM_LEVEL

VRT_OUTPUT="./tiles/tileset.vrt"
REPROJECTED_VRT="./tiles/tileset_reprojected.vrt"
TILE_OUTPUT_DIR="./tiles"
MAXIMUM_INDEX=$((2**ZOOM_LEVEL - 1))

# Merge the tiles into a single VRT file
printf "\nBuilding VRT from TIFF files in $TIFF_DIR\n"
gdalbuildvrt $VRT_OUTPUT $TIFF_DIR/*.tif

# Reproject VRT from WGS84 to Web Mercator
printf "\nReprojecting WGS84 to Web Mercator\n"
gdalwarp -s_srs EPSG:4326 -t_srs EPSG:3857 $VRT_OUTPUT $REPROJECTED_VRT

# Create tileset at specified zoom level
printf "\nCreating Web Mercator tileset at $ZOOM_LEVEL\n"
gdal2tiles.py -z $ZOOM_LEVEL $REPROJECTED_VRT $TILE_OUTPUT_DIR

rename_file() {
    local file="$1"
    local filename=$(basename "$file")
    local extension="${filename##*.}"  
    local base_name="${filename%.*}"

    # Only rename files with numeric names
    if [[ "$base_name" =~ ^[0-9]+$ ]]; then
        local new_name=$((MAXIMUM_INDEX - base_name))
        local dir=$(dirname "$file")

        if [ ! -e "$dir/$new_name.$extension" ]; then
            mv "$file" "$dir/$new_name.$extension"
            echo "Renamed $filename to $new_name.$extension"
        else
            echo "File $new_name.$extension already exists, skipping."
        fi
    else
        echo "Skipping $filename, base name is not numeric."
    fi
}

# Rename files to fix Web Mercator starting from bottom instead of top
find $TILE_OUTPUT_DIR -type f | while read -r file; do
    rename_file "$file"
done

printf "\nProcess complete. Tiles are saved in $TILE_OUTPUT_DIR."