Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\Admin\.gemini\antigravity\brain\e1a5ded4-0e20-45d8-80b8-ca51496b5137\.user_uploaded\media_1793533843383_5ab54566.jpg"
$destDir = "c:\Users\Admin\Documents\cassate-band-recordz\assets\images"
$srcBmp = New-Object System.Drawing.Bitmap($srcPath)

function MakeTransparentCrop($bmp, $cropX, $cropY, $cropW, $cropH) {
    $cropped = New-Object System.Drawing.Bitmap($cropW, $cropH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    
    for ($y = 0; $y -lt $cropH; $y++) {
        for ($x = 0; $x -lt $cropW; $x++) {
            $p = $bmp.GetPixel($cropX + $x, $cropY + $y)
            $maxC = [math]::Max($p.R, [math]::Max($p.G, $p.B))
            
            if ($maxC -le 10) {
                # Pure black -> fully transparent
                $cropped.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            } elseif ($maxC -ge 38) {
                # Solid color
                $cropped.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $p.R, $p.G, $p.B))
            } else {
                # Smooth antialias ramp
                $alpha = [int](($maxC - 10) / (38 - 10) * 255)
                # Boost RGB slightly so dark anti-aliased edge doesn't look darkened
                $scale = 255.0 / [math]::Max(1, $alpha)
                $r = [math]::Min(255, [int]($p.R * $scale))
                $g = [math]::Min(255, [int]($p.G * $scale))
                $b = [math]::Min(255, [int]($p.B * $scale))
                $cropped.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $r, $g, $b))
            }
        }
    }
    return $cropped
}

# 1. Full Logo (Boombox + CASSATE BAND + RECORDZ)
# From previous scan: X=20..1004 (width 984), Y=24..846 (height 822)
Write-Host "Creating full transparent logo..."
$full = MakeTransparentCrop $srcBmp 18 22 988 826
$full.Save((Join-Path $destDir "brand_logo_full.png"), [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Saved brand_logo_full.png ($($full.Width)x$($full.Height))"
$full.Dispose()

# 2. Boombox Only: Y=22..558 (height 536), X=134..890 (width 756)
Write-Host "Creating boombox-only logo..."
$boombox = MakeTransparentCrop $srcBmp 134 22 756 536
$boombox.Save((Join-Path $destDir "brand_logo_boombox.png"), [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Saved brand_logo_boombox.png ($($boombox.Width)x$($boombox.Height))"
$boombox.Dispose()

# 3. 3D Text Only: Y=572..846 (height 274), X=18..1006 (width 988)
Write-Host "Creating 3D text logo..."
$text = MakeTransparentCrop $srcBmp 18 572 988 274
$text.Save((Join-Path $destDir "brand_logo_text.png"), [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Saved brand_logo_text.png ($($text.Width)x$($text.Height))"
$text.Dispose()

$srcBmp.Dispose()
Write-Host "Logo generation complete!"
