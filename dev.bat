cd client 
call .\node_modules\.bin\webpack 
start .\node_modules\.bin\webpack -w

cd ..\server
call build.bat
.\build\Zoo.exe ..\client\dist