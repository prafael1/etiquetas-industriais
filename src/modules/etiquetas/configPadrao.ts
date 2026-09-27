import type { ConfigEtiqueta } from '../../types/etiqueta'

export const configPadrao: ConfigEtiqueta = {
  largura: 100,
  altura: 150,
  margem: 3,
  orientacao: 'retrato',
  dpi: 203,
  elementos: [
    {
      tipo: 'produto',
      x: 5,
      y: 10,
      largura: 90,
      altura: 10,
      fontSize: 14,
    },
    {
      tipo: 'sequencial',
      x: 5,
      y: 30,
      largura: 90,
      altura: 20,
      fontSize: 32,
    },
    {
      tipo: 'volume',
      x: 5,
      y: 60,
      largura: 90,
      altura: 15,
      fontSize: 24,
    },
    {
      tipo: 'posicao',
      x: 5,
      y: 80,
      largura: 90,
      altura: 10,
      fontSize: 18,
    },
    {
      tipo: 'qrcode',
      x: 30,
      y: 100,
      largura: 40,
      altura: 40,
    },
  ],
}