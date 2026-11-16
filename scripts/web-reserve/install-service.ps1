$ErrorActionPreference='Stop'
$root='E:\Services\PaulislavaWeb';$nssm="$root\nssm.exe"
if(Get-Service PaulislavaWeb -ErrorAction SilentlyContinue){throw 'Service already exists; update it without reinstalling'}
& $nssm install PaulislavaWeb C:\Windows\System32\wsl.exe
& $nssm set PaulislavaWeb AppParameters '-d PaulislavaWeb -u root -- /usr/local/bin/web-windows-service'
& $nssm set PaulislavaWeb AppDirectory $root
& $nssm set PaulislavaWeb ObjectName 'NT AUTHORITY\LocalService'
& $nssm set PaulislavaWeb Start SERVICE_AUTO_START
& $nssm set PaulislavaWeb AppExit Default Restart
& $nssm set PaulislavaWeb AppRestartDelay 5000
& $nssm set PaulislavaWeb AppStopMethodConsole 60000
& $nssm set PaulislavaWeb AppStdout "$root\logs\web.log"
& $nssm set PaulislavaWeb AppStderr "$root\logs\web-error.log"
& $nssm set PaulislavaWeb AppRotateFiles 1
& $nssm set PaulislavaWeb AppRotateBytes 10485760
& $nssm set PaulislavaWeb AppEvents Stop/Pre 'C:\Windows\System32\wsl.exe -d PaulislavaWeb -u root -- /usr/local/bin/web-stop-windows-service'
& $nssm set PaulislavaWeb DependOnService PaulislavaCMS
sc.exe failure PaulislavaWeb reset= 86400 actions= restart/5000/restart/5000/restart/15000
if($LASTEXITCODE -ne 0){throw 'Service recovery setup failed'}
Start-Service PaulislavaWeb
Get-Service PaulislavaWeb
