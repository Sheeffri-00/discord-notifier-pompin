const axios = require("axios");
const steamConfig = require("../config/steam");
const telegramService = require("./telegramService");

let lastPublishedTime = 0;

async function checkSteamNews() {
  const url = `http://api.steampowered.com/ISteamNews/GetNewsForApp/v0002/?appid=${steamConfig.appId}&count=${steamConfig.newsCount}&maxlength=${steamConfig.maxLength}&format=json`;

  try {
    const { data } = await axios.get(url);
    const newsList = data.appnews.newsitems;

    const latestNews = newsList.find(news => news.date > lastPublishedTime);
    if (latestNews) {
      lastPublishedTime = latestNews.date;
      await telegramService.sendSteamNews(latestNews);
    }
  } catch (error) {
    console.error("Error obteniendo noticias de Steam:");
  }
}

function startSteamNewsChecker() {
  checkSteamNews(); // Primer chequeo inmediato
  setInterval(checkSteamNews, steamConfig.intervalMinutes * 60 * 1000);
}

module.exports = { startSteamNewsChecker };
