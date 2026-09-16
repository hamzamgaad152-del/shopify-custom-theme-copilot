# package-theme.ps1
# Packages the Shopify theme directory into a Shopify-compliant .zip file.
# Ensures cross-platform forward slashes ('/') in ZIP entry paths.

$ErrorActionPreference = "Stop"

$themeDir = $PSScriptRoot
$zipOutputPath = Join-Path $themeDir "shopify-custom-theme.zip"

Write-Host "Packaging Shopify theme from $themeDir..." -ForegroundColor Cyan

# Remove old zip if present
if (Test-Path $zipOutputPath) {
    Remove-Item $zipOutputPath -Force
}

# Folders required by Shopify theme architecture
$foldersToZip = @('assets', 'blocks', 'config', 'layout', 'locales', 'sections', 'snippets', 'templates')

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zipMode = [System.IO.Compression.ZipArchiveMode]::Create
$zipStream = [System.IO.File]::Open($zipOutputPath, [System.IO.FileMode]::Create)
$archive = New-Object System.IO.Compression.ZipArchive($zipStream, $zipMode)

try {
    foreach ($folder in $foldersToZip) {
        $folderPath = Join-Path $themeDir $folder
        if (Test-Path $folderPath) {
            $files = Get-ChildItem -Path $folderPath -Recurse -File
            foreach ($file in $files) {
                # Calculate relative path from $themeDir
                $relative = $file.FullName.Substring($themeDir.Length).TrimStart('\', '/')
                # Ensure POSIX forward slashes for Shopify theme compatibility
                $entryName = $relative.Replace('\', '/')
                
                [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
                    $archive, 
                    $file.FullName, 
                    $entryName, 
                    [System.IO.Compression.CompressionLevel]::Optimal
                ) | Out-Null
            }
        }
    }
    Write-Host "Theme successfully packaged to: $zipOutputPath" -ForegroundColor Green
}
finally {
    $archive.Dispose()
    $zipStream.Dispose()
}
