require("dotenv").config();

const scheduler = require("./scheduler");
require("./db");
require("./bot");

if (!process.env.BOT_TOKEN) {
  throw new Error("BOT_TOKEN не найден");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL не найден");
}

scheduler.start();

console.log("Приложение запущено");