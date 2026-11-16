$ErrorActionPreference='Stop';$ProgressPreference='SilentlyContinue'
$root='E:\Services\PaulislavaCMS'
function Health([string]$url='http://127.0.0.1:1337/_health') {
 for($i=0;$i -lt 90;$i++) {
  try {$r=Invoke-WebRequest $url -UseBasicParsing -TimeoutSec 2;if($r.StatusCode -eq 204){return}}catch{}
  Start-Sleep 2
 }
 throw 'CMS health timeout'
}
function LocalServiceTask([string]$name,[string]$script){
 [IO.File]::WriteAllText("$root\migration\$name.ps1",$script,[Text.UTF8Encoding]::new($false))
 $a=New-ScheduledTaskAction -Execute powershell.exe -Argument "-NoProfile -ExecutionPolicy Bypass -File $root\migration\$name.ps1"
 $p=New-ScheduledTaskPrincipal -UserId 'NT AUTHORITY\LocalService' -LogonType ServiceAccount
 Register-ScheduledTask -TaskName "CMS$name" -Action $a -Principal $p -Force | Out-Null
 Start-ScheduledTask "CMS$name"
 Start-Sleep 2
 for($i=0;$i -lt 60;$i++){if((Get-ScheduledTask "CMS$name").State -ne 'Running'){break};Start-Sleep 2}
 if((Get-ScheduledTaskInfo "CMS$name").LastTaskResult -ne 0){throw "Task $name failed"}
}
Health
'Initial health passed'
Stop-Service PaulislavaCMS -Force
if((Get-Service PaulislavaCMS).Status -ne 'Stopped'){throw 'SCM stop failed'}
try {Invoke-WebRequest http://127.0.0.1:1337/_health -UseBasicParsing -TimeoutSec 2 | Out-Null;throw 'Stopped CMS still serving'}catch {if($_.Exception.Message -eq 'Stopped CMS still serving'){throw}}
'Synchronous stop passed'
LocalServiceTask 'Cold' @'
$ErrorActionPreference='Continue'
wsl.exe --terminate PaulislavaCMS > E:\Services\PaulislavaCMS\migration\cold.log 2>&1
wsl.exe -d PaulislavaCMS -u root -- bash -c 'if systemctl is-active --quiet docker; then exit 1; fi; if pgrep -f "[n]ode_modules/.bin/strapi" >/dev/null; then exit 2; fi' >> E:\Services\PaulislavaCMS\migration\cold.log 2>&1
exit $LASTEXITCODE
'@
'Cold WSL boot kept CMS and Docker stopped'
Start-Service PaulislavaCMS
Start-Service PaulislavaCMSFRP
Health
'Explicit SCM start passed'
Restart-Service PaulislavaCMS -Force
Start-Service PaulislavaCMSFRP
Health
'Explicit SCM restart passed'
LocalServiceTask 'Crash' @'
wsl.exe --terminate PaulislavaCMS > E:\Services\PaulislavaCMS\migration\crash.log 2>&1
exit $LASTEXITCODE
'@
Start-Sleep 8
Health
if((Get-Service PaulislavaCMS).Status -ne 'Running'){throw 'SCM did not recover'}
'WSL crash recovery passed'
Restart-Service PaulislavaCMSFRP
Health 'https://cms.paulislava.space/_health'
'FRP restart passed with public HTTPS health'
Get-Service PaulislavaCMS,PaulislavaCMSFRP,postgresql-x64-18,Human4AI,SiestaNetAPI | Select-Object Name,Status
'ALL LIFECYCLE CHECKS PASSED'
