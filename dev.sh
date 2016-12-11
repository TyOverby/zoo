#!/usr/bin/env bash

(cd client && webpack -w) &
(cd server && bash build.sh && mono build/Zoo.exe ../client/dist) 