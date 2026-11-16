$ErrorActionPreference='Stop';$root='E:\Services\PaulislavaCMS';$nssm="$root\nssm.exe"
Copy-Item E:\Projects\vpn\.runtime\service\frpc.exe "$root\frpc.exe"
Copy-Item E:\Projects\vpn\.runtime\config\frp-ca.pem "$root\config\frp-ca.pem"
$c=Get-Content "$root\config\frp-credential.json" -Raw | ConvertFrom-Json
$config=@"
transport.tls.disableCustomTLSFirstByte = true
serverAddr = "13.143.194.252"
serverPort = 7000
user = "$($c.machine_id)"
transport.tls.enable = true
transport.tls.serverName = "tv.paulislava.space"
transport.tls.trustedCaFile = "E:/Services/PaulislavaCMS/config/frp-ca.pem"
metadatas.machine_id = "$($c.machine_id)"
metadatas.recovery_key = "$($c.key)"
loginFailExit = false
log.level = "warn"
[[proxies]]
name = "ssh-$($c.machine_id)"
type = "tcp"
localIP = "127.0.0.1"
localPort = 1337
remotePort = 24005
"@
[IO.File]::WriteAllText("$root\config\frpc.toml",$config,[Text.UTF8Encoding]::new($false))
& "$root\frpc.exe" verify -c "$root\config\frpc.toml"
if($LASTEXITCODE -ne 0){throw 'Invalid FRP configuration'}
& $nssm install PaulislavaCMS C:\Windows\System32\wsl.exe
& $nssm set PaulislavaCMS AppParameters '-d PaulislavaCMS -u root -- /usr/local/bin/cms-windows-service'
& $nssm set PaulislavaCMS AppDirectory $root
& $nssm set PaulislavaCMS ObjectName 'NT AUTHORITY\LocalService'
& $nssm set PaulislavaCMS Start SERVICE_AUTO_START
& $nssm set PaulislavaCMS AppExit Default Restart
& $nssm set PaulislavaCMS AppRestartDelay 5000
& $nssm set PaulislavaCMS AppStopMethodConsole 60000
& $nssm set PaulislavaCMS AppStdout "$root\logs\cms.log"
& $nssm set PaulislavaCMS AppStderr "$root\logs\cms-error.log"
& $nssm set PaulislavaCMS AppRotateFiles 1
& $nssm set PaulislavaCMS AppRotateBytes 10485760
& $nssm set PaulislavaCMS AppEvents Stop/Pre 'C:\Windows\System32\wsl.exe -d PaulislavaCMS -u root -- /usr/local/bin/cms-stop-windows-service'
& $nssm set PaulislavaCMS DependOnService postgresql-x64-18
& $nssm install PaulislavaCMSFRP "$root\frpc.exe"
& $nssm set PaulislavaCMSFRP AppParameters "-c $root\config\frpc.toml"
& $nssm set PaulislavaCMSFRP AppDirectory $root
& $nssm set PaulislavaCMSFRP ObjectName 'NT AUTHORITY\LocalService'
& $nssm set PaulislavaCMSFRP Start SERVICE_AUTO_START
& $nssm set PaulislavaCMSFRP AppExit Default Restart
& $nssm set PaulislavaCMSFRP AppRestartDelay 5000
& $nssm set PaulislavaCMSFRP AppStdout "$root\logs\frpc.log"
& $nssm set PaulislavaCMSFRP AppStderr "$root\logs\frpc-error.log"
& $nssm set PaulislavaCMSFRP AppRotateFiles 1
& $nssm set PaulislavaCMSFRP AppRotateBytes 10485760
& $nssm set PaulislavaCMSFRP DependOnService PaulislavaCMS
sc.exe failure PaulislavaCMS reset= 86400 actions= restart/5000/restart/5000/restart/15000
sc.exe failure PaulislavaCMSFRP reset= 86400 actions= restart/5000/restart/5000/restart/15000
Start-Service PaulislavaCMS
Start-Service PaulislavaCMSFRP
Get-Service PaulislavaCMS,PaulislavaCMSFRP
