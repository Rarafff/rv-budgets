Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$sources = @(
  @{
    File = 'src/assets/icon-bears/ChatGPT Image Sep 25, 2026, 12_00_00 PM.png'
    Columns = 3
    Rows = 6
    XStarts = @(64, 365, 659)
    XEnds = @(364, 658, 959)
  },
  @{ File = 'src/assets/icon-bears/ChatGPT Image Sep 25, 2026, 12_00_24 PM.png'; Columns = 2; Rows = 5 },
  @{ File = 'src/assets/icon-bears/ChatGPT Image Sep 25, 2026, 12_18_25 PM.png'; Columns = 3; Rows = 1 }
)

$tileSize = 96
$columns = 6
$canvas = [System.Drawing.Bitmap]::new($columns * $tileSize, $columns * $tileSize)
$graphics = [System.Drawing.Graphics]::FromImage($canvas)
$graphics.Clear([System.Drawing.Color]::Transparent)
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

$index = 0
foreach ($source in $sources) {
  $bitmap = [System.Drawing.Bitmap]::new((Join-Path $root $source.File))
  $cellWidth = $bitmap.Width / $source.Columns
  $cellHeight = $bitmap.Height / $source.Rows

  for ($row = 0; $row -lt $source.Rows; $row++) {
    for ($column = 0; $column -lt $source.Columns; $column++) {
      $left = if ($source.XStarts) { $source.XStarts[$column] } else { [math]::Floor($column * $cellWidth) }
      $top = [math]::Floor($row * $cellHeight)
      $right = if ($source.XEnds) { $source.XEnds[$column] } else { [math]::Floor(($column + 1) * $cellWidth) - 1 }
      $bottom = [math]::Floor(($row + 1) * $cellHeight) - 1
      $minX, $minY, $maxX, $maxY = $right, $bottom, $left, $top

      for ($y = $top; $y -le $bottom; $y++) {
        for ($x = $left; $x -le $right; $x++) {
          if ($bitmap.GetPixel($x, $y).A -gt 16) {
            $minX = [math]::Min($minX, $x)
            $minY = [math]::Min($minY, $y)
            $maxX = [math]::Max($maxX, $x)
            $maxY = [math]::Max($maxY, $y)
          }
        }
      }

      $crop = [System.Drawing.Rectangle]::FromLTRB($minX, $minY, $maxX + 1, $maxY + 1)
      $scale = [math]::Min(76 / $crop.Width, 76 / $crop.Height)
      $width = [math]::Round($crop.Width * $scale)
      $height = [math]::Round($crop.Height * $scale)
      $targetColumn = $index % $columns
      $targetRow = [math]::Floor($index / $columns)
      $target = [System.Drawing.Rectangle]::new(
        $targetColumn * $tileSize + [math]::Floor(($tileSize - $width) / 2),
        $targetRow * $tileSize + [math]::Floor(($tileSize - $height) / 2),
        $width,
        $height
      )
      $graphics.DrawImage($bitmap, $target, $crop, [System.Drawing.GraphicsUnit]::Pixel)
      $index++
    }
  }

  $bitmap.Dispose()
}

$output = Join-Path $root 'src/assets/icon-bears/category-icons.png'
$canvas.Save($output, [System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose()
$canvas.Dispose()
