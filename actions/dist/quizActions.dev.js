"use strict";

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var questions = require("../questions/questions");

var fs = require("fs");

var path = require("path");

var stateFilePath = path.join(__dirname, "../data/userStates.json");

module.exports = function (bot) {
  // Обработка ответов пользователей
  bot.action(/answer_\d+/, function _callee(ctx) {
    var questionIndex, selectedOptionIndex, question, isCorrect, userId, userSession;
    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            questionIndex = ctx.session.questionIndex || 0;

            if (!(questionIndex >= questions.length)) {
              _context.next = 6;
              break;
            }

            _context.next = 5;
            return regeneratorRuntime.awrap(ctx.reply("Викторина завершена. Спасибо за участие!"));

          case 5:
            return _context.abrupt("return");

          case 6:
            selectedOptionIndex = parseInt(ctx.match[0].split("_")[1]);
            question = questions[questionIndex];
            isCorrect = question.options[selectedOptionIndex] === question.correctAnswer; // Обновление статистики

            userId = ctx.from.id;
            userSession = findUserSession(ctx, userId);

            if (userSession) {
              userSession.data.answeredQuestions++;
              userSession.data.totalQuestions = questions.length;

              if (isCorrect) {
                userSession.data.correctAnswers++;
              }

              saveUserState(ctx, userSession); // Логирование состояния пользователя

              console.log("User ID: ".concat(userId));
              console.log("Correct Answers: ".concat(userSession.data.correctAnswers));
              console.log("Answered Questions: ".concat(userSession.data.answeredQuestions));
              console.log("Total Questions: ".concat(userSession.data.totalQuestions));
            }

            _context.next = 14;
            return regeneratorRuntime.awrap(ctx.reply(isCorrect ? "Отлично, вы на шаг ближе к победе 👍" : "Неостанавливайтесь, вы на правильном пути ✅"));

          case 14:
            // Переход к следующему вопросу
            ctx.session.questionIndex = questionIndex + 1;

            if (!(ctx.session.questionIndex < questions.length)) {
              _context.next = 20;
              break;
            }

            _context.next = 18;
            return regeneratorRuntime.awrap(startQuiz(ctx));

          case 18:
            _context.next = 22;
            break;

          case 20:
            _context.next = 22;
            return regeneratorRuntime.awrap(ctx.reply("Викторина завершена. Спасибо за участие!"));

          case 22:
            _context.next = 27;
            break;

          case 24:
            _context.prev = 24;
            _context.t0 = _context["catch"](0);
            console.error("Ошибка при обработке ответа:", _context.t0);

          case 27:
          case "end":
            return _context.stop();
        }
      }
    }, null, null, [[0, 24]]);
  }); // Обработка кнопки "Назад"

  bot.action("back", function _callee2(ctx) {
    var questionIndex;
    return regeneratorRuntime.async(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            questionIndex = ctx.session.questionIndex || 0;

            if (!(questionIndex > 0)) {
              _context2.next = 10;
              break;
            }

            ctx.session.questionIndex = questionIndex - 1;
            _context2.next = 6;
            return regeneratorRuntime.awrap(ctx.reply("Давайте вернемся к предыдущему вопросу."));

          case 6:
            _context2.next = 8;
            return regeneratorRuntime.awrap(startQuiz(ctx));

          case 8:
            _context2.next = 12;
            break;

          case 10:
            _context2.next = 12;
            return regeneratorRuntime.awrap(ctx.reply("Мы не можем вернуться к предыдущему вопросу, вы на первом вопросе. Вы хотите выйти?", {
              reply_markup: {
                inline_keyboard: [[{
                  text: "Выйти",
                  callback_data: "exit"
                }]]
              }
            }));

          case 12:
            _context2.next = 17;
            break;

          case 14:
            _context2.prev = 14;
            _context2.t0 = _context2["catch"](0);
            console.error("Ошибка при обработке кнопки 'Назад':", _context2.t0);

          case 17:
          case "end":
            return _context2.stop();
        }
      }
    }, null, null, [[0, 14]]);
  }); // Обработка кнопки "Выйти"

  bot.action("exit", function _callee3(ctx) {
    return regeneratorRuntime.async(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _context3.next = 3;
            return regeneratorRuntime.awrap(ctx.reply("Викторина остановлена. Чтобы начать заново, используйте команду /start."));

          case 3:
            ctx.session.questionIndex = 0; // Сброс индекса вопроса

            _context3.next = 9;
            break;

          case 6:
            _context3.prev = 6;
            _context3.t0 = _context3["catch"](0);
            console.error("Ошибка при обработке кнопки 'Выйти':", _context3.t0);

          case 9:
          case "end":
            return _context3.stop();
        }
      }
    }, null, null, [[0, 6]]);
  });
}; // Функция для запуска викторины


function startQuiz(ctx) {
  var questionIndex, question, optionsMarkup;
  return regeneratorRuntime.async(function startQuiz$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          questionIndex = ctx.session.questionIndex || 0;

          if (!(questionIndex >= questions.length)) {
            _context4.next = 5;
            break;
          }

          _context4.next = 4;
          return regeneratorRuntime.awrap(ctx.reply("Викторина завершена. Спасибо за участие!"));

        case 4:
          return _context4.abrupt("return");

        case 5:
          question = questions[questionIndex];
          optionsMarkup = {
            reply_markup: {
              inline_keyboard: [].concat(_toConsumableArray(question.options.reduce(function (acc, option, index) {
                var rowIndex = Math.floor(index / 2);

                if (!acc[rowIndex]) {
                  acc[rowIndex] = [];
                }

                acc[rowIndex].push({
                  text: option,
                  callback_data: "answer_".concat(index)
                });
                return acc;
              }, [])), [[{
                text: "Назад",
                callback_data: "back"
              }] // [{ text: "Выйти", callback_data: "exit" }],
              ])
            }
          };
          _context4.next = 9;
          return regeneratorRuntime.awrap(ctx.reply(question.question, optionsMarkup));

        case 9:
        case "end":
          return _context4.stop();
      }
    }
  });
} // Функция для поиска сессии пользователя


function findUserSession(ctx, userId) {
  if (fs.existsSync(stateFilePath)) {
    var data = fs.readFileSync(stateFilePath, "utf8");

    try {
      var userStates = JSON.parse(data);
      return userStates.sessions.find(function (session) {
        return session.id === userId;
      });
    } catch (err) {
      console.error("Ошибка при парсинге JSON:", err);
    }
  }

  return null;
} // Функция для сохранения состояния пользователя


function saveUserState(ctx, userSession) {
  if (fs.existsSync(stateFilePath)) {
    var data = fs.readFileSync(stateFilePath, "utf8");

    try {
      var userStates = JSON.parse(data);
      var sessionIndex = userStates.sessions.findIndex(function (session) {
        return session.id === userSession.id;
      });

      if (sessionIndex !== -1) {
        userStates.sessions[sessionIndex] = userSession;
        fs.writeFileSync(stateFilePath, JSON.stringify(userStates, null, 2), "utf8");
      }
    } catch (err) {
      console.error("Ошибка при парсинге JSON:", err);
    }
  }
} // Экспортируем функцию startQuiz отдельно


module.exports.startQuiz = startQuiz;