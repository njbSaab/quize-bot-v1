const questions = require("../questions/questions");
const fs = require("fs");
const path = require("path");

const stateFilePath = path.join(__dirname, "../data/userStates.json");

module.exports = (bot) => {
  // Обработка ответов пользователей
  bot.action(/answer_\d+/, async (ctx) => {
    try {
      const questionIndex = ctx.session.questionIndex || 0;
      if (questionIndex >= questions.length) {
        await ctx.reply("Викторина завершена. Спасибо за участие!");
        return;
      }

      const selectedOptionIndex = parseInt(ctx.match[0].split("_")[1]);
      const question = questions[questionIndex];
      const isCorrect =
        question.options[selectedOptionIndex] === question.correctAnswer;

      // Обновление статистики
      const userId = ctx.from.id;
      const userSession = findUserSession(ctx, userId);
      if (userSession) {
        userSession.data.answeredQuestions++;
        userSession.data.totalQuestions = questions.length;
        if (isCorrect) {
          userSession.data.correctAnswers++;
        }
        saveUserState(ctx, userSession);

        // Логирование состояния пользователя
        console.log(`User ID: ${userId}`);
        console.log(`Correct Answers: ${userSession.data.correctAnswers}`);
        console.log(
          `Answered Questions: ${userSession.data.answeredQuestions}`
        );
        console.log(`Total Questions: ${userSession.data.totalQuestions}`);
      }

      await ctx.reply(
        isCorrect
          ? "Отлично, вы на шаг ближе к победе 👍"
          : "Неостанавливайтесь, вы на правильном пути ✅"
      );

      // Переход к следующему вопросу
      ctx.session.questionIndex = questionIndex + 1;
      if (ctx.session.questionIndex < questions.length) {
        await startQuiz(ctx);
      } else {
        await ctx.reply("Викторина завершена. Спасибо за участие!");
      }
    } catch (err) {
      console.error("Ошибка при обработке ответа:", err);
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
    await ctx.reply("Викторина завершена. Спасибо за участие!");
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
        // [{ text: "Выйти", callback_data: "exit" }],
      ],
    },
  };
  await ctx.reply(question.question, optionsMarkup);
}

// Функция для поиска сессии пользователя
function findUserSession(ctx, userId) {
  if (fs.existsSync(stateFilePath)) {
    const data = fs.readFileSync(stateFilePath, "utf8");
    try {
      const userStates = JSON.parse(data);
      return userStates.sessions.find((session) => session.id === userId);
    } catch (err) {
      console.error("Ошибка при парсинге JSON:", err);
    }
  }
  return null;
}

// Функция для сохранения состояния пользователя
function saveUserState(ctx, userSession) {
  if (fs.existsSync(stateFilePath)) {
    const data = fs.readFileSync(stateFilePath, "utf8");
    try {
      const userStates = JSON.parse(data);
      const sessionIndex = userStates.sessions.findIndex(
        (session) => session.id === userSession.id
      );
      if (sessionIndex !== -1) {
        userStates.sessions[sessionIndex] = userSession;
        fs.writeFileSync(
          stateFilePath,
          JSON.stringify(userStates, null, 2),
          "utf8"
        );
      }
    } catch (err) {
      console.error("Ошибка при парсинге JSON:", err);
    }
  }
}

// Экспортируем функцию startQuiz отдельно
module.exports.startQuiz = startQuiz;
