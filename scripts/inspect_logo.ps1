Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\Admin\.gemini\antigravity\brain\e1a5ded4-0e20-45d8-80b8-ca51496b5137\.user_uploaded\media_1793533843383_5ab54566.jpg"
$bmp = New-Object System.Drawing.Bitmap($srcPath)

Write-Host "Source Width: $($bmp.Width), Height: $($bmp.Height)"

# Sample colors at corners and center
$cTopLeft = $bmp.GetPixel(5, 5)
$cCenter = $bmp.GetPixel([int]($bmp.Width/2), [int]($bmp.Height/2))
Write-Host "Top-Left Color: R=$($cTopLeft.R), G=$($cTopLeft.G), B=$($cTopLeft.B)"
Write-Host "Center Color: R=$($cCenter.R), G=$($cCenter.G), B=$($cCenter.B)"

$bmp.Dispose()
