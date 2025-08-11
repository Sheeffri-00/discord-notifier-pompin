require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { startDiscordBot } = require("./services/discordService");
const { startSteamNewsChecker } = require("./services/steamService");
const logger = require("./utils/logger");

logger.log("Iniciando bot...");
startDiscordBot();
// startSteamNewsChecker();
logger.log("Bot iniciado correctamente.");