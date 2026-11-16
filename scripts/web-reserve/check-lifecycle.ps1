$ErrorActionPreference='Stop';$ProgressPreference='SilentlyContinue'
$root='E:\Services\PaulislavaWeb'
function Health {
 for($i=0;$i -lt 90;$i++){
  try {$r=Invoke-WebRequest http://127.0.0.1:13000/api/health -UseBasicParsing -TimeoutSec 2;if($r.StatusCode -eq 200 -and ($r.Content | ConvertFrom-Json).status -eq 'ok'){return}}catch{}
  Start-Sleep 2
 }
 throw 'Web health timeout'
}
function LocalServiceTask([string]$name,[string]$script){
 [IO.File]::WriteAllText("$root\migration\$name.ps1",$script,[Text.UTF8Encoding]::new($false))
 $a=New-ScheduledTaskAction -Execute powershell.exe -Argument "-NoProfile -ExecutionPolicy Bypass -File $root\migration\$name.ps1"
 $p=New-ScheduledTaskPrincipal -UserId 'NT AUTHORITY\LocalService' -LogonType ServiceAccount
 Register-ScheduledTask -TaskName "Web$name" -Action $a -Principal $p -Force | Out-Null
 Start-ScheduledTask "Web$name"
 Start-Sleep 2
 for($i=0;$i -lt 60;$i++){if((Get-ScheduledTask "Web$name").State -ne 'Running'){break};Start-Sleep 2}
 if((Get-ScheduledTask "Web$name").State -eq 'Running'){throw "Task $name timeout"}
 if((Get-ScheduledTaskInfo "Web$name").LastTaskResult -ne 0){throw "Task $name failed"}
}
Health
'Initial health passed'
Stop-Service PaulislavaWeb -Force
if((Get-Service PaulislavaWeb).Status -ne 'Stopped'){throw 'SCM stop failed'}
try {Invoke-WebRequest http://127.0.0.1:13000/api/health -UseBasicParsing -TimeoutSec 2 | Out-Null;throw 'Stopped web still serving'}catch {if($_.Exception.Message -eq 'Stopped web still serving'){throw}}
'Synchronous stop passed'
LocalServiceTask 'Cold' @'
$ErrorActionPreference='Continue'
wsl.exe --terminate PaulislavaWeb *> E:\Services\PaulislavaWeb\migration\cold.log
wsl.exe -d PaulislavaWeb -u root -- bash /mnt/e/Services/PaulislavaWeb/migration/cold-check.sh >> E:\Services\PaulislavaWeb\migration\cold.log 2>&1
exit $LASTEXITCODE
'@
'Cold WSL boot kept web and Docker stopped'
Start-Service PaulislavaWeb
Health
'Explicit SCM start passed'
Restart-Service PaulislavaWeb -Force
Health
'Explicit SCM restart passed'
LocalServiceTask 'Crash' @'
wsl.exe --terminate PaulislavaWeb *> E:\Services\PaulislavaWeb\migration\crash.log
exit $LASTEXITCODE
'@
Start-Sleep 8
Health
if((Get-Service PaulislavaWeb).Status -ne 'Running'){throw 'SCM did not recover'}
'WSL crash recovery passed'
Get-Service PaulislavaWeb,PaulislavaCMS,PaulislavaS3 | Select-Object Name,Status
'ALL LOCAL LIFECYCLE CHECKS PASSED'
