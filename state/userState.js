const fs = require("fs");
const path = require("path");

const stateFilePath = path.join(__dirname, "../data/userStates.json");

module.exports = (ctx) => {
  const userId = ctx.from.id;
  const userFirstName = ctx.from.first_name || "Unknown";
  const userLastName = ctx.from.last_name || "";
  const userUsername = ctx.from.username || "Unknown";
  const userLanguage = ctx.from.language_code || "Unknown";

  let userStates = { sessions: [] }; // Инициализируем userStates с пустым массивом sessions

  // Чтение текущего состояния из файла
  if (fs.existsSync(stateFilePath)) {
    const data = fs.readFileSync(stateFilePath, "utf8");
    try {
      userStates = JSON.parse(data);
      if (!userStates.sessions) {
        userStates.sessions = []; // Убеждаемся, что sessions всегда является массивом
      }
    } catch (err) {
      console.error("Ошибка при парсинге JSON:", err);
    }
  }

  // Обновление состояния пользователя
  let userSession = userStates.sessions.find(
    (session) => session.id === userId
  );
  if (userSession) {
    userSession.data.counter = userSession.data.counter || 0;
    userSession.data.counter++;
  } else {
    userSession = {
      id: userId,
      counter: 1,
      firstName: userFirstName,
      lastName: userLastName,
      username: userUsername,
      language: userLanguage,
      data: {
        correctAnswers: 0, // Количество правильных ответов
        totalQuestions: 0, // Общее количество вопросов
        answeredQuestions: 0, // Количество пройденных вопросов
      },
    };
    userStates.sessions.push(userSession);
  }

  // Запись обновленного состояния в файл
  fs.writeFileSync(stateFilePath, JSON.stringify(userStates, null, 2), "utf8");

  return userSession.data.counter;
};
