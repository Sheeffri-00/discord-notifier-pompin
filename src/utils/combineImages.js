import { createCanvas, loadImage } from 'canvas';
import axios from 'axios';
import sharp from 'sharp';

async function cargarImagenDesdeUrl(url) {
  // console.log('Cargando imagen desde URL:', url);
  
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  const mime = response.headers['content-type'];
  // console.log('MIME type:', mime);

  let buffer = Buffer.from(response.data);
  if (mime === 'image/webp') {
    buffer = await sharp(buffer).png().toBuffer();
  }

  // return await loadImage(response.data);
  return await loadImage(buffer);
}

export async function combinarImagenes({ avatarUrl, serverIconUrl, gameImageUrl }) {
  const ancho = 900; // total del lienzo
  const alto = 600;  // total del lienzo
  const canvas = createCanvas(ancho, alto);
  const ctx = canvas.getContext('2d');

  // Colores de fondo para estética (puedes dejar transparente si prefieres)
  ctx.fillStyle = '#2c2f33';
  ctx.fillRect(0, 0, ancho, alto);

  // Cargar imágenes
  const avatarImg = await cargarImagenDesdeUrl(avatarUrl);
  const servidorImg = await cargarImagenDesdeUrl(serverIconUrl);
  const juegoImg = await cargarImagenDesdeUrl(gameImageUrl);

  // Medidas
  const anchoIzq = 600;
  const anchoDer = 300;
  const AltoDer = 300;
  const margen = 20;
  const radioEsquinas = 20;

  // ----------- Lado Izquierdo (Avatar Usuario - 50% ancho) -----------
  // const avatarAncho = mitadAncho - margen * 2;
  // const avatarAlto = alto - margen * 2;
  const avatarAncho = anchoIzq - margen * 2;
  const avatarAlto = alto - margen * 2;
  // dibujarImagenRedondeada(ctx, avatarImg, margen, margen, avatarAncho, avatarAlto, radioEsquinas);
  drawImageCentered(ctx, avatarImg, margen, margen, avatarAncho, avatarAlto, radioEsquinas);

  // ----------- Lado Derecho (Servidor arriba, Juego abajo) -----------
  // const imgPeqAncho = mitadAncho - margen * 2;
  // const imgPeqAlto = (alto - margen * 3) / 2; // dos imágenes con margen intermedio
  // const offsetX = mitadAncho + margen;
  const imgPeqAncho = anchoDer - margen * 2;
  // const imgPeqAlto = AltoDer - margen * 2;
  const imgPeqAlto = (alto - margen * 3) / 2; // dos imágenes con margen intermedio
  const offsetX = anchoIzq + margen;

  // Imagen servidor (arriba)
  // dibujarImagenRedondeada(ctx, servidorImg, offsetX, margen, imgPeqAncho, imgPeqAlto, radioEsquinas);
  drawImageCentered(ctx, servidorImg, offsetX, margen, imgPeqAncho, imgPeqAlto, radioEsquinas);

  // Imagen juego (abajo)
  // dibujarImagenRedondeada(ctx, juegoImg, offsetX, margen * 2 + imgPeqAlto, imgPeqAncho, imgPeqAlto, radioEsquinas);
  drawImageCentered(ctx, juegoImg, offsetX, margen * 2 + imgPeqAlto, imgPeqAncho, imgPeqAlto, radioEsquinas);

  return canvas.toBuffer('image/png');
}

// Función para dibujar una imagen centrada con bordes redondeados
function drawImageCentered(ctx, img, x, y, maxWidth, maxHeight, borderRadius = 0) {
  const imgRatio = img.width / img.height;
  const boxRatio = maxWidth / maxHeight;

  let drawWidth = maxWidth;
  let drawHeight = maxHeight;

  if (imgRatio > boxRatio) {
    // Imagen más ancha que la caja → ajustar alto
    drawHeight = maxWidth / imgRatio;
  } else {
    // Imagen más alta que la caja → ajustar ancho
    drawWidth = maxHeight * imgRatio;
  }

  const offsetX = x + (maxWidth - drawWidth) / 2;
  const offsetY = y + (maxHeight - drawHeight) / 2;

  // Bordes redondeados
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(offsetX + borderRadius, offsetY);
  ctx.lineTo(offsetX + drawWidth - borderRadius, offsetY);
  ctx.quadraticCurveTo(offsetX + drawWidth, offsetY, offsetX + drawWidth, offsetY + borderRadius);
  ctx.lineTo(offsetX + drawWidth, offsetY + drawHeight - borderRadius);
  ctx.quadraticCurveTo(offsetX + drawWidth, offsetY + drawHeight, offsetX + drawWidth - borderRadius, offsetY + drawHeight);
  ctx.lineTo(offsetX + borderRadius, offsetY + drawHeight);
  ctx.quadraticCurveTo(offsetX, offsetY + drawHeight, offsetX, offsetY + drawHeight - borderRadius);
  ctx.lineTo(offsetX, offsetY + borderRadius);
  ctx.quadraticCurveTo(offsetX, offsetY, offsetX + borderRadius, offsetY);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  ctx.restore();
}

// Función auxiliar para dibujar imágenes con bordes redondeados
function dibujarImagenRedondeada(ctx, img, x, y, width, height, radius) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(img, x, y, width, height);
  ctx.restore();
}