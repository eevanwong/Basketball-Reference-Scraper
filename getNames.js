const fs = require("fs");
const { exit } = require("process");

function getNames() {
  const DATA = fs.readFileSync("./data/data1.json");
  const PLAYERS = JSON.parse(DATA);

  const TEAMS = Object.keys(PLAYERS);
  let allPlayers = [];

  for (let i = 0; i < TEAMS.length; i++) {
    //parse only names
    let players = PLAYERS[TEAMS[i]];
    for (let j = 0; j < players.length; j++) {
      if (allPlayers.indexOf(players[j]) === -1) {
        allPlayers.push({ value: players[j], label: players[j] }); //we needed the values and the names as there were players with the same label but different values and vice versa
      }
    }
  }
  const jsonPlayers = JSON.stringify(allPlayers);

  console.log(jsonPlayers);

  fs.writeFile("./data/names.json", jsonPlayers, "utf-8", (err) => {
    console.log(err);
  });
  exit();
}

getNames();
