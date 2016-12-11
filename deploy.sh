#!/usr/bin/env bash

(cd client && webpack)
(cd server && bash build.sh)

rm -rf out
mkdir out
cp -R client/dist ./out/static
cp -R server/build ./out/server

(cat <<EOF
mono ./server/Zoo.exe ./static
EOF
) > out/run.sh

chmod +x out/run.sh