// import fetch from 'node-fetch';
// import config from '../config/config.js';
const axios = require('axios');
const config = require("../config/config");
const combineImages = require('../utils/combineImages');
const fs = require('fs');
const FormData = require('form-data');
// import FormData from 'form-data';
// import { post } from 'axios';
// import { config } from '../config/config.js';

async function sendTelegramNotification(newState) {
  const { token, chatId } = config.telegram;
  // const streamingActivity = presence.activities.find(a => a.type === 1);
  // if (!streamingActivity) return null;
  const user = newState.member?.user;
  const serverName = newState.guild?.name;
  const channelName = newState.channel?.name;
  const displayName = user?.displayName;
  // const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;
  const link = `https://discord.com/channels/${newState.guild.id}/${newState.channel.id}`;
  const gameName = await obtenerNombreJuegoDeUsuario(newState.guild, newState.member.user.id);
  const headerText = `¡ <b>${displayName}</b> empezó una transmisión ${gameName ? `de <b>${gameName}</b>` : ""} !`;
  const messageText = `${headerText}\nServer  -->  <b>${serverName}</b>\nChannel  -->  <b>${channelName}</b>\n🔗 <a href="${link}">Unirse al canal de Discord</a>`;
  // const caption = `🎥 ${user.displayName} está transmitiendo: ${streamingActivity.name}\n${streamingActivity.url || ''}`;

  // const res = await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {    
  //   chat_id: chatId,
  //   text: caption,
  //   parse_mode: 'MarkdownV2' // O cámbialo a HTML si quieres evitar problemas con caracteres especiales    
  // });

  // obtenemos urls de imágenes  
  const guild = newState.guild;
  const serverIconUrl = guild?.iconURL ? guild.iconURL({ format: 'png', size: 1024 }) : null;
  const avatarUrl = newState.member.user.displayAvatarURL({ format: 'png', size: 512 });

  // game image: si tienes mapping game->imagen lo puedes usar; sino usaremos un placeholder
  // También puedes intentar obtener alguna imagen desde presence.activity.assets (no siempre disponible)
  let gameImageUrl = config.discord.defaultGameImage || null;
  // if (!gameImageUrl && newState.member.presence) {
  //   const act = newState.member.presence.activities.find(a => a.type === 1 || a.type === 0);
  //   // act.assets.largeImage puede tener una key (no siempre URL). Dejo fallback.
  //   gameImageUrl = config.discord.defaultGameImage || 'https://via.placeholder.com/180';
  // } else if (!gameImageUrl) {
  //   gameImageUrl = config.discord.defaultGameImage || 'https://via.placeholder.com/180';
  // }
  gameImageUrl = await obtenerImagenJuegoDeUsuario(guild, newState.member.user.id);
  
  console.log("serverIconUrl", serverIconUrl);
  console.log("avatarUrl", avatarUrl);
  console.log("gameImageUrl", gameImageUrl);
  console.log("??????");

  // Componer imagen combinada (devuelve ruta local de archivo)
  
  // const filePath = await combineImages.combineImages(
  //   serverIconUrl || 'https://via.placeholder.com/500x300',
  //   avatarUrl,
  //   gameImageUrl
  // );
  // console.log("filePath", filePath);

  const buffer = await combineImages.combinarImagenes({ avatarUrl, serverIconUrl, gameImageUrl });
  console.log('Buffer length:', buffer?.length);

  const form = new FormData();
  form.append('chat_id', chatId);
  form.append('caption', messageText);
  form.append('parse_mode', 'HTML');
  // form.append('photo', fs.createReadStream(filePath));
  form.append('photo', buffer, { filename: 'combinada.png' });
  
  // axios.post(`https://api.telegram.org/bot${token}/sendPhoto`, {
  //   chat_id: chatId,
  //   // photo: avatarUrl,
  //   photo: fs.createReadStream(filePath),
  //   caption: messageText,
  //   parse_mode: "HTML"
  // });
  
  axios.post(`https://api.telegram.org/bot${token}/sendPhoto`, form, { headers: form.getHeaders() });

  // const data = await res.json();
  // if (!data.ok) {
  //   console.error('[Telegram] Error enviando mensaje:');
  //   return null;
  // }
  // return data.result.message_id;
  return null;
}

async function deleteTelegramNotification(messageId) {
  const { token, chatId } = config.telegram;

  const res = await axios.post(`https://api.telegram.org/bot${token}/deleteMessage`, {
    chat_id: chatId,
    message_id: messageIds    
  });

  const data = await res.json();
  if (!data.ok) {
    console.error('[Telegram] Error borrando mensaje:');
  }
}

async function sendSteamNews(newsItem) {
  const { token, chatId } = config.telegram;
  // const text = `*${newsItem.title}*\n${newsItem.contents}\n[Leer más](${newsItem.url})`;
  const text = `Nueva noticia`;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    await axios.post(url, {
      chat_id: chatId,
      text,
      parse_mode: "MarkdownV2"      
    });
    console.log("Noticia enviada a Telegram:", newsItem.title);
  } catch (error) {
    console.error("Error enviando noticia a Telegram:");
    // console.log("Error enviando noticia a Telegram: " + error);
  }
}

async function obtenerNombreJuegoDeUsuario(guild, userId) {  
  console.log("userId", userId);
  // Asegurar que tenemos al miembro y su presencia
  const miembro = await guild.members.fetch(userId);
  const presence = miembro.presence;

  console.log("actividades", presence?.activities);

  if (!presence || !presence.activities) return null;

  // Buscar actividad de tipo juego (Playing)
  const actividadJuego = presence.activities.find(
    act => act.type === 0
  );

  return actividadJuego ? actividadJuego.name : null;
}

async function obtenerImagenJuegoDeUsuario(guild, userId) {  
  const imagenPorDefecto = 'https://cdn.fastly.steamstatic.com/steamcommunity/public/images/apps/570/0bbb630d63262dd66d2fdd0f7d37e8661a410075.jpg';

  console.log("userId", userId);
  // Asegurar que tenemos al miembro y su presencia
  const miembro = await guild.members.fetch(userId);
  const presence = miembro.presence;

  console.log("actividades", presence?.activities);

  if (!presence || !presence.activities) return imagenPorDefecto;

  // Buscar actividad de tipo juego (Playing)
  const actividadJuego = presence.activities.find(
    act => act.type === 0 && act.assets
  );

  if (!actividadJuego) return imagenPorDefecto;

  const { largeImage } = actividadJuego.assets;
  if (!largeImage) return imagenPorDefecto;

  // Construir URL
  if (largeImage.startsWith('mp:external/')) {
    return `https://media.discordapp.net/${largeImage.replace('mp:', '')}`;
  } else {
    return `https://cdn.discordapp.com/app-assets/${actividadJuego.applicationId}/${largeImage}.png`;
  }
}

module.exports = { sendTelegramNotification, deleteTelegramNotification, sendSteamNews };