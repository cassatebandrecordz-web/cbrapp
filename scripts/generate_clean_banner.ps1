Add-Type -AssemblyName System.Drawing
$srcFile = 'C:\Users\Admin\.gemini\antigravity\brain\e1a5ded4-0e20-45d8-80b8-ca51496b5137\.user_uploaded\media_1793821287866_cc64d45d.jpg'
$src = [System.Drawing.Bitmap]::FromFile($srcFile)

$targetW = 768
$targetH = 1680
$bmp = New-Object System.Drawing.Bitmap($targetW, $targetH, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

# 1. Fill entire canvas with rich obsidian studio black
$bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(7, 7, 10))
$g.FillRectangle($bgBrush, 0, 0, $targetW, $targetH)

# 2. Draw top-left orange/gold corner wave ONLY (X=0 to 190, Y=0 to 100 in src)
# This extends the top-left decorative ribbon up to the very top edge without touching the center logo!
$topLeftSrc = [System.Drawing.Rectangle]::FromLTRB(0, 0, 190, 100)
$topLeftDst = [System.Drawing.Rectangle]::FromLTRB(0, 0, 190, 340)
$g.DrawImage($src, $topLeftDst, $topLeftSrc, [System.Drawing.GraphicsUnit]::Pixel)

# 3. Draw bottom orange/gold waves (Y=904 to 1024 in src) extending smoothly to the bottom edge
$botSrc = [System.Drawing.Rectangle]::FromLTRB(0, 904, 768, 1024)
$botDst = [System.Drawing.Rectangle]::FromLTRB(0, 1340, 768, 1680)
$g.DrawImage($src, $botDst, $botSrc, [System.Drawing.GraphicsUnit]::Pixel)

# 4. Draw the 100% UNTOUCHED, PRISTINE original poster right at Y=328 to 1352
# In this placement, the boombox is at Y=410, center is pure black above it (NO DUPLICATE BOX!),
# and the Get Started button lands exactly at 65.8% (Y=1105) matching the interactive slider!
$mainDst = [System.Drawing.Rectangle]::FromLTRB(0, 328, 768, 1352)
$g.DrawImage($src, $mainDst)

# Save to destination
$destPath = 'c:\Users\Admin\Documents\cassate-band-recordz\assets\images\get_started_android_banner.jpg'
$bmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
Write-Host "SUCCESS: Generated glitch-free get_started_android_banner.jpg (768x1680)"

$bgBrush.Dispose()
$g.Dispose()
$bmp.Dispose()
$src.Dispose()
