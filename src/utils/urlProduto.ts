export function urlProduto(sequencial: string): string {
  // BASE_URL cobre hosts servidos fora da raiz (ex: GitHub Pages em
  // /etiquetas-industriais/); em hosts na raiz (Vercel) é só "/"
  return `${window.location.origin}${import.meta.env.BASE_URL}#/q/${sequencial}`
}
