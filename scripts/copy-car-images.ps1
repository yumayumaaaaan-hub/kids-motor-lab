# nenchu-car-get から車画像を public/cars へコピー
param()

$projectRoot = (Get-Location).Path
if ($PSScriptRoot) {
  $projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
}

$src = Join-Path $projectRoot "..\nenchu-car-get\assets\cars"
$src = (Resolve-Path $src).Path
$dest = Join-Path $projectRoot "public\cars"

if (-not (Test-Path $src)) {
  Write-Error "コピー元が見つかりません: $src"
  exit 1
}

New-Item -ItemType Directory -Force -Path $dest | Out-Null

$copiedJpg = 0
$copiedSvg = 0

1..200 | ForEach-Object {
  $name = "{0:D3}.jpg" -f $_
  $from = Join-Path $src $name
  $to = Join-Path $dest $name
  if (Test-Path $from) {
    Copy-Item $from $to -Force
    $copiedJpg++
  }
}

Get-ChildItem (Join-Path $src "*.svg") | ForEach-Object {
  Copy-Item $_.FullName (Join-Path $dest $_.Name) -Force
  $copiedSvg++
}

Write-Host "Copied JPG: $copiedJpg / 200"
Write-Host "Copied SVG: $copiedSvg"
Write-Host "Done -> $dest"
