const undici = require("undici");
const BASE_API_URL = "https://gameinfo.albiononline.com/api/gameinfo";
const ALBION_BB_URL = "https://api.albionbb.com";

const getPlayerActivityStats = async (guildId, daysRange, minPlayers) => {
  const url = new URL(`${ALBION_BB_URL}/stats/guilds/${guildId}`);
  url.searchParams.append("minPlayers", minPlayers);
  const offsetDate = new Date(new Date() - daysRange * 86400);
  const formattedOffsetDate = `${offsetDate.getFullYear()}-${offsetDate.getMonth()}-${offsetDate.getDate()}`;
  url.searchParams.append("start", formattedOffsetDate);

  const { body } = await undici.request(url);
  const bodyParsed = await body.json();
  return bodyParsed;
};

const getGuildId = async (guildName) => {
  const url = new URL(`${BASE_API_URL}/search`);
  url.searchParams.append("q", guildName);
  const { body } = await undici.request(url);
  const bodyParsed = await body.json();
  const guild = bodyParsed.guilds.filter(
    (guild) => guild.Name.toLowerCase() === guildName.toLowerCase()
  )[0];
  return guild.Id;
};

const getGuildPlayers = async (guildId) => {
  const url = new URL(`${BASE_API_URL}/guilds/${guildId}/members`);

  const { body } = await undici.request(url);
  const bodyParsed = await body.json();
  return bodyParsed;
};

module.exports = {
  getGuildId,
  getPlayerActivityStats,
  getGuildPlayers,
};
