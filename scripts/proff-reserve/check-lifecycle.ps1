$ErrorActionPreference='Stop'
$name='PaulislavaProff'
function Wait-Healthy {
    for($i=0;$i -lt 60;$i++){
        try{$r=Invoke-WebRequest -UseBasicParsing http://127.0.0.1:13001/healthz -TimeoutSec 2;if($r.StatusCode -eq 200 -and $r.Content -eq 'ok'){return}}catch{}
        Start-Sleep -Milliseconds 500
    }
    throw 'Health check timed out'
}
function Assert-Loopback {
    $listeners=@(Get-NetTCPConnection -State Listen -LocalPort 13001,13002 -ErrorAction SilentlyContinue)
    if($listeners.Count -ne 2 -or @($listeners | Where-Object {$_.LocalAddress -ne '127.0.0.1'}).Count){throw 'Unexpected listener binding'}
}
$frp=Get-Service PaulislavaProffFRP -ErrorAction SilentlyContinue
$frpWasRunning=$frp -and $frp.Status -eq 'Running'
if($frpWasRunning){Stop-Service PaulislavaProffFRP}
try {
Wait-Healthy
Assert-Loopback
Stop-Service $name
Start-Sleep -Seconds 2
if(Get-NetTCPConnection -State Listen -LocalPort 13001,13002 -ErrorAction SilentlyContinue){throw 'Runtime survived SCM Stop'}
'Stop: both listeners removed'
Start-Service $name
Wait-Healthy
Assert-Loopback
'Start: healthy on loopback'
Restart-Service $name
Wait-Healthy
Assert-Loopback
'Restart: healthy on loopback'
$old=(Get-NetTCPConnection -State Listen -LocalPort 13001).OwningProcess
Stop-Process -Id $old -Force
Start-Sleep -Seconds 1
Wait-Healthy
Assert-Loopback
$new=(Get-NetTCPConnection -State Listen -LocalPort 13001).OwningProcess
if($new -eq $old){throw 'Crash did not replace child process'}
'Crash recovery: replacement process healthy'
Get-CimInstance Win32_Service -Filter "Name='PaulislavaProff'" | Select-Object Name,State,StartMode,StartName
Get-NetTCPConnection -State Listen -LocalPort 13001,13002 | Format-Table LocalAddress,LocalPort,OwningProcess

} finally {
    # Restore the original dependent service after both successful and failed checks.
    if((Get-Service $name).Status -ne 'Running'){Start-Service $name}
    if($frpWasRunning){Start-Service PaulislavaProffFRP}
}
