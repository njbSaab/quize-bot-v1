const { Markup } = require("telegraf");

module.exports = {
  mainMenu: Markup.keyboard([["/start"], ["about"], ["help"]])
    .resize()
    .oneTime(),
};
