$ErrorActionPreference='Stop'
$root='E:\Services\PaulislavaWeb'
if(Test-Path "$root\wsl\ext4.vhdx"){throw 'Existing web WSL disk must be preserved'}
New-Item -ItemType Directory -Force $root,"$root\config","$root\logs","$root\migration","$root\wsl" | Out-Null
$ownerSid=(Get-LocalUser paulislava).SID.Value
icacls $root /inheritance:r /grant:r '*S-1-5-18:(OI)(CI)F' '*S-1-5-32-544:(OI)(CI)F' '*S-1-5-19:(OI)(CI)F' "*$($ownerSid):(OI)(CI)F" | Out-Null
if($LASTEXITCODE -ne 0){throw 'Cannot restrict web service directory ACL'}
Copy-Item E:\Services\PaulislavaCMS\nssm.exe "$root\nssm.exe"
# Run the import action as LocalService through run-localservice-task.ps1.
$script=@'
$ErrorActionPreference='Continue'
wsl.exe --import PaulislavaWeb E:\Services\PaulislavaWeb\wsl E:\Services\PaulislavaCMS\migration\ubuntu-rootfs.tar.gz --version 2 *> E:\Services\PaulislavaWeb\migration\import.log
$LASTEXITCODE | Set-Content E:\Services\PaulislavaWeb\migration\import.exit
exit $LASTEXITCODE
'@
[IO.File]::WriteAllText("$root\migration\import-action.ps1",$script,[Text.UTF8Encoding]::new($false))
& "$PSScriptRoot\run-localservice-task.ps1" -Name Import -Script "$root\migration\import-action.ps1"
