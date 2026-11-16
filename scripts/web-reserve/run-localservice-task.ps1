param([Parameter(Mandatory=$true)][string]$Name,[Parameter(Mandatory=$true)][string]$Script)
$ErrorActionPreference='Stop'
$root='E:\Services\PaulislavaWeb'
$a=New-ScheduledTaskAction -Execute powershell.exe -Argument "-NoProfile -ExecutionPolicy Bypass -File $Script"
$p=New-ScheduledTaskPrincipal -UserId 'NT AUTHORITY\LocalService' -LogonType ServiceAccount
Register-ScheduledTask -TaskName "Web$Name" -Action $a -Principal $p -Force | Out-Null
Start-ScheduledTask "Web$Name"
