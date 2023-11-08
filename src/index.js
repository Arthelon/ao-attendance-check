const { program } = require("commander");

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
    "--period",
    "Period of time before current time to perform attendance check",
    7
  )
  .option(
    "attendance-count",
    "Players with an attendance count below this threshold will appear on the list",
    5
  )
  .option("--csv-output", "Outputs CSV file");

program.parse();

const args = program.args;
const options = program.opts();
console.log(args);
console.log(options);
