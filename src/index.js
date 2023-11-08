const { program } = require("commander");
const {
  getGuildId,
  getPlayerActivityStats,
  getGuildPlayers,
} = require("./api");

program
  .description(
    "Returns list of guild members sorted by low attendance count in ZvZ battles"
  )
  .argument("guild-name", "Name of guild")
  .option(
    "--min-players",
    "Minimum players in battle for attendance to count",
    30
  )
  .option(
    "--range",
    "Period of time before current time to perform attendance check",
    7
  )
  .option(
    "attendance-count",
    "Players with an attendance count below this threshold will appear on the list",
    5
  )
  .option("--csv-output", "Outputs CSV file");

function exitError(error, message) {
  console.log(error);
  console.log(message);
  process.exit(1);
}

function validateOptions(options) {
  console.log(options);
}

async function main() {
  program.parse();

  const guildName = program.args[0];
  const options = program.opts();
  validateOptions(options);

  // Main business logic
  let guildId;
  try {
    guildId = await getGuildId(guildName);
  } catch (err) {
    exitError(err, `Unable to retrieve guild name: ${guildName}`);
  }

  let playerActivity;
  try {
    playerActivity = await getPlayerActivityStats(
      guildId,
      options.range,
      options.minPlayers
    );
  } catch (err) {
    exitError(err, "Unable to retrieve guild player activity stats");
  }
  const filteredPlayerActivity = playerActivity
    .filter((player) => player.attendance < options.attendanceCount)
    .sort((a, b) => {
      return a.attendance > b.attendance ? 1 : -1;
    })
    .map((player) => [player.name, player.attendance]);

  let playerList;
  try {
    playerList = await getGuildPlayers(guildId);
  } catch (err) {
    exitError("Unable to retrieve list of guild players");
  }
  const playerActivityMapping = playerActivity.reduce((mapping, curr) => {
    mapping[curr.name] = curr;
    return mapping;
  }, {});
  const inactivePlayerList = playerList
    .filter((player) => !playerActivityMapping.hasOwnProperty(player.Name))
    .map((player) => [player.Name, 0]);

  const combinedActivityList = inactivePlayerList.concat(
    filteredPlayerActivity
  );
  console.log(combinedActivityList);
}

main();
