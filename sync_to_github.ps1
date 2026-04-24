param(
  [string]$Message = ""
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

# ── Commit message ────────────────────────────────────────────────
if ([string]::IsNullOrWhiteSpace($Message)) {
    $Message = "chore: sync $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

Write-Host ""
Write-Host "=== RankFlow AI — Sync to GitHub ===" -ForegroundColor Cyan

# ── Verify remote is set ─────────────────────────────────────────
$remotes = & git remote 2>$null
if ($remotes -notcontains "origin") {
    Write-Host ""
    Write-Host "No remote configured. Running push_to_github.ps1 first..." -ForegroundColor Yellow
    & "$PSScriptRoot\push_to_github.ps1"
    exit $LASTEXITCODE
}

# ── Stage + commit + push ────────────────────────────────────────
Write-Host "Staging all changes..." -ForegroundColor Gray
& git add -A

$status = & git status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Host "Nothing to commit — already up to date." -ForegroundColor Green
    exit 0
}

Write-Host "Committing: $Message" -ForegroundColor Gray
& git commit -m $Message

Write-Host "Pushing to origin main..." -ForegroundColor Gray
& git push origin HEAD:main

Write-Host ""
Write-Host "Done! Code is live on GitHub." -ForegroundColor Green
Write-Host "https://github.com/rk-arun78605/AI_SEO_platform" -ForegroundColor Cyan
