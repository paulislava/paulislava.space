$ErrorActionPreference='Stop'
$root='E:\Services\PaulislavaProff'
$name='PaulislavaProffFRP'
if(Get-Service $name -ErrorAction SilentlyContinue){throw 'FRP service exists; inspect before updating'}
Copy-Item E:\Projects\vpn\.runtime\service\frpc.exe "$root\frpc.exe"
Copy-Item E:\Projects\vpn\.runtime\config\frp-ca.pem "$root\config\frp-ca.pem"
if(-not(Test-Path "$root\nssm.exe")){Copy-Item E:\Services\PaulislavaCMS\nssm.exe "$root\nssm.exe"}
& icacls.exe "$root\config\frp-credential.json" /inheritance:r /grant:r '*S-1-5-18:F' '*S-1-5-32-544:F' | Out-Null
if($LASTEXITCODE -ne 0){throw 'Credential ACL failed'}
$c=Get-Content "$root\config\frp-credential.json" -Raw | ConvertFrom-Json
$config=@"
transport.tls.disableCustomTLSFirstByte = true
serverAddr = "13.143.194.252"
serverPort = 7000
user = "$($c.machine_id)"
transport.tls.enable = true
transport.tls.serverName = "tv.paulislava.space"
transport.tls.trustedCaFile = "E:/Services/PaulislavaProff/config/frp-ca.pem"
metadatas.machine_id = "$($c.machine_id)"
metadatas.recovery_key = "$($c.key)"
loginFailExit = false
log.level = "warn"
[[proxies]]
name = "ssh-$($c.machine_id)"
type = "tcp"
localIP = "127.0.0.1"
localPort = 13001
remotePort = 24009
"@
[IO.File]::WriteAllText("$root\config\frpc.toml",$config,[Text.UTF8Encoding]::new($false))
& "$root\frpc.exe" verify -c "$root\config\frpc.toml"
if($LASTEXITCODE -ne 0){throw 'Invalid FRP configuration'}
$nssm="$root\nssm.exe"
& $nssm install $name "$root\frpc.exe"
if($LASTEXITCODE -ne 0){throw 'FRP service installation failed'}
& $nssm set $name AppParameters "-c $root\config\frpc.toml"
& $nssm set $name AppDirectory $root
& $nssm set $name ObjectName 'NT AUTHORITY\LocalService'
& $nssm set $name Start SERVICE_AUTO_START
& $nssm set $name AppExit Default Restart
& $nssm set $name AppRestartDelay 5000
& $nssm set $name DependOnService PaulislavaProff
& sc.exe sidtype $name unrestricted
& sc.exe failure $name reset= 86400 actions= restart/5000/restart/5000/restart/15000
& icacls.exe $root /grant "NT SERVICE\${name}:RX" | Out-Null
& icacls.exe "$root\config" /grant "NT SERVICE\${name}:RX" | Out-Null
foreach($file in "$root\frpc.exe","$root\nssm.exe","$root\config\frp-ca.pem"){
    & icacls.exe $file /grant "NT SERVICE\${name}:RX" | Out-Null
}
& icacls.exe "$root\config\frpc.toml" /inheritance:r /grant:r '*S-1-5-18:F' '*S-1-5-32-544:F' "NT SERVICE\${name}:R" | Out-Null
New-Item -ItemType Directory "$root\logs\frp" -Force | Out-Null
& icacls.exe "$root\logs" /grant "NT SERVICE\${name}:RX" | Out-Null
& icacls.exe "$root\logs\frp" /inheritance:r /grant:r '*S-1-5-18:(OI)(CI)F' '*S-1-5-32-544:(OI)(CI)F' "NT SERVICE\${name}:(OI)(CI)M" | Out-Null
& $nssm set $name AppStdout "$root\logs\frp\stdout.log"
& $nssm set $name AppStderr "$root\logs\frp\stderr.log"
& $nssm set $name AppRotateFiles 1
& $nssm set $name AppRotateOnline 1
& $nssm set $name AppRotateBytes 1048576
Start-Service $name
'FRP service installed and started with service-specific ACL'
