$ErrorActionPreference='Stop';$ProgressPreference='SilentlyContinue'
$root='E:\Services\PaulislavaS3'
function Health([string]$url='http://127.0.0.1:19000/health/ready') {
 for($i=0;$i -lt 90;$i++) {
  try {$r=Invoke-WebRequest $url -UseBasicParsing -TimeoutSec 2;if($r.StatusCode -eq 200){return}}catch{}
  Start-Sleep 2
 }
 throw 'S3 health timeout'
}
function LocalServiceTask([string]$name,[string]$script){
 [IO.File]::WriteAllText("$root\migration\$name.ps1",$script,[Text.UTF8Encoding]::new($false))
 $a=New-ScheduledTaskAction -Execute powershell.exe -Argument "-NoProfile -ExecutionPolicy Bypass -File $root\migration\$name.ps1"
 $p=New-ScheduledTaskPrincipal -UserId 'NT AUTHORITY\LocalService' -LogonType ServiceAccount
 Register-ScheduledTask -TaskName "S3$name" -Action $a -Principal $p -Force | Out-Null
 Start-ScheduledTask "S3$name"
 Start-Sleep 2
 for($i=0;$i -lt 60;$i++){if((Get-ScheduledTask "S3$name").State -ne 'Running'){break};Start-Sleep 2}
 if((Get-ScheduledTaskInfo "S3$name").LastTaskResult -ne 0){throw "Task $name failed"}
}
Health
'Initial S3 health passed'
Stop-Service PaulislavaS3 -Force
if((Get-Service PaulislavaS3).Status -ne 'Stopped'){throw 'SCM stop failed'}
try {Invoke-WebRequest http://127.0.0.1:19000/health/ready -UseBasicParsing -TimeoutSec 2 | Out-Null;throw 'Stopped S3 still serving'}catch {if($_.Exception.Message -eq 'Stopped S3 still serving'){throw}}
'Synchronous stop passed'
LocalServiceTask 'Cold' @'
$ErrorActionPreference='Continue'
wsl.exe --terminate PaulislavaS3 > E:\Services\PaulislavaS3\migration\cold.log 2>&1
wsl.exe -d PaulislavaS3 -u root -- bash -c 'if systemctl is-active --quiet docker; then exit 1; fi; if pgrep -f "[r]ustfs" >/dev/null; then exit 2; fi' >> E:\Services\PaulislavaS3\migration\cold.log 2>&1
exit $LASTEXITCODE
'@
'Cold WSL boot kept S3 and Docker stopped'
Start-Service PaulislavaS3
Start-Service PaulislavaS3FRP
Health
'Explicit SCM start passed'
LocalServiceTask 'PersistStart' @'
wsl.exe -d PaulislavaS3 -u root --exec /opt/s3/venv/bin/python /mnt/e/Services/PaulislavaS3/migration/check-persistence.py verify
exit $LASTEXITCODE
'@
Restart-Service PaulislavaS3 -Force
Start-Service PaulislavaS3FRP
Health
'Explicit SCM restart passed'
LocalServiceTask 'Crash' @'
wsl.exe --terminate PaulislavaS3 > E:\Services\PaulislavaS3\migration\crash.log 2>&1
exit $LASTEXITCODE
'@
Start-Sleep 8
Health
if((Get-Service PaulislavaS3).Status -ne 'Running'){throw 'SCM did not recover'}
'WSL crash recovery passed'
LocalServiceTask 'PersistCrash' @'
wsl.exe -d PaulislavaS3 -u root --exec /opt/s3/venv/bin/python /mnt/e/Services/PaulislavaS3/migration/check-persistence.py verify
exit $LASTEXITCODE
'@
Restart-Service PaulislavaS3FRP
Health 'https://cdn.paulislava.space/health/ready'
'FRP restart passed with public HTTPS health'
Get-Service PaulislavaS3,PaulislavaS3FRP,postgresql-x64-18,Human4AI,SiestaNetAPI | Select-Object Name,Status
'ALL LIFECYCLE CHECKS PASSED'
