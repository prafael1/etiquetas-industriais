import type { ImpressoraAdapter, DadosEtiqueta } from './ImpressaoService'
import type { ConfigEtiqueta } from '../../types/etiqueta'
import { urlProduto } from '../../utils/urlProduto'

// o editor define fontSize em px de tela (3.78 px = 1 mm); 1 px = 0.75 pt
const PX_PARA_PT = 0.75

function pxParaPt(px: number) {
  return px * PX_PARA_PT
}

// o nome do produto é digitado pelo usuário e entra no HTML da janela de impressão
function escapar(texto: string) {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export class BrowserPrintAdapter implements ImpressoraAdapter {
  private config: ConfigEtiqueta

  constructor(config: ConfigEtiqueta) {
    this.config = config
  }

  async imprimir(etiquetas: DadosEtiqueta[]): Promise<void> {
    const { largura, altura, elementos } = this.config

    const renderElemento = (et: DadosEtiqueta, tipo: string) => {
      const el = elementos.find(e => e.tipo === tipo)
      if (!el) return ''

      const fs = pxParaPt(el.fontSize ?? 14)
      const fw = el.negrito ? 'bold' : 'normal'

      let conteudo = ''
      if (tipo === 'produto') conteudo = et.nomeProduto
      if (tipo === 'sequencial') conteudo = et.sequencial
      if (tipo === 'volume') conteudo = et.volume
      if (tipo === 'posicao') conteudo = et.posicao

      if (!conteudo) return ''

      // mesma caixa (x, y, largura, altura) do editor, para o que foi
      // posicionado na tela sair igual no papel
      return `
        <div style="
          position: absolute;
          left: ${el.x}mm;
          top: ${el.y}mm;
          width: ${el.largura}mm;
          height: ${el.altura}mm;
          overflow: hidden;
          font-size: ${fs}pt;
          font-weight: ${fw};
          font-family: monospace;
        ">${escapar(conteudo)}</div>
      `
    }

    const renderQR = (et: DadosEtiqueta) => {
      const el = elementos.find(e => e.tipo === 'qrcode')
      if (!el) return ''
      // roda na janela original (só o document.write vai para o popup), então
      // window.location.origin aqui já é o origin correto do app
      const conteudoQR = encodeURIComponent(urlProduto(et.sequencial))
      return `
        <div style="
          position: absolute;
          left: ${el.x}mm;
          top: ${el.y}mm;
          width: ${el.largura}mm;
          height: ${el.altura}mm;
        ">
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${conteudoQR}"
            style="width: 100%; height: 100%;"
          />
        </div>
      `
    }

    const conteudo = etiquetas.map((et) => `
      <div style="
        position: relative;
        width: ${largura}mm;
        height: ${altura}mm;
        border: 1px solid #000;
        box-sizing: border-box;
        page-break-after: always;
        overflow: hidden;
      ">
        ${renderElemento(et, 'produto')}
        ${renderElemento(et, 'sequencial')}
        ${renderElemento(et, 'volume')}
        ${renderElemento(et, 'posicao')}
        ${renderQR(et)}
      </div>
    `).join('')

    const janela = window.open('', '_blank')
    if (!janela) return

    janela.document.write(`
      <html>
        <head>
          <title>Etiquetas</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { margin: 0; padding: 0; }
            @media print {
              @page { size: ${largura}mm ${altura}mm; margin: 0; }
            }
          </style>
        </head>
        <body>
          ${conteudo}
          <script>
            window.onload = function() { window.print() }
          </script>
        </body>
      </html>
    `)

    janela.document.close()
  }
}