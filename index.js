const { Table } = require("console-table-printer");
var crypto = require("crypto");
var readlineSync = require("readline-sync");

const colors = {
  reset: "\x1b[0m",
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
};

class HMAC {
  #hmac;
  #hex;
  constructor(key) {
    this.#hmac = crypto.createHmac("sha3-256", key);
  }

  update(data) {
    this.#hmac.update(data);
  }

  get hex() {
    if (!this.#hex) {
      this.#hex = this.#hmac.digest("hex");
      this.update = () => {
        throw new Error("You can't update hex after digestion");
      };
    }
    return this.#hex;
  }
}
class Rules {
  constructor(entities) {
    const columns = [
      { name: "↓ PC/User →", alignment: "left", color: "black" },
    ];
    const rows = [];

    for (let i = 0; i < entities.length; i++) {
      columns.push({ name: entities[i], alignment: "center" });
      rows[i] = { "↓ PC/User →": entities[i] };
    }

    for (let i = 0; i < entities.length; i++) {
      for (let k = 0; k < entities.length; k++) {
        rows[k][entities[i]] = "-";
      }
    }

    for (let i = 0; i < entities.length; i++) {
      for (let k = 0; k < (entities.length - 1) / 2; k++) {
        let winIndex = (entities.length + 1) / 2 + k + i;
        if (winIndex >= entities.length) winIndex -= entities.length;
        rows[winIndex][entities[i]] = `${colors.green}Win${colors.black}`;

        let loseIndex = (entities.length - 1) / 2 - k + i;
        if (loseIndex >= entities.length) loseIndex -= entities.length;
        rows[loseIndex][entities[i]] = `${colors.red}Lose${colors.black}`;
      }
    }

    for (let i = 0; i < entities.length; i++) {
      for (let k = 0; k < entities.length; k++) {
        if (i != k) continue;
        rows[k][entities[i]] = `${colors.blue}Draw${colors.black}`;
      }
    }

    this.table = { columns: columns, rows: rows };
  }

  outcome(computerMove, playerMove) {
    return this.table.rows[computerMove - 1][input[playerMove - 1]];
  }
}
class HelpMenu {
  constructor(table) {
    this.helpTable = new Table(table);
    this.render = () => this.helpTable.printTable();
  }
}

//Helper functions:
function printErrorAndExit(message) {
  console.log(colors.red + message + colors.reset);
  process.exit(1);
}

function hasDupes(arr) {
  return (
    [...new Set(arr.filter((elem, idx, arr) => arr.indexOf(elem) !== idx))]
      .length != 0
  );
}

function generateComputerMove(max) {
  return Math.ceil(Math.random() * max).toString();
}

//Start of the program:
const input = process.argv.slice(2);

if (input.length % 2 != 1)
  printErrorAndExit("Error: The number of gaming entities should be odd.");
if (input.length % 2 != 1)
  printErrorAndExit(
    "Error: The number of gaming entities should be atleast 3."
  );
if (hasDupes(input))
  printErrorAndExit("Error: There should be no duplicate entities.");

const key = crypto.randomBytes(32).toString("hex");
const hmac = new HMAC(key);
const rules = new Rules(input);
const help = new HelpMenu(rules.table);
const computerMove = generateComputerMove(input.length);
hmac.update(input[computerMove - 1]);

console.log("-".repeat(70));
console.log(`${colors.magenta}HMAC: ${colors.reset + hmac.hex}`);
console.log("-".repeat(70));

console.log("Available moves:");
input.forEach((entity, index) => {
  console.log(index + 1 + " - " + entity);
});
console.log("0 - exit");
console.log("? - help");

const askForInput = () => {
  return readlineSync.question("Enter your move: ");
};

let playerMove = "";

while (playerMove === "") {
  const playerInput = askForInput();

  if (playerInput == "?") {
    help.render();
    continue;
  } else if (playerInput == "0") process.exit();
  else if (
    !Number.isInteger(Number(playerInput)) ||
    playerInput < 0 ||
    playerInput > input.length
  )
    continue;
  else playerMove = playerInput;
}

console.log(`Your move: ${input[playerMove - 1]}!`);
console.log(`Computer move: ${input[computerMove - 1]}!`);

console.log("You " + rules.outcome(computerMove, playerMove) + colors.reset);

console.log("-".repeat(74));
console.log(`${colors.magenta}HMAC key: ${colors.reset + key}`);
console.log("-".repeat(74));
