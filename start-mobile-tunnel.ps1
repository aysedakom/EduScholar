# start-mobile-tunnel.ps1
# Creates a public HTTPS tunnel directly to your local Vite server (port 5173)
# Allows AppMySite and your mobile phone to preview localhost with real-time hot-reload!

param(
    [int]$Port = 5173
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  EduScholar Mobile Live-Development Tunnel" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Tunneling port $Port to a public HTTPS URL..." -ForegroundColor Yellow
Write-Host "Paste the resulting URL into AppMySite -> Connectivity / Web view" -ForegroundColor Green
Write-Host "When you edit code on your computer, your mobile phone updates instantly!" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the tunnel.`n" -ForegroundColor DarkGray

npx --yes localtunnel --port $Port
