const LocalSession = require("telegraf-session-local");
const config = require("../config/config");

try {
  const sessionMiddleware = new LocalSession({
    database: config.dbPath,
  }).middleware();
  module.exports = sessionMiddleware;
} catch (err) {
  console.error("Ошибка при настройке сессий:", err);
}
