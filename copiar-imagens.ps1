# Copia as 5 imagens padrão da Cogtive (e o logo da Vovó Mocinha, se existir) da pasta-base
# Como rodar: clique com botão direito → Executar com PowerShell
# Ou no PowerShell: powershell -ExecutionPolicy Bypass -File copiar-imagens.ps1

$origem = "C:\Users\Léo\Desktop\COGTIVE\Apresentação-Personalizada"
$destino = $PSScriptRoot

$arquivos = @(
    "Cogtive_Logo_Off_White.png",
    "Cogtive_Symbol_Off_White.png",
    "AI-Vision-Exemplo-1.png",
    "taelor.png",
    "dashboard-principal.png"
)

foreach ($arquivo in $arquivos) {
    $caminhoOrigem = Join-Path $origem $arquivo
    $caminhoDestino = Join-Path $destino $arquivo
    if (Test-Path $caminhoOrigem) {
        Copy-Item -Path $caminhoOrigem -Destination $caminhoDestino -Force
        Write-Host "OK   $arquivo" -ForegroundColor Green
    } else {
        Write-Host "FALTA  $arquivo (nao encontrada em $origem)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Pronto. Abra index.html no navegador para conferir." -ForegroundColor Cyan
Write-Host ""
Write-Host "Lembrete: se voce quiser usar o logo PNG real da Vovo Mocinha (em vez do SVG inline)," -ForegroundColor Gray
Write-Host "salve o arquivo nesta pasta como vovo-mocinha-logo.png e me avise para trocar a referencia no HTML." -ForegroundColor Gray
Read-Host "Pressione Enter para fechar"
