$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add('http://localhost:8765/')
$listener.Start()
Write-Host "Server started on http://localhost:8765/"
Write-Host "Press Ctrl+C to stop."

$basePath = "C:\Users\Admin\.gemini\antigravity-ide\scratch\culture-training-game"

while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $resp = $ctx.Response
    $localPath = $req.Url.LocalPath

    if ($localPath -eq '/' -or $localPath -eq '') {
        $localPath = '/index.html'
    }

    $filePath = $basePath + $localPath.Replace('/', '\')

    if (Test-Path $filePath -PathType Leaf) {
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $ext = [System.IO.Path]::GetExtension($filePath)
        $mime = switch ($ext) {
            '.html' { 'text/html; charset=utf-8' }
            '.css'  { 'text/css' }
            '.js'   { 'application/javascript' }
            default { 'application/octet-stream' }
        }
        $resp.ContentType = $mime
        $resp.ContentLength64 = $bytes.Length
        $resp.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $resp.StatusCode = 404
        $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $localPath")
        $resp.ContentLength64 = $msg.Length
        $resp.OutputStream.Write($msg, 0, $msg.Length)
    }
    $resp.OutputStream.Close()
}
