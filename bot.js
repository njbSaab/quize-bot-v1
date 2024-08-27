//bot.js
const { Telegraf } = require("telegraf");
const config = require("./config/config");
const startStopCommands = require("./commands/startStopCommands");
const quizActions = require("./actions/quizActions");
const sessionMiddleware = require("./middleware/sessionMiddleware");

const bot = new Telegraf(config.botToken);

// Настройка сессий
bot.use(sessionMiddleware);

// Обработка команд
startStopCommands(bot);
quizActions(bot);

// Глобальный обработчик ошибок
bot.catch((err, ctx) => {
  console.error(`Ошибка для ${ctx.updateType}`, err);
});

// Запуск бота
async function startBot() {
  try {
    await bot.launch();
    console.log("Бот запущен...");
  } catch (err) {
    console.error("Ошибка при запуске бота:", err);
  }
}

startBot();
