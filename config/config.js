require("dotenv").config();

module.exports = {
  botToken: process.env.TELEGRAM_BOT_TOKEN,
  dbPath: process.env.DATABASE_PATH,
};
