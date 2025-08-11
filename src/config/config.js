const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  discord: {
    token: process.env.DISCORD_TOKEN,
    //guildId: process.env.DISCORD_GUILD_ID,
    //channelId: process.env.DISCORD_CHANNEL_ID
    defaultGameImage: process.env.DISCORD_DEFAULT_GAME_IMAGE
  },
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID
  },
  filters: {
    gameName: process.env.GAME_NAME_FILTER
  },
  steam: {
    appId: process.env.STEAM_APP_ID,
    newsCount: parseInt(process.env.STEAM_NEWS_COUNT) || 3,
    newsInterval: parseInt(process.env.STEAM_NEWS_INTERVAL) || 600000 // 10 min
  }
};
