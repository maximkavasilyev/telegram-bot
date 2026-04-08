const fs = require("fs/promises");
const path = require("path");
const {
  createScheduledMessage,
  clearScheduledMessagesForFlow,
} = require("../src/repositories/scheduledMessageRepo");

const BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

async function readUpdate(req) {
  if (req.body) {
    return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

async function tg(method, payload, isForm = false) {
  const response = await fetch(`${TELEGRAM_API}/${method}`, {
    method: "POST",
    headers: isForm ? undefined : { "Content-Type": "application/json" },
    body: isForm ? payload : JSON.stringify(payload),
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(data.description || `Telegram API error in ${method}`);
  }

  return data;
}

async function sendMessage(chatId, text, extra = {}) {
  return tg("sendMessage", {
    chat_id: chatId,
    text,
    ...extra,
  });
}

async function answerCallbackQuery(callbackQueryId) {
  try {
    return await tg("answerCallbackQuery", {
      callback_query_id: callbackQueryId,
    });
  } catch (error) {
    const message = error?.message || "";
    if (
      message.includes("query is too old") ||
      message.includes("query ID is invalid")
    ) {
      return null;
    }
    throw error;
  }
}

async function resolveFirstExistingPath(paths) {
  for (const filePath of paths) {
    try {
      await fs.access(filePath);
      return filePath;
    } catch (_) {}
  }
  return null;
}

async function sendVoice(chatId) {
  const voiceFileId =
    "AwACAgIAAxkDAAIIPWnWdp7cO4y-1gJ1A1VH5Q5DXW-NAALNmAACqM2wStvPk9UH9xPWOwQ";

  return tg("sendVoice", {
    chat_id: chatId,
    voice: voiceFileId,
    caption: "ТЕМНАЯ-КОМНАТА",
  });
}

async function sendMainBlock1Message1(chatId) {
  await sendMessage(
    chatId,
    `Привет 🤍

Если ты здесь — значит, ты уже чувствуешь:
по-старому больше нельзя.

Эта практика поможет тебе за 10–13 минут:
— сделать первый шаг к своей настоящей силе
— встретиться со своей тенью
— перестать врать себе

Важно: не откладывай.
Практика работает глубже, если ты заходишь в неё сразу, пока внутри есть отклик.`
  );
}

async function enqueueMainFlow(chatId) {
  const now = Date.now();

  await createScheduledMessage({
    chatId,
    flow: "main",
    step: "block1_text_2",
    payloadType: "text",
    payloadKey: "MAIN_BLOCK1_TEXT_2",
    sendAt: new Date(now + 1 * 60 * 1000),
  });

  await createScheduledMessage({
    chatId,
    flow: "main",
    step: "block1_text_3",
    payloadType: "text",
    payloadKey: "MAIN_BLOCK1_TEXT_3",
    sendAt: new Date(now + 2 * 60 * 1000),
  });

  await createScheduledMessage({
    chatId,
    flow: "main",
    step: "block1_text_4",
    payloadType: "text",
    payloadKey: "MAIN_BLOCK1_TEXT_4",
    sendAt: new Date(now + 3 * 60 * 1000),
  });

  const block2Base = now + (12 * 60 * 60 * 1000) + (3 * 60 * 1000);

  await createScheduledMessage({
    chatId,
    flow: "main",
    step: "block2_video",
    payloadType: "video_note",
    payloadKey: "MAIN_BLOCK2_VIDEO",
    sendAt: new Date(block2Base),
  });

  await createScheduledMessage({
    chatId,
    flow: "main",
    step: "block2_text_1",
    payloadType: "text",
    payloadKey: "MAIN_BLOCK2_TEXT_1",
    sendAt: new Date(block2Base + 1 * 60 * 1000),
  });

  await createScheduledMessage({
    chatId,
    flow: "main",
    step: "block2_text_2",
    payloadType: "text",
    payloadKey: "MAIN_BLOCK2_TEXT_2",
    sendAt: new Date(block2Base + 2 * 60 * 1000),
  });

  await createScheduledMessage({
    chatId,
    flow: "main",
    step: "block2_text_3",
    payloadType: "text",
    payloadKey: "MAIN_BLOCK2_TEXT_3",
    sendAt: new Date(block2Base + 3 * 60 * 1000),
  });

  await createScheduledMessage({
    chatId,
    flow: "main",
    step: "block2_text_4",
    payloadType: "text",
    payloadKey: "MAIN_BLOCK2_TEXT_4",
    sendAt: new Date(block2Base + 4 * 60 * 1000),
  });

  await createScheduledMessage({
    chatId,
    flow: "main",
    step: "block2_text_5",
    payloadType: "text",
    payloadKey: "MAIN_BLOCK2_TEXT_5",
    sendAt: new Date(block2Base + 5 * 60 * 1000),
  });
}

module.exports = async (req, res) => {
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      route: "telegram-webhook",
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed",
    });
  }

  try {
    const update = await readUpdate(req);
    const message = update?.message;
    const callbackQuery = update?.callback_query;

    if (typeof message?.text === "string" && message?.chat?.id) {
      const chatId = message.chat.id;
      const text = message.text.trim();

      if (text.startsWith("/start")) {
        await sendMainBlock1Message1(chatId);

        try {
          await clearScheduledMessagesForFlow(chatId, "main");
          await enqueueMainFlow(chatId);
        } catch (error) {
          console.error("DELAYED_SCHEDULE_ERROR:", error.message);
        }

        return res.status(200).json({
          ok: true,
          handled: "start",
        });
      }
    }

    if (callbackQuery?.message?.chat?.id) {
      if (callbackQuery.data === "enter_room") {
        await answerCallbackQuery(callbackQuery.id);
        await sendVoice(callbackQuery.message.chat.id);

        return res.status(200).json({
          ok: true,
          handled: "enter_room",
        });
      }
    }

    return res.status(200).json({ ok: true, skipped: true });
  } catch (error) {
    console.error("WEBHOOK_ERROR:", error.message);
    return res.status(200).json({
      ok: false,
      error: error.message,
    });
  }
};