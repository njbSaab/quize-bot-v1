//quizActions.js
const { Markup } = require("telegraf"); // Импортируем Markup для создания inline-кнопок
const questions = require("../questions/questions");
const userState = require("../state/userState");
const fs = require("fs").promises;
const path = require("path");
const stateFilePath = path.join(__dirname, "../data/userStates.json");

module.exports = (bot) => {
  bot.action(/answer_\d+/, async (ctx) => {
    try {
      const questionIndex = ctx.session.questionIndex || 0;
      if (questionIndex >= questions.length) {
        // После завершения всех вопросов проверяем, есть ли имя и email
        const userId = ctx.from?.id?.toString() || "unknown";
        let userStates = { sessions: [] };

        try {
          const userStatesData = await fs.readFile(stateFilePath, "utf8");
          userStates = JSON.parse(userStatesData);
        } catch (err) {
          if (err.code !== "ENOENT") {
            console.error(
              "Ошибка при чтении или парсинге userStates.json:",
              err
            );
          }
        }

        const userSession = userStates.sessions.find(
          (session) => session.id === userId
        );

        if (userSession && userSession.name && userSession.email) {
          // Если почта уже есть, предлагаем подтвердить
          await ctx.reply(
            `Скажите, это ваша почта? ${userSession.email}`,
            Markup.inlineKeyboard([
              Markup.button.callback("Да, это моя почта", "confirm_email"),
              Markup.button.callback("Нет, другая почта", "new_email"),
            ])
          );
        } else {
          // Если почты нет, запрашиваем её
          await ctx.reply(
            "Викторина завершена. Спасибо за участие! Остался последний шаг"
          );
          await ctx.reply("Пожалуйста, укажите ваше имя.");
          ctx.session.awaitingName = true; // Устанавливаем флаг ожидания имени
        }

        return;
      }

      const selectedOptionIndex = parseInt(ctx.match[0].split("_")[1]);
      const question = questions[questionIndex];
      const isCorrect =
        question.options[selectedOptionIndex] === question.correctAnswer;

      // Обновление состояния пользователя
      await userState(ctx, isCorrect);

      await ctx.reply(
        isCorrect
          ? "Отлично, вы на шаг ближе к победе 👍"
          : "Не останавливайтесь, вы на правильном пути ✅"
      );

      // Переход к следующему вопросу
      ctx.session.questionIndex = questionIndex + 1;
      if (ctx.session.questionIndex < questions.length) {
        await startQuiz(ctx);
      } else {
        // Аналогичная проверка на окончание викторины
        const userId = ctx.from?.id?.toString() || "unknown";
        let userStates = { sessions: [] };

        try {
          const userStatesData = await fs.readFile(stateFilePath, "utf8");
          userStates = JSON.parse(userStatesData);
        } catch (err) {
          if (err.code !== "ENOENT") {
            console.error(
              "Ошибка при чтении или парсинге userStates.json:",
              err
            );
          }
        }

        const userSession = userStates.sessions.find(
          (session) => session.id === userId
        );

        if (userSession && userSession.name && userSession.email) {
          await ctx.reply(
            `Скажите, это ваша почта? ${userSession.email}`,
            Markup.inlineKeyboard([
              Markup.button.callback("Да, это моя почта", "confirm_email"),
              Markup.button.callback("Нет, другая почта", "new_email"),
            ])
          );
        } else {
          await ctx.reply(
            "Викторина завершена. Спасибо за участие! Остался последний шаг"
          );
          await ctx.reply("Пожалуйста, укажите ваше имя.");
          ctx.session.awaitingName = true; // Устанавливаем флаг ожидания имени
        }
      }
    } catch (err) {
      console.error("Ошибка при обработке ответа:", err);
    }
  });

  bot.on("text", async (ctx) => {
    try {
      if (ctx.session.awaitingName) {
        ctx.session.name = ctx.message.text;
        ctx.session.awaitingName = false;
        ctx.session.awaitingEmailConfirmation = true;

        const userId = ctx.from?.id?.toString() || "unknown";
        let userStates = { sessions: [] };

        try {
          const userStatesData = await fs.readFile(stateFilePath, "utf8");
          userStates = JSON.parse(userStatesData);
        } catch (err) {
          if (err.code !== "ENOENT") {
            console.error(
              "Ошибка при чтении или парсинге userStates.json:",
              err
            );
          }
        }

        const userSession = userStates.sessions.find(
          (session) => session.id === userId
        );

        if (userSession && userSession.email) {
          await ctx.reply(
            `Скажите, это ваша почта? ${userSession.email}`,
            Markup.inlineKeyboard([
              Markup.button.callback("Да, это моя почта", "confirm_email"),
              Markup.button.callback("Нет, другая почта", "new_email"),
            ])
          );
        } else {
          await ctx.reply("Теперь укажите ваш адрес электронной почты.");
          ctx.session.awaitingEmail = true;
        }
      } else if (ctx.session.awaitingEmail) {
        ctx.session.email = ctx.message.text;
        ctx.session.awaitingEmail = false;

        // Сохранение имени и почты в userState.json
        await userState(ctx, null, {
          name: ctx.session.name,
          email: ctx.session.email,
        });

        await ctx.reply(
          `Спасибо! Вы указали имя: ${ctx.session.name} и почту: ${ctx.session.email}. Ви можете продолжить играть на нашем сайте https://quizwhizworld.top/`
        );
      }
    } catch (err) {
      console.error("Ошибка при обработке текстового ввода:", err);
    }
  });

  bot.action("confirm_email", async (ctx) => {
    try {
      const userId = ctx.from?.id?.toString() || "unknown";
      let userStates = { sessions: [] };

      try {
        const userStatesData = await fs.readFile(stateFilePath, "utf8");
        userStates = JSON.parse(userStatesData);
      } catch (err) {
        if (err.code !== "ENOENT") {
          console.error("Ошибка при чтении или парсинге userStates.json:", err);
        }
      }

      const userSession = userStates.sessions.find(
        (session) => session.id === userId
      );

      if (userSession && userSession.email) {
        await userState(ctx, null, {
          name: ctx.session.name,
          email: userSession.email,
        });

        await ctx.reply(
          `Спасибо! Вы указали имя: ${ctx.session.name} и почту: ${userSession.email}. Ви можете продолжить играть на нашем сайте https://quizwhizworld.top/`
        );
      } else {
        await ctx.reply("Произошла ошибка при подтверждении почты.");
      }
    } catch (err) {
      console.error("Ошибка при обработке подтверждения почты:", err);
    }
  });

  bot.action("new_email", async (ctx) => {
    try {
      await ctx.reply("Теперь укажите ваш новый адрес электронной почты.");
      ctx.session.awaitingEmail = true;
    } catch (err) {
      console.error("Ошибка при обработке новой почты:", err);
    }
  });

  // Обработка кнопки "Назад"
  bot.action("back", async (ctx) => {
    try {
      const questionIndex = ctx.session.questionIndex || 0;
      if (questionIndex > 0) {
        ctx.session.questionIndex = questionIndex - 1;
        await ctx.reply("Давайте вернемся к предыдущему вопросу.");
        await startQuiz(ctx);
      } else {
        await ctx.reply(
          "Мы не можем вернуться к предыдущему вопросу, вы на первом вопросе. Вы хотите выйти?",
          {
            reply_markup: {
              inline_keyboard: [[{ text: "Выйти", callback_data: "exit" }]],
            },
          }
        );
      }
    } catch (err) {
      console.error("Ошибка при обработке кнопки 'Назад':", err);
    }
  });

  // Обработка кнопки "Выйти"
  bot.action("exit", async (ctx) => {
    try {
      await ctx.reply(
        "Викторина остановлена. Чтобы начать заново, используйте команду /start."
      );
      ctx.session.questionIndex = 0; // Сброс индекса вопроса
    } catch (err) {
      console.error("Ошибка при обработке кнопки 'Выйти':", err);
    }
  });
};

// Функция для запуска викторины
async function startQuiz(ctx) {
  const questionIndex = ctx.session.questionIndex || 0;
  if (questionIndex >= questions.length) {
    await ctx.reply(
      "Викторина завершена. Спасибо за участие! Остался последний шаг"
    );
    return;
  }

  const question = questions[questionIndex];
  const optionsMarkup = {
    reply_markup: {
      inline_keyboard: [
        ...question.options.reduce((acc, option, index) => {
          const rowIndex = Math.floor(index / 2);
          if (!acc[rowIndex]) {
            acc[rowIndex] = [];
          }
          acc[rowIndex].push({
            text: option,
            callback_data: `answer_${index}`,
          });
          return acc;
        }, []),
        [{ text: "Назад", callback_data: "back" }],
      ],
    },
  };

  if (question.imageUrl) {
    await ctx.replyWithPhoto(
      { url: question.imageUrl },
      { caption: question.question, ...optionsMarkup }
    );
  } else {
    await ctx.reply(question.question, optionsMarkup);
  }
}

// Экспортируем функцию startQuiz отдельно
module.exports.startQuiz = startQuiz;
