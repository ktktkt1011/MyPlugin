
# ========================================
# kintone Plugin Upload Script
# ========================================

# 設定値
$baseUrl = "https://csnf6nhbeofd.cybozu.com"
$username = "kkumagai@system-renovate.co.jp"
$password = "qtm97kpa"

# パス設定
$pluginZip = ".\plugin.zip"
$manifestPath = "manifest.json"
$privateKey = ".\private.ppk"

Write-Host ""
Write-Host "================================="
Write-Host " Plugin Pack Start"
Write-Host "================================="
Write-Host ""

# ----------------------------------------
# private.ppk 存在確認
# ----------------------------------------
if (!(Test-Path $privateKey)) {

    Write-Host "private.ppk が存在しないため生成します"

    npx cli-kintone plugin keygen

    if (!(Test-Path $privateKey)) {
        Write-Host ""
        Write-Host "private.ppk 作成失敗"
        exit
    }

    Write-Host "private.ppk 作成完了"
}

# ----------------------------------------
# Plugin Pack
# ----------------------------------------
npx cli-kintone plugin pack `
    --input $manifestPath `
    --private-key $privateKey

# ----------------------------------------
# pack失敗時
# ----------------------------------------
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Plugin Pack Failed"
    exit
}

Write-Host ""
Write-Host "================================="
Write-Host " Plugin Pack Success"
Write-Host "================================="
Write-Host ""

# ----------------------------------------
# plugin.zip確認
# ----------------------------------------
if (!(Test-Path $pluginZip)) {
    Write-Host ""
    Write-Host "plugin.zip が存在しません"
    exit
}

Write-Host ""
Write-Host "================================="
Write-Host " Plugin Upload Start"
Write-Host "================================="
Write-Host ""

# ----------------------------------------
# Upload
# ----------------------------------------
npx cli-kintone plugin upload `
    --input $pluginZip `
    --base-url $baseUrl `
    --username $username `
    --password $password `
    -y

# ----------------------------------------
# upload結果
# ----------------------------------------
if ($LASTEXITCODE -eq 0) {

    Write-Host ""
    Write-Host "================================="
    Write-Host " Upload Success"
    Write-Host "================================="
    Write-Host ""

}
else {

    Write-Host ""
    Write-Host "================================="
    Write-Host " Upload Failed"
    Write-Host "================================="
    Write-Host ""

}