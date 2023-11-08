# ao-attendance-check

Script by @arthelon for ZvZ attendance checking

## Installation

```
npm install
npm run start
```

## Usage

````
Usage: npm start -- [options] <guild-name>

Returns list of guild members sorted by low attendance count in ZvZ battles

Arguments:
  guild-name                  Name of guild

Options:
  --min-players <count>       Minimum players in battle for attendance to count (default: 30)
  --range <days>              Period of time before current time to perform attendance check (default: 7)
  --attendance-count <count>  Players with an attendance count equal to or below this threshold will appear on the list (default: 4)
  --csv-output                Outputs CSV file to 'attendance.csv'
  -h, --help                  display help for command
```
````

## Usage Examples

```
npm start Superiore -- min-players 10 --csv-output
```
