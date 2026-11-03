Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\Admin\.gemini\antigravity\brain\e1a5ded4-0e20-45d8-80b8-ca51496b5137\.user_uploaded\media_1793533843383_5ab54566.jpg"
$bmp = New-Object System.Drawing.Bitmap($srcPath)
$width = $bmp.Width
$height = $bmp.Height

# Find overall bounding box of non-black pixels (luminance > 20)
$minX = $width; $maxX = 0; $minY = $height; $maxY = 0

for ($y = 0; $y -lt $height; $y += 2) {
    for ($x = 0; $x -lt $width; $x += 2) {
        $p = $bmp.GetPixel($x, $y)
        $lum = [math]::Max($p.R, [math]::Max($p.G, $p.B))
        if ($lum -gt 25) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Host "Overall Logo Bounding Box: X=$minX..$maxX (Width: $($maxX - $minX)), Y=$minY..$maxY (Height: $($maxY - $minY))"

# Analyze horizontal slices to find separation between boombox, "CASSATE BAND", "RECORDZ", and tagline
for ($y = $minY; $y -le $maxY; $y += 15) {
    $nonBlackCount = 0
    for ($x = $minX; $x -le $maxX; $x += 5) {
        $p = $bmp.GetPixel($x, $y)
        $lum = [math]::Max($p.R, [math]::Max($p.G, $p.B))
        if ($lum -gt 25) { $nonBlackCount++ }
    }
    Write-Host "Y=$y : NonBlackCount=$nonBlackCount"
}

$bmp.Dispose()
