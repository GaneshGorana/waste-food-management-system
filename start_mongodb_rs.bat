@echo off
setlocal enabledelayedexpansion

:: Handle Ctrl + C (SIGINT) gracefully
set "EXIT_FLAG=0"

:: Function to clean up MongoDB processes before exiting
:cleanup
if %EXIT_FLAG%==1 (
    echo.
    echo Stopping MongoDB process...
    taskkill /F /IM mongod.exe > nul 2>&1
    taskkill /F /IM mongosh.exe > nul 2>&1
    echo MongoDB processes stopped.
    exit
)

:: Stop MongoDB service
echo Stopping MongoDB Service...
net stop MongoDB

echo.
echo MongoDB Service Stopped Successfully.
echo.

:: Start MongoDB in a new window to prevent blocking
echo Starting MongoDB Replica Set...
start "MongoDB Server" "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --config "D:\sem 6 project\mongod.replica.cfg"

echo.
echo MongoDB server started.
echo.

:: Wait for MongoDB to initialize
echo Waiting for MongoDB to initialize...
ping 127.0.0.1 -n 5 > nul  

:: Initialize Replica Set
echo Initializing Replica Set...
"C:\Program Files\mongosh\mongosh.exe" --eval "rs.initiate()"

echo.
echo Replica set initiated.
echo.

:: Pause before exit
pause

:: Set flag to handle Ctrl + C and cleanup
set EXIT_FLAG=1
goto cleanup
