@echo off
cd /d %~dp0

call %~dp0/nw/nw.exe /d %~dp0/  --remote-debugging-port=5858