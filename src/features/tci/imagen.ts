const LADO_MAXIMO = 1600
const CALIDAD = 0.82

/** Reduce la foto (máx. 1600 px, JPEG) para que suba rápido con datos móviles */
export async function comprimirImagen(fuente: Blob | HTMLCanvasElement): Promise<Blob> {
  let ancho: number
  let alto: number
  let dibujable: CanvasImageSource

  if (fuente instanceof HTMLCanvasElement) {
    dibujable = fuente
    ancho = fuente.width
    alto = fuente.height
  } else {
    const bitmap = await createImageBitmap(fuente, { imageOrientation: 'from-image' })
    dibujable = bitmap
    ancho = bitmap.width
    alto = bitmap.height
  }

  const escala = Math.min(1, LADO_MAXIMO / Math.max(ancho, alto))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(ancho * escala)
  canvas.height = Math.round(alto * escala)
  canvas.getContext('2d')?.drawImage(dibujable, 0, 0, canvas.width, canvas.height)
  if ('close' in dibujable) dibujable.close()

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('No se pudo procesar la foto'))), 'image/jpeg', CALIDAD)
  )
}
