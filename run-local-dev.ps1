# run-local-dev.ps1
# Helper script to install dependencies and start the EduScholar backend and frontend locally.
# Run from the repo root with: .\run-local-dev.ps1

Set-Location $PSScriptRoot

Write-Host "==> Installing root dependencies..."
npm install

Write-Host "==> Installing backend dependencies..."
npm --prefix backend install

Write-Host "==> Installing frontend dependencies..."
npm --prefix frontend install

Write-Host "==> Starting backend in a new terminal..."
Start-Process powershell -ArgumentList "-NoExit","-Command","Set-Location '$PSScriptRoot\backend'; npm run dev"

Write-Host "==> Starting frontend in a new terminal..."
Start-Process powershell -ArgumentList "-NoExit","-Command","Set-Location '$PSScriptRoot\frontend'; npm run dev"

Write-Host "==> Done. Backend should start on port 5000, frontend on the Vite port (usually 5173)."
Write-Host "Make sure PostgreSQL is running and any backend environment variables are set before using the app."
