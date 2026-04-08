const fs = require("fs/promises");
const path = require("path");

const BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

const voicePath = path.join(process.cwd(), "media", "voice.ogg");

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
  return tg("answerCallbackQuery", {
    callback_query_id: callbackQueryId,
  });
}

async function sendVoice(chatId) {
  const buffer = await fs.readFile(voicePath);

  const form = new FormData();
  form.append("chat_id", String(chatId));
  form.append("caption", "ТЕМНАЯ-КОМНАТА");
  form.append("voice", new Blob([buffer], { type: "audio/ogg" }), "voice2.ogg");

  const response = await fetch(`${TELEGRAM_API}/sendVoice`, {
    method: "POST",
    body: form,
  });

  const data = await response.json();
  console.error("SEND_VOICE_RESULT:", JSON.stringify(data));

  if (!data.ok) {
    throw new Error(data.description || "sendVoice failed");
  }

  return data;
}

async function handleStart(chatId) {
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

  await sendMessage(
    chatId,
    `Иногда женщина думает, что её проблема — тревога, усталость, отношения или нехватка денег.

Но очень часто глубже лежит одно: она слишком долго была не собой.
Удобной. Правильной. Но не живой.
И хорошо, что всё можно изменить.

Сегодня ты зайдёшь в Тёмную Комнату.
К Зеркалу Истины.
В котором увидишь свою настоящую силу, спрятанную в Тени.

Иногда самое страшное — увидеть правду.
Но именно там начинается настоящая свобода.`
  );

  await sendMessage(
    chatId,
    `После этой практики ты уже не сможешь так легко делать вид, что всё как раньше.
Терпеть и соглашаться на меньшее.

Потому что когда женщина однажды видит:
— где она себя предаёт
— чего на самом деле боится
— какую силу прячет в своей тени

всё меняется.
Это только первая дверь.
И, возможно, самая честная.

Если ты готова войти — нажми ЗАЙТИ.

P.S.
🎧 Лучше слушать в наушниках
🕯 Делать в тишине, где тебя никто не отвлекает.`,
    {
      reply_markup: {
        inline_keyboard: [[{ text: "ЗАЙТИ", callback_data: "enter_room" }]],
      },
    }
  );

  await sendMessage(
    chatId,
    `Если после этой практики ты чувствуешь, что увидела что-то очень важное…
Если поняла, что за твоей тенью стоит не только боль, но и сила…

Если внутри есть ощущение: я больше не могу жить как раньше, но пока не понимаю, как правильно забрать это себе — я могу провести тебя дальше.

Есть вторая дверь.
Бесплатный личный разбор, где мы идём глубже: не просто смотрим в тень, а достаём из неё твою силу, твой дар, твою правду.
Это не обычный разговор.
Это точечный проход туда, где твоя тень перестаёт пугать и начинает возвращать тебе энергию.

Если чувствуешь отклик — напиши слово ЗЕРКАЛО мне в личку @soulteacher_english, и я расскажу, как пройти дальше 🤍`
  );
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

    if (
      message?.chat?.id &&
      typeof message?.text === "string" &&
      message.text.startsWith("/start")
    ) {
      await handleStart(message.chat.id);
    }

    if (callbackQuery?.data === "enter_room" && callbackQuery?.message?.chat?.id) {
      await answerCallbackQuery(callbackQuery.id);
      await sendVoice(callbackQuery.message.chat.id);
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("WEBHOOK_ERROR:", error.message);
    return res.status(200).json({
      ok: false,
      error: error.message,
    });
  }
};