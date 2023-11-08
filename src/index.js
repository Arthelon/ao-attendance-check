const { program } = require("commander");
const fs = require("fs");
const {
  getGuildId,
  getPlayerActivityStats,
  getGuildPlayers,
} = require("./api");
const { stringify } = require("csv-stringify");
const { generate } = require("csv-generate");

program
  .description(
    "Returns list of guild members sorted by low attendance count in ZvZ battles"
  )
  .argument("guild-name", "Name of guild")
  .option(
    "--min-players <count>",
    "Minimum players in battle for attendance to count",
    30
  )
  .option(
    "--range <days>",
    "Period of time before current time to perform attendance check",
    7
  )
  .option(
    "--attendance-count <count>",
    "Players with an attendance count equal to or below this threshold will appear on the list",
    4
  )
  .option("--csv-output", "Outputs CSV file to 'attendance.csv'");

function exitError(error, message) {
  error && console.log(error);
  console.log(message);
  process.exit(1);
}

function validateOptions(opts) {
  opts.minPlayers = Number(opts.minPlayers);
  opts.range = Number(opts.range);
  opts.attendanceCount = Number(opts.attendanceCount);
  for (option of Object.values(opts)) {
    if (Number.isNaN(option) || option < 0) {
      exitError(null, "Invalid CLI options");
    }
  }
}

function output(attendanceList, outputCsv) {
  let outStream = outputCsv
    ? fs.createWriteStream("./attendance.csv")
    : process.stdout;

  console.log(
    `Number of inactive/low-attendance players: ${attendanceList.length}`
  );
  generate({
    length: attendanceList.length,
    objectMode: true,
    columns: 2,
  })
    .pipe(stringify(attendanceList))
    .pipe(outStream);
}

async function main() {
  program.parse();

  const guildName = program.args[0];
  const options = program.opts();
  validateOptions(options);

  // Network requests
  let guildId;
  try {
    guildId = await getGuildId(guildName);
  } catch (err) {
    exitError(err, `Unable to retrieve guild name: ${guildName}`);
  }

  let playerList;
  try {
    playerList = await getGuildPlayers(guildId);
  } catch (err) {
    exitError("Unable to retrieve list of guild players");
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

  // Filtering and final output
  const playerListMapping = playerList.reduce((mapping, curr) => {
    mapping[curr.Name] = curr;
    return mapping;
  }, {});
  const playerActivityMapping = playerActivity.reduce((mapping, curr) => {
    mapping[curr.name] = curr;
    return mapping;
  }, {});

  // Only includes players with ZvZ activity
  const filteredPlayerActivity = playerActivity
    .filter(
      (player) =>
        player.attendance <= options.attendanceCount &&
        playerListMapping.hasOwnProperty(player.name) // exclude name from list if no longer in guild
    )
    .sort((a, b) => {
      return a.attendance > b.attendance ? 1 : -1;
    })
    .map((player) => [player.name, player.attendance]);

  const inactivePlayerList = playerList // players with 0 activity
    .filter((player) => !playerActivityMapping.hasOwnProperty(player.Name))
    .map((player) => [player.Name, 0]);
  const combinedActivityList = inactivePlayerList.concat(
    filteredPlayerActivity
  );
  output(combinedActivityList, options.csvOutput);
}

main();
