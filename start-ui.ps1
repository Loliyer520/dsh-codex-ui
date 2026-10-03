[CmdletBinding()]
param(
    [string]$Dsh = (Join-Path $env:USERPROFILE '.dsh-win\versions\0.2.0-rc.2\dsh.cmd'),
    [string]$Profile = 'codex-ui',
    [int]$Port = 3088,
    [switch]$NoOpen
)
$ErrorActionPreference = 'Stop'
if (-not (Test-Path -LiteralPath $Dsh)) { throw "找不到 dsh：$Dsh。请使用 -Dsh 指定参考版本的 dsh.cmd。" }
if ($Profile -in @('desktop','web','headless','sdk','sdk-minimal','acp','base')) { throw '请使用独立 profile 名称，避免修改内置配置。' }
# A dedicated profile keeps the user's existing Web/Desktop configuration intact.
$taskDshHome = if ($env:DSH_HOME) { $env:DSH_HOME } else { Join-Path $env:USERPROFILE '.dsh' }
$taskProfileDir = Join-Path $taskDshHome "profiles\$Profile"
if (-not (Test-Path -LiteralPath (Join-Path $taskProfileDir 'package.json'))) {
    & $Dsh --profile $Profile --from-default-profile web --dump-config | Out-Null
    if ($LASTEXITCODE -ne 0) { throw '创建独立 Web profile 失败。' }
}
$taskPackage = $PSScriptRoot.Replace('\','/')
$taskManifest = Get-Content -LiteralPath (Join-Path $taskProfileDir 'package.json') -Raw | ConvertFrom-Json
# Migrate the previous package name before installing to avoid duplicate UI registration.
if ('dsh-chatgpt-ui' -in $taskManifest.dsh.profile.bundles) {
    & $Dsh plugin --profile $Profile remove dsh-chatgpt-ui
    if ($LASTEXITCODE -ne 0) { throw '移除旧版 UI 插件失败。' }
}
# Refresh the profile when this package has been updated.
$taskDesiredVersion = (Get-Content -LiteralPath (Join-Path $PSScriptRoot 'package.json') -Raw | ConvertFrom-Json).version
$taskInstalledManifest = Join-Path $taskProfileDir 'node_modules\dsh-codex-ui\package.json'
$taskInstalledVersion = if (Test-Path -LiteralPath $taskInstalledManifest) { (Get-Content -LiteralPath $taskInstalledManifest -Raw | ConvertFrom-Json).version } else { '' }
if ('dsh-codex-ui' -notin $taskManifest.dsh.profile.bundles -or $taskInstalledVersion -ne $taskDesiredVersion) {
    & $Dsh plugin --profile $Profile add "file:$taskPackage"
    if ($LASTEXITCODE -ne 0) { throw '安装 UI 插件失败。' }
}
$taskLaunchArgs = @('--profile', $Profile, '--port', "$Port")
if ($NoOpen) { $taskLaunchArgs += '--no-open' }
Write-Host "启动 dsh-codex-ui，profile：$Profile"
& $Dsh @taskLaunchArgs
exit $LASTEXITCODE
