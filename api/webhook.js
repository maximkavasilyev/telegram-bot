const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

const axios = require("axios");

async function sendMessage(token, chatId, text, replyMarkup = null) {
  const payload = {
    chat_id: chatId,
    text,
    parse_mode: "HTML"
  };

  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  return axios.post(`https://api.telegram.org/bot${token}/sendMessage`, payload);
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const token = process.env.BOT_TOKEN;

    if (!token) {
      return res.status(500).json({ ok: false, error: "BOT_TOKEN is missing" });
    }

    const update = req.body;
    const message = update.message;

    if (!message || !message.chat || !message.text) {
      return res.status(200).json({ ok: true, skipped: true });
    }

    const chatId = message.chat.id;
    const text = message.text;

    if (text === "/start") {
      await sendMessage(token, chatId, "Привет ??");
      await sendMessage(token, chatId, "Это первое MVP-сообщение бота на Node.js.");

      const keyboard = {
        inline_keyboard: [
          [
            {
              text: "Написать ИНТЕРВЬЮ в личку",
              url: "https://t.me/soulteacher_english"
            }
          ]
        ]
      };

      await sendMessage(token, chatId, "Напиши мне ИНТЕРВЬЮ в личку — и выберем время.", keyboard);
      return res.status(200).json({ ok: true, handled: "start" });
    }

    await sendMessage(token, chatId, `Ты написал: ${text}`);
    return res.status(200).json({ ok: true, handled: "echo" });
  } catch (error) {
    console.error("Webhook error:", error?.response?.data || error.message);
    return res.status(500).json({
      ok: false,
      error: error?.response?.data || error.message
    });
  }
};
