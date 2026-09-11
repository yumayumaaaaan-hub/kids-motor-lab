# いつも同じ URL（localhost:5173）で開発サーバーを起動する
$ErrorActionPreference = "Stop"

$projectRoot = Split-Path $PSScriptRoot -Parent
$env:Path = "$env:ProgramFiles\nodejs;" + $env:Path

Set-Location $projectRoot

Write-Host ""
Write-Host "KIDS MOTOR LAB - dev server"
Write-Host "  PC:       http://localhost:5173/"
Write-Host "  (tablet)  http://<your-ip>:5173/  <- Wi-Fi IP は環境で変わる"
Write-Host ""
Write-Host "※ ゲームの進行はブラウザに保存されます。"
Write-Host "  同じ URL を開き続けると くるま の履歴が残ります。"
Write-Host ""

npm run dev
