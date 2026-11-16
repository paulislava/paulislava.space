$ErrorActionPreference='Stop'
$base='E:\Services\PaulislavaProff'
$env:PHP_FCGI_MAX_REQUESTS='0'
$env:PROFF_DATA_DIR="$base\data\proff"
$env:APPDATA="$base\tmp"
$env:LOCALAPPDATA="$base\tmp"
$php=$null
$caddy=$null
try {
    $php=Start-Process "$base\runtime\php\php-cgi.exe" -ArgumentList @('-c',"$base\config\php.ini",'-b','127.0.0.1:13002') -WorkingDirectory "$base\site\proff" -PassThru -NoNewWindow
    $caddy=Start-Process "$base\runtime\caddy\caddy.exe" -ArgumentList @('run','--config',"$base\config\Caddyfile",'--adapter','caddyfile') -WorkingDirectory $base -PassThru -NoNewWindow
    while(-not $php.HasExited -and -not $caddy.HasExited){ Start-Sleep -Milliseconds 500 }
    exit 1
} finally {
    foreach($child in @($caddy,$php)){if($child -and -not $child.HasExited){Stop-Process -Id $child.Id -Force -ErrorAction SilentlyContinue}}
}
