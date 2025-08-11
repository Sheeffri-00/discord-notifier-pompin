// services/discordService.js
import { Client, GatewayIntentBits } from 'discord.js';
import { sendTelegramNotification } from './telegramService.js';
import config from '../config/config.js';
// const config = require("../config/config");

const { token } = config.discord;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers,    
  ]
});

client.on('ready', () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
});

const activeStreams = new Map();

client.on('voiceStateUpdate', async (oldState, newState) => {
  try {

    const newStreaming = newState.selfVideo || newState.streaming;
    const oldStreaming = oldState.selfVideo || oldState.streaming;

    // Inicio de stream
    // if (!wasStreaming && isStreaming) {
    if (newStreaming && !oldState.streaming) { 
      console.log(`[Discord] ${newState.member.user} inició stream`);
      const messageId = await sendTelegramNotification(newState);
      if (messageId) {
        activeStreams.set(newState.member.userId, messageId);
      }
    }

    // // Fin de stream
    // if (oldStreaming && !newState.streaming) {
    //   console.log(`[Discord] ${newPresence.user.tag} terminó stream`);
    //   const messageId = activeStreams.get(newPresence.userId);
    //   if (messageId) {
    //     await deleteTelegramNotification(messageId);
    //     activeStreams.delete(newPresence.userId);
    //   }
    // }
  } catch (err) {
    console.error('[Discord] Error manejando voiceStateUpdate:', err.message);
  }
});

export async function startDiscordBot() {
  await client.login(token);
}
