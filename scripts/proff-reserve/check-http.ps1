param([string]$BaseUrl='http://127.0.0.1:13001',[string]$HostName='paulislava.space')
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Net.Http
$base='E:\Services\PaulislavaProff'
$site="$base\site\proff"
$data="$base\data\proff"
$source='E:\backup\home\user\web\paulislava.space\public_html\proff'
$handler=New-Object Net.Http.HttpClientHandler
$handler.AllowAutoRedirect=$false
$client=New-Object Net.Http.HttpClient($handler)
$client.Timeout=[TimeSpan]::FromSeconds(60)
$client.DefaultRequestHeaders.Host=$HostName
function Get-Status([string]$Path){
    $response=$client.GetAsync($BaseUrl+$Path).GetAwaiter().GetResult()
    $status=[int]$response.StatusCode
    $response.Dispose()
    return $status
}
function Send-Upload([string]$Path,[string]$Filename,[int]$ExpectedStatus){
    $form=New-Object Net.Http.MultipartFormDataContent
    $stream=[IO.File]::OpenRead($Filename)
    $content=New-Object Net.Http.StreamContent($stream)
    $form.Add($content,'main_file','upload.bin')
    try {
        $response=$client.PostAsync($BaseUrl+$Path,$form).GetAwaiter().GetResult()
        $status=[int]$response.StatusCode
        $response.Dispose()
        if($status -ne $ExpectedStatus){throw "Unexpected upload status: $status"}
    } finally {$form.Dispose();$stream.Dispose()}
}
$backup="$base\backup\http-smoke-"+(Get-Date -Format yyyyMMdd-HHmmss)
New-Item -ItemType Directory $backup -Force | Out-Null
$before=@{}
foreach($name in 'Proff.exe','program.php','db.mdb'){
    Copy-Item "$data\$name" "$backup\$name"
    $before[$name]=(Get-FileHash "$data\$name").Hash
    if((Get-FileHash "$backup\$name").Hash -ne $before[$name]){throw 'Backup verification failed'}
}
$update=[IO.File]::ReadAllText("$source\uploadupdate.php")
$password=[regex]::Match($update,'(?s)\$pass\s*=\s*(["''])(.*?)\1').Groups[2].Value
$db=[IO.File]::ReadAllText("$source\loaddb.php")
$session=[regex]::Match($db,'\$s\s*==\s*(["''])(.*?)\1').Groups[2].Value
$version=([IO.File]::ReadAllLines("$data\program.php"))[0]
if(-not $password -or -not $session -or -not $version){throw 'Cannot identify preserved upload contracts'}
$stage='health'
try {
    if($client.GetStringAsync($BaseUrl+'/healthz').GetAwaiter().GetResult() -ne 'ok'){throw 'Health body mismatch'}
    foreach($case in @(@('/healthz',200),@('/proff/',302),@('/proff/login.php',200),@('/proff/program.php',200),@('/proff/config.php',404),@('/proff/../config/Caddyfile',404),@('/proff/missing.php',404))){
        $stage='route '+$case[0]
        $status=Get-Status $case[0]
        if($status -ne $case[1]){throw "Unexpected status for $($case[0]): $status"}
    }
    foreach($case in @(@('Proff.exe','/proff/Proff.exe'),@('db.mdb','/proff/db.mdb'),@('frezers/1020.png','/proff/frezers/1020.png'),@('beta/Proff.exe','/proff/beta/Proff.exe'),@(('frezers/1039'+[char]0x437+'.png'),('/proff/frezers/1039'+[char]0x437+'.png')))){
        $stage='download '+$case[0]
        $bytes=$client.GetByteArrayAsync($BaseUrl+$case[1]).GetAwaiter().GetResult()
        $hash=[BitConverter]::ToString([Security.Cryptography.SHA256]::Create().ComputeHash($bytes)).Replace('-','')
        $localRoot=if($case[0] -in @('Proff.exe','db.mdb')){$data}else{$site}
        if($hash -ne (Get-FileHash "$localRoot\$($case[0])").Hash){throw 'Download hash mismatch'}
    }
    $stage='rejected upload'
    Send-Upload '/proff/uploadupdate.php?pass=incorrect&version=test' "$backup\Proff.exe" 403
    Send-Upload '/proff/uploadupdate.php?version=test' "$backup\Proff.exe" 403
    Send-Upload '/proff/loaddb.php?sess=incorrect' "$backup\db.mdb" 403
    foreach($name in $before.Keys){if((Get-FileHash "$data\$name").Hash -ne $before[$name]){throw 'Unauthorized request changed files'}}
    $stage='authorized upload with identical data'
    # Authenticated smoke reuploads identical bytes and the current version.
    for($attempt=1;$attempt -le 2;$attempt++){
    $stage='authorized repeated upload attempt '+$attempt
    Send-Upload ('/proff/uploadupdate.php?pass='+[Uri]::EscapeDataString($password)+'&version='+[Uri]::EscapeDataString($version)) "$backup\Proff.exe" 200
    Send-Upload ('/proff/loaddb.php?sess='+[Uri]::EscapeDataString($session)) "$backup\db.mdb" 200
    foreach($name in $before.Keys){if((Get-FileHash "$data\$name").Hash -ne $before[$name]){throw 'Idempotent authorized smoke changed bytes'}}
    }
    'PASS: HTTP, private routes, download SHA256, rejected writes, authorized uploads, unchanged data'
} catch {
    # Never print exceptions from HTTP libraries: request URLs contain credentials.
    throw ('HTTP smoke failed at '+$stage+'; inspect protected runtime state without printing credentials')
} finally {$client.Dispose()}
