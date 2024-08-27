//startStopCommands.js
const { mainMenu } = require("../menu/menu");
const userState = require("../state/userState");
const { startQuiz } = require("../actions/quizActions");

module.exports = (bot) => {
  // Обработка команды /start
  bot.command("start", async (ctx) => {
    try {
      const counter = await userState(ctx);
      await ctx.reply(
        `Добро пожаловать на наш квиз! Вы запустили эту команду ${counter} раз(а).`,
        mainMenu // Добавляем клавиатуру
      );

      // Сброс индекса вопроса
      ctx.session.questionIndex = 0;

      // Запуск викторины
      await startQuiz(ctx);
    } catch (err) {
      if (err.response && err.response.error_code === 403) {
        console.log("Бот был заблокирован пользователем:", ctx.from.id);
      } else {
        console.error("Ошибка при обработке команды /start:", err);
      }
    }
  });

  // Обработка команды и текстового ввода "start"
  bot.hears("start", async (ctx) => {
    try {
      const counter = await userState(ctx);
      await ctx.reply(
        `Добро пожаловать на наш квиз! Вы запустили эту команду ${counter} раз(а).`,
        mainMenu // Добавляем клавиатуру
      );

      // Сброс индекса вопроса
      ctx.session.questionIndex = 0;

      // Запуск викторины
      await startQuiz(ctx);
    } catch (err) {
      if (err.response && err.response.error_code === 403) {
        console.log("Бот был заблокирован пользователем:", ctx.from.id);
      } else {
        console.error("Ошибка при обработке команды start:", err);
      }
    }
  });

  // Обработка команды и текстового ввода "about"
  bot.hears("about", async (ctx) => {
    await ctx.reply(
      "Это бот для викторин, который помогает вам учиться и развлекаться одновременно!"
    );
  });

  // Обработка команды и текстового ввода "help"
  bot.hears("help", async (ctx) => {
    await ctx.reply(
      "Чтобы начать викторину, нажмите 'start'. Для информации о боте, нажмите 'about'. Для помощи, нажмите 'help'."
    );
  });

  // Обработка кнопки "Выйти"
  bot.action("exit", (ctx) => {
    try {
      ctx.reply(
        "Викторина остановлена. Чтобы начать заново, используйте команду /start."
      );
      ctx.session.questionIndex = 0; // Сброс индекса вопроса
    } catch (err) {
      console.error("Ошибка при обработке кнопки 'Выйти':", err);
    }
  });
};
