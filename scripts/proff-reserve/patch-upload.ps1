param([string]$Site='E:\Services\PaulislavaProff\site\proff',[string]$CredentialSource='E:\backup\home\user\web\paulislava.space\public_html\proff')
$ErrorActionPreference='Stop'
$utf8 = New-Object Text.UTF8Encoding($false)
$path = Join-Path $Site 'uploadupdate.php'
$original = [IO.File]::ReadAllText((Join-Path $CredentialSource 'uploadupdate.php'))
$pass = [regex]::Match($original, '(?s)\$pass\s*=\s*(["''])(.*?)\1\s*;').Value
if (-not $pass) { throw 'Missing original update credential' }
$body = @'
<?php
__CREDENTIAL__
error_reporting(0);
$data = getenv('PROFF_DATA_DIR') ?: __DIR__;
$provided = $_GET['pass'] ?? null;
$version = $_GET['version'] ?? null;
if (!is_string($provided) || !hash_equals($pass, $provided)) {
    http_response_code(403);
    exit;
}
if (!is_string($version) || strlen($version) < 1 || strlen($version) > 128 || preg_match('/[^\x20-\x7E]|[<>]/', $version)) {
    http_response_code(400);
    exit;
}
if (!isset($_FILES['main_file']) || $_FILES['main_file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    exit;
}
$file = $data . '/program.php';
$f = file($file);
if ($f === false || !move_uploaded_file($_FILES['main_file']['tmp_name'], $data . '/Proff.exe')) {
    http_response_code(500);
    exit;
}
$f[0] = $version . "\r\n";
if (file_put_contents($file, $f, LOCK_EX) === false) http_response_code(500);
'@
[IO.File]::WriteAllText($path,$body.Replace('__CREDENTIAL__',$pass),$utf8)
$path = Join-Path $Site 'loaddb.php'
$original=[IO.File]::ReadAllText((Join-Path $CredentialSource 'loaddb.php'))
$secret=[regex]::Match($original,'\$s\s*==\s*(["''])(.*?)\1').Groups[2].Value
if (-not $secret) { throw 'Missing original database upload credential' }
$body=@'
<?php
error_reporting(0);
$data = getenv('PROFF_DATA_DIR') ?: __DIR__;
$s = $_GET['sess'] ?? null;
if (!is_string($s) || !hash_equals('__SESSION__', $s)) {
    http_response_code(403);
    exit;
}
if (!isset($_FILES['main_file']) || $_FILES['main_file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    exit;
}
if (!move_uploaded_file($_FILES['main_file']['tmp_name'], $data . '/db.mdb')) http_response_code(500);
'@
[IO.File]::WriteAllText($path,$body.Replace('__SESSION__',$secret.Replace("'","\'")),$utf8)
'Patched upload authorization; credentials preserved without output'
