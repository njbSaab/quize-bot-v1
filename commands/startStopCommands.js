const userState = require("../state/userState");
const quizActions = require("../actions/quizActions");

module.exports = (bot) => {
  // Обработка команды /start
  bot.command("start", async (ctx) => {
    try {
      const counter = await userState(ctx);
      await ctx.reply(
        `Добро пожаловать на наш квиз! Вы запустили эту команду ${counter} раз(а).`
      );

      // Сброс индекса вопроса
      ctx.session.questionIndex = 0;

      // Запуск викторины
      quizActions(bot);
      await quizActions.startQuiz(ctx);
    } catch (err) {
      console.error("Ошибка при обработке команды /start:", err);
    }
  });

  // Обработка команды /stop
  bot.command("stop", (ctx) => {
    try {
      ctx.reply(
        "Викторина остановлена. Чтобы начать заново, используйте команду /start."
      );
      ctx.session.questionIndex = 0; // Сброс индекса вопроса
    } catch (err) {
      console.error("Ошибка при обработке команды /stop:", err);
    }
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
