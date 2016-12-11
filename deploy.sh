#!/usr/bin/env bash

# Build
(cd client && webpack)
(cd server && bash build.sh)

rm -rf out
rm out.zip

# Make out directory and move bits inside
mkdir out
cp -R client/dist ./out/static
cp -R server/build ./out/server

# Create a run.sh file
(cat <<EOF
mono ./server/Zoo.exe ./static
EOF
) > out/run.sh

chmod +x out/run.sh

# Zip Folder creation
zip -r out.zip out