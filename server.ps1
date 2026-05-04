$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8080/")
$listener.Start()
Write-Host "Server running at http://localhost:8080/"
Write-Host "Press Ctrl+C to stop"

$root = "c:\Users\prana\OneDrive\Desktop\pranav claude portfolio"

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $path = $context.Request.Url.LocalPath
    if ($path -eq "/") { $path = "/index.html" }
    
    $filePath = Join-Path $root ($path.TrimStart("/"))
    
    if (Test-Path $filePath) {
        $ext = [System.IO.Path]::GetExtension($filePath)
        switch ($ext) {
            ".html" { $context.Response.ContentType = "text/html; charset=utf-8" }
            ".css"  { $context.Response.ContentType = "text/css; charset=utf-8" }
            ".js"   { $context.Response.ContentType = "application/javascript; charset=utf-8" }
            ".png"  { $context.Response.ContentType = "image/png" }
            ".jpg"  { $context.Response.ContentType = "image/jpeg" }
            ".svg"  { $context.Response.ContentType = "image/svg+xml" }
            default { $context.Response.ContentType = "application/octet-stream" }
        }
        $buffer = [System.IO.File]::ReadAllBytes($filePath)
        $context.Response.OutputStream.Write($buffer, 0, $buffer.Length)
    } else {
        $context.Response.StatusCode = 404
        $buffer = [System.Text.Encoding]::UTF8.GetBytes("Not Found")
        $context.Response.OutputStream.Write($buffer, 0, $buffer.Length)
    }
    $context.Response.OutputStream.Close()
}
