$ErrorActionPreference='Stop';$root='E:\Services\PaulislavaS3';$nssm="$root\nssm.exe"
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
transport.tls.trustedCaFile = "E:/Services/PaulislavaS3/config/frp-ca.pem"
metadatas.machine_id = "$($c.machine_id)"
metadatas.recovery_key = "$($c.key)"
loginFailExit = false
log.level = "warn"
[[proxies]]
name = "ssh-$($c.machine_id)"
type = "tcp"
localIP = "127.0.0.1"
localPort = 19000
remotePort = 24007
"@
[IO.File]::WriteAllText("$root\config\frpc.toml",$config,[Text.UTF8Encoding]::new($false))
& "$root\frpc.exe" verify -c "$root\config\frpc.toml"
if($LASTEXITCODE -ne 0){throw 'Invalid FRP configuration'}
& $nssm install PaulislavaS3 C:\Windows\System32\wsl.exe
& $nssm set PaulislavaS3 AppParameters '-d PaulislavaS3 -u root -- /usr/local/bin/s3-windows-service'
& $nssm set PaulislavaS3 AppDirectory $root
& $nssm set PaulislavaS3 ObjectName 'NT AUTHORITY\LocalService'
& $nssm set PaulislavaS3 Start SERVICE_AUTO_START
& $nssm set PaulislavaS3 AppExit Default Restart
& $nssm set PaulislavaS3 AppRestartDelay 5000
& $nssm set PaulislavaS3 AppStopMethodConsole 60000
& $nssm set PaulislavaS3 AppStdout "$root\logs\s3.log"
& $nssm set PaulislavaS3 AppStderr "$root\logs\s3-error.log"
& $nssm set PaulislavaS3 AppRotateFiles 1
& $nssm set PaulislavaS3 AppRotateBytes 10485760
& $nssm set PaulislavaS3 AppEvents Stop/Pre 'C:\Windows\System32\wsl.exe -d PaulislavaS3 -u root -- /usr/local/bin/s3-stop-windows-service'
& $nssm install PaulislavaS3FRP "$root\frpc.exe"
& $nssm set PaulislavaS3FRP AppParameters "-c $root\config\frpc.toml"
& $nssm set PaulislavaS3FRP AppDirectory $root
& $nssm set PaulislavaS3FRP ObjectName 'NT AUTHORITY\LocalService'
& $nssm set PaulislavaS3FRP Start SERVICE_AUTO_START
& $nssm set PaulislavaS3FRP AppExit Default Restart
& $nssm set PaulislavaS3FRP AppRestartDelay 5000
& $nssm set PaulislavaS3FRP AppStdout "$root\logs\frpc.log"
& $nssm set PaulislavaS3FRP AppStderr "$root\logs\frpc-error.log"
& $nssm set PaulislavaS3FRP AppRotateFiles 1
& $nssm set PaulislavaS3FRP AppRotateBytes 10485760
& $nssm set PaulislavaS3FRP DependOnService PaulislavaS3
sc.exe failure PaulislavaS3 reset= 86400 actions= restart/5000/restart/5000/restart/15000
sc.exe failure PaulislavaS3FRP reset= 86400 actions= restart/5000/restart/5000/restart/15000
Start-Service PaulislavaS3
Start-Service PaulislavaS3FRP
Get-Service PaulislavaS3,PaulislavaS3FRP
