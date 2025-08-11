// discord-bot.js
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
require('dotenv').config({ path: __dirname + '/.env' });

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
  ],
});

client.on('ready', () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
});

client.on('voiceStateUpdate', (oldState, newState) => {
  const user = newState.member?.user;
  const streaming = newState.selfVideo || newState.streaming;

  if (streaming && !oldState.streaming) {    
    const channelName = newState.channel?.name;
    const displayName = user?.displayName;

    // Enviar imagen y mensaje formateado a Telegram + web link al canal
    const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;
    const link = `https://discord.com/channels/${newState.guild.id}/${newState.channel.id}`;
    const messageText = `¡ <b>${displayName}</b> empezó una transmisión en el canal --> <b>${channelName}</b> !\n🔗 <a href="${link}">Unirse al canal en Discord</a>`;
    console.log(messageText);

    axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendPhoto`, {
      chat_id: process.env.TELEGRAM_CHAT_ID,
      photo: avatarUrl,
      caption: messageText,
      parse_mode: "HTML"
    });
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
