import platform
import subprocess
import time

windowsCall = "C:\\WINDOWS\\system32\\WindowsPowerShell\\v1.0\\powershell.exe . \"./windowsproc.ps1\";"
linuxCall = "ps -p $(xdotool getactivewindow getwindowpid) -o comm"

def getCurrentWindowProcessName():
    system = platform.system()
    if system == 'Windows':
        output = subprocess.check_output(windowsCall.split())
        lastLine = output.split("\r\n")[3].split()
        return " ".join(lastLine[7:])
    elif system == 'Linux':
        return subprocess.check_output(linuxCall.split())

while True:
    time.sleep(1)
    print(getCurrentWindowProcessName())