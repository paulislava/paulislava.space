<?php
// Run against a disposable fixture; production files and backup stay unchanged.
$source = $argv[1];
$root = sys_get_temp_dir() . '/proff-test-' . bin2hex(random_bytes(6));
mkdir($root);
$dataRoot = ($argv[2] ?? '') === 'env' ? $root . '/data' : $root;
if ($dataRoot !== $root) mkdir($dataRoot);
$environment = getenv();
unset($environment['PROFF_DATA_DIR']);
if ($dataRoot !== $root) $environment['PROFF_DATA_DIR'] = $dataRoot;
foreach (['uploadupdate.php', 'loaddb.php'] as $name) copy($source . '/' . $name, $root . '/' . $name);
$update = file_get_contents($root . '/uploadupdate.php');
$db = file_get_contents($root . '/loaddb.php');
preg_match('/\$pass\s*=\s*([\'"])(.*?)\1/s', $update, $p);
preg_match('/\$s\s*==\s*([\'"])(.*?)\1/s', $db, $s);
if (!isset($s[2])) preg_match('/hash_equals\(\s*([\'"])(.*?)\1/s', $db, $s);
if (!isset($p[2], $s[2])) throw new RuntimeException('Cannot identify existing credential contracts');
$null = PHP_OS_FAMILY === 'Windows' ? 'NUL' : '/dev/null';
$process = proc_open([PHP_BINARY, '-d', 'display_errors=0', '-S', '127.0.0.1:13003', '-t', $root], [0=>['file',$null,'r'],1=>['file',$null,'w'],2=>['file',$null,'w']], $pipes, $root, $environment);
function request(string $url, bool $upload = true): void {
    $boundary = 'proff-boundary';
    $body = $upload ? "--$boundary\r\nContent-Disposition: form-data; name=\"main_file\"; filename=\"upload.bin\"\r\nContent-Type: application/octet-stream\r\n\r\nnew-payload\r\n--$boundary--\r\n" : '';
    $context = stream_context_create(['http'=>['method'=>'POST','header'=>"Content-Type: multipart/form-data; boundary=$boundary\r\n",'content'=>$body,'ignore_errors'=>true,'timeout'=>3]]);
    @file_get_contents('http://127.0.0.1:13003/'.$url,false,$context);
}
$failures = [];
try {
    for($i=0;$i<40;$i++){ $socket=@fsockopen('127.0.0.1',13003); if($socket){fclose($socket);break;} usleep(50000); }
    foreach (['missing'=>'', 'wrong'=>'pass=wrong-password', 'array'=>'pass%5B%5D=wrong-password'] as $case=>$query) {
        file_put_contents($dataRoot.'/Proff.exe','old-exe'); file_put_contents($dataRoot.'/program.php',"old-version\r\nmanifest-url\r\n");
        request('uploadupdate.php?version=test-1&'.$query);
        if (file_get_contents($dataRoot.'/Proff.exe') !== 'old-exe' || file_get_contents($dataRoot.'/program.php') !== "old-version\r\nmanifest-url\r\n") $failures[]='update rejects '.$case.' password without changing files';
    }
    file_put_contents($dataRoot.'/Proff.exe','old-exe');file_put_contents($dataRoot.'/program.php',"old-version\r\nmanifest-url\r\n");
    request('uploadupdate.php?'.http_build_query(['pass'=>$p[2],'version'=>'rc1.2.3']));
    if(file_get_contents($dataRoot.'/Proff.exe') !== 'new-payload' || file_get_contents($dataRoot.'/program.php') !== "rc1.2.3\r\nmanifest-url\r\n") $failures[]='authorized update retains existing multipart/query contract';
    foreach (['', "bad\r\nversion", '<?php echo 1;', ['wrong']] as $version) {
        request('uploadupdate.php?'.http_build_query(['pass'=>$p[2],'version'=>$version]));
        if(file_get_contents($dataRoot.'/Proff.exe') !== 'new-payload' || file_get_contents($dataRoot.'/program.php') !== "rc1.2.3\r\nmanifest-url\r\n") $failures[]='invalid version must not change upload or executable manifest';
        file_put_contents($dataRoot.'/Proff.exe','new-payload');file_put_contents($dataRoot.'/program.php',"rc1.2.3\r\nmanifest-url\r\n");
    }
    request('uploadupdate.php?'.http_build_query(['pass'=>$p[2],'version'=>'no-file']),false);
    if(file_get_contents($dataRoot.'/program.php') !== "rc1.2.3\r\nmanifest-url\r\n") $failures[]='missing upload must not change version';
    foreach(['missing'=>'','wrong'=>'sess=wrong-session','array'=>'sess%5B%5D=wrong-session'] as $case=>$query){
        file_put_contents($dataRoot.'/db.mdb','old-db');request('loaddb.php?'.$query);
        if(file_get_contents($dataRoot.'/db.mdb') !== 'old-db') $failures[]='database rejects '.$case.' session';
    }
    file_put_contents($dataRoot.'/db.mdb','old-db');request('loaddb.php?'.http_build_query(['sess'=>$s[2]]));
    if(file_get_contents($dataRoot.'/db.mdb') !== 'new-payload') $failures[]='authorized database upload retains contract';
    foreach($failures as $failure) echo 'FAIL: '.$failure.PHP_EOL;
    echo count($failures) ? 'FAILED '.count($failures).' assertions'.PHP_EOL : 'PASS: upload authorization and compatibility'.PHP_EOL;
} finally {
    proc_terminate($process);proc_close($process);
    if ($dataRoot !== $root) { foreach(glob($dataRoot.'/*') as $file) unlink($file); rmdir($dataRoot); }
    foreach(glob($root.'/*') as $file) unlink($file);rmdir($root);
}
exit(count($failures) ? 1 : 0);
