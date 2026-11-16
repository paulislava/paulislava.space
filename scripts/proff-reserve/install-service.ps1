$ErrorActionPreference='Stop'
$base='E:\Services\PaulislavaProff'
$name='PaulislavaProff'
if(Get-Service $name -ErrorAction SilentlyContinue){throw 'Service exists; inspect before updating'}
if(Get-NetTCPConnection -State Listen -LocalPort 13001,13002 -ErrorAction SilentlyContinue){throw 'Proff port already occupied'}
Copy-Item E:\Services\PaulislavaCMS\nssm.exe "$base\nssm.exe"
$nssm="$base\nssm.exe"
& $nssm install $name C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe
if($LASTEXITCODE -ne 0){throw 'NSSM installation failed'}
& $nssm set $name AppParameters "-NoProfile -NonInteractive -ExecutionPolicy Bypass -File $base\runtime.ps1"
& $nssm set $name AppDirectory $base
& $nssm set $name ObjectName 'NT AUTHORITY\LocalService' ''
& $nssm set $name Start SERVICE_AUTO_START
& $nssm set $name AppExit Default Restart
& $nssm set $name AppRestartDelay 3000
& $nssm set $name AppThrottle 3000
& $nssm set $name AppKillProcessTree 1
& $nssm set $name AppStopMethodConsole 3000
& $nssm set $name AppStopMethodWindow 1000
& $nssm set $name AppStopMethodThreads 1000
& $nssm set $name AppStdout NUL
& $nssm set $name AppStderr NUL
& sc.exe sidtype $name unrestricted
& sc.exe failure $name reset= 86400 actions= restart/5000/restart/15000/restart/30000
# Service-specific SID grants prevent other LocalService services from reading credentials.
& icacls.exe $base /inheritance:r /grant:r '*S-1-5-32-544:(OI)(CI)F' '*S-1-5-18:(OI)(CI)F' "NT SERVICE\${name}:(OI)(CI)RX" /Q
& icacls.exe "$base\*" /reset /T /Q
if($LASTEXITCODE -ne 0){throw 'Base ACL failed'}
foreach($dir in 'logs','tmp'){
    & icacls.exe "$base\$dir" /grant:r "NT SERVICE\${name}:(OI)(CI)M" /Q
    if($LASTEXITCODE -ne 0){throw 'Writable directory ACL failed'}
}
& icacls.exe "$base\data" /grant:r "NT SERVICE\${name}:(OI)(CI)M" /Q
if($LASTEXITCODE -ne 0){throw 'Data ACL failed'}
Start-Service $name
Get-Service $name | Select-Object Name,Status
