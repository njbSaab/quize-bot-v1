//menu.js
const { Markup } = require("telegraf");

module.exports = {
  mainMenu: Markup.keyboard([
    ["/start"], // Кнопка "start" занимает всю ширину
    ["about", "help"], // Кнопки "about" и "help" занимают 50% ширины каждая
  ])
    .resize()
    .oneTime(),
};
