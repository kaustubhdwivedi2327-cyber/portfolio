# Local preview of the portfolio. Double-click preview.cmd, then open http://localhost:8765/
param([int]$Port = 8765)
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$mime = @{ ".html"="text/html; charset=utf-8"; ".css"="text/css; charset=utf-8"; ".js"="application/javascript; charset=utf-8"; ".json"="application/json"; ".png"="image/png"; ".jpg"="image/jpeg"; ".jpeg"="image/jpeg"; ".gif"="image/gif"; ".svg"="image/svg+xml"; ".webp"="image/webp"; ".mp4"="video/mp4"; ".webm"="video/webm"; ".pdf"="application/pdf"; ".ico"="image/x-icon"; ".woff2"="font/woff2"; ".md"="text/plain; charset=utf-8"; ".xml"="application/xml"; ".txt"="text/plain" }
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $Root on http://localhost:$Port/  (close this window to stop)"
Start-Process "http://localhost:$Port/"
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
  if ($path -eq "/") { $path = "/index.html" }
  $file = Join-Path $Root ($path -replace "/", "\")
  try {
    if (Test-Path $file -PathType Leaf) {
      $bytes = [IO.File]::ReadAllBytes($file)
      $ext = [IO.Path]::GetExtension($file).ToLower()
      $ctx.Response.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { "application/octet-stream" }
      $ctx.Response.Headers.Add("Cache-Control", "no-store")
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
      $ctx.Response.StatusCode = 404
      $b = [Text.Encoding]::UTF8.GetBytes("404 $path")
      $ctx.Response.OutputStream.Write($b, 0, $b.Length)
    }
  } catch { $ctx.Response.StatusCode = 500 }
  $ctx.Response.Close()
}
