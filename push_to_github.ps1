param()

$ErrorActionPreference = "Stop"

$token = $env:GITHUB_TOKEN
if ([string]::IsNullOrEmpty($token)) {
    $token = Read-Host "Paste your GitHub Personal Access Token (ghp_...)"
}

if ([string]::IsNullOrEmpty($token)) {
    Write-Host "ERROR: No token provided." -ForegroundColor Red
    exit 1
}

Write-Host "Step 1/3 - Creating GitHub repository..." -ForegroundColor Cyan

$headers = @{
    "Authorization" = "token $token"
    "Accept" = "application/vnd.github.v3+json"
    "Content-Type" = "application/json"
}

$bodyObj = [ordered]@{
    name = "AI_SEO_platform"
    description = "RankFlow AI - Autonomous SEO Growth Engine. Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Recharts."
    private = $false
    auto_init = $false
}
$body = $bodyObj | ConvertTo-Json

$cloneUrl = ""

try {
    $response = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers $headers -Body $body
    Write-Host "  Repo created: $($response.html_url)" -ForegroundColor Green
    $cloneUrl = $response.clone_url
} catch {
    $errMsg = $_.ToString()
    if ($errMsg -like "*422*" -or $errMsg -like "*already exists*" -or $errMsg -like "*name already exists*") {
        Write-Host "  Repo already exists - using it." -ForegroundColor Yellow
        $cloneUrl = "https://github.com/rk-arun78605/AI_SEO_platform.git"
    } else {
        Write-Host "ERROR: $errMsg" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Step 2/3 - Setting git remote..." -ForegroundColor Cyan

Set-Location "D:\Dashboard Code\NO_WH\DS\ai-seo-platform"

$existingRemotes = & git remote 2>$null
if ($existingRemotes -contains "origin") {
    & git remote set-url origin $cloneUrl
    Write-Host "  Remote updated." -ForegroundColor Green
} else {
    & git remote add origin $cloneUrl
    Write-Host "  Remote added." -ForegroundColor Green
}

& git branch -M main

Write-Host "Step 3/3 - Pushing to GitHub..." -ForegroundColor Cyan

$authUrl = $cloneUrl -replace "https://", "https://$($token)@"
& git remote set-url origin $authUrl
& git push -u origin main
& git remote set-url origin $cloneUrl

Write-Host ""
Write-Host "SUCCESS! Code is on GitHub." -ForegroundColor Green
Write-Host "Repo : https://github.com/rk-arun78605/AI_SEO_platform" -ForegroundColor Cyan
Write-Host "Dev  : http://localhost:3000" -ForegroundColor Cyan
