const fs = require("fs");

const DATA = fs.readFileSync("./data/data1.json");
const PLAYERS = JSON.parse(DATA);

const TEAMS = Object.keys(PLAYERS);
let allPlayers = [];

for (let i = 0; i < TEAMS.length; i++) {
  let players = PLAYERS[TEAMS[i]];
  for (let j = 0; j < players.length; j++) {
    if (allPlayers.indexOf(players[j]) === -1) {
      allPlayers.push({ value: players[j], label: players[j] });
    }
  }
}
const jsonPlayers = JSON.stringify(allPlayers);

console.log(jsonPlayers);

fs.writeFile("./data/names.json", jsonPlayers, "utf-8", (err) => {
  console.log(err);
});
