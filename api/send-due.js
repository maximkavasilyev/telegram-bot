const fs = require("fs/promises");
const path = require("path");
const db = require("../src/db");

const BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

const enterKeyboard = {
  inline_keyboard: [[{ text: "ЗАЙТИ", callback_data: "enter_room" }]],
};

const calmKeyboard = {
  inline_keyboard: [
    [{ text: "СПОКОЙСТВИЕ тут", url: "https://t.me/soulteacher_english" }],
  ],
};

const MAIN_BLOCK1_TEXT_2 = `Иногда женщина думает, что её проблема — тревога, усталость, отношения или нехватка денег.

Но очень часто глубже лежит одно: она слишком долго была не собой.
Удобной. Правильной. Но не живой.
И хорошо, что всё можно изменить.

Сегодня ты зайдёшь в Тёмную Комнату.
К Зеркалу Истины.
В котором увидишь свою настоящую силу, спрятанную в Тени.

Иногда самое страшное — увидеть правду.
Но именно там начинается настоящая свобода.`;

const MAIN_BLOCK1_TEXT_3 = `После этой практики ты уже не сможешь так легко делать вид, что всё как раньше.
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
🕯 Делать в тишине, где тебя никто не отвлекает.`;

const MAIN_BLOCK1_TEXT_4 = `Если после этой практики ты чувствуешь, что увидела что-то очень важное…
Если поняла, что за твоей тенью стоит не только боль, но и сила…

Если внутри есть ощущение: я больше не могу жить как раньше, но пока не понимаю, как правильно забрать это себе — я могу провести тебя дальше.

Есть вторая дверь.
Бесплатный личный разбор, где мы идём глубже: не просто смотрим в тень, а достаём из неё твою силу, твой дар, твою правду.
Это не обычный разговор.
Это точечный проход туда, где твоя тень перестаёт пугать и начинает возвращать тебе энергию.

Если чувствуешь отклик — напиши слово ЗЕРКАЛО мне в личку @soulteacher_english, и я расскажу, как пройти дальше 🤍`;

const MAIN_BLOCK2_TEXT_1 = `Я искренне верю: каждой женщине нужна женщина🤍
Не та, которая учит жить.
А та, рядом с которой можно выдохнуть и быть собой.

Когда я проходила через сложные периоды — выгорание, депрессию, соло-материнство — именно женское комьюнити стало моей опорой.
И я считаю, что такая опора должна быть у каждой женщины.
Именно поэтому я создала Замок Спокойствия 🌿`;

const MAIN_BLOCK2_TEXT_2 = `🌿 ЗАМОК СПОКОЙСТВИЯ

Верни силу и ресурс за 5–10 минут в день — без марафонов и очередных нудных курсов.

Замок Спокойствия — это закрытая Telegram-группа на 1 месяц, где ты вернешь себе ресурсное состояние через короткие практики, терапевтические сказки и бережную поддержку.
Здесь ты будешь возвращаться к себе через короткие практики, терапевтические сказки, живые созвоны и бережную поддержку.

ЭТО ДЛЯ ТЕБЯ, ЕСЛИ:
— ты устала держать всё на себе
— внутри много тревоги, напряжения и фонового стресса
— всё валится из рук, отношения не клеятся
— ты срываешься на детей или близких, а потом накрывает вина
— тебе сложно расслабиться и получать удовольствие от близости
— ты давно не чувствуешь себя в ресурсе
— тебе хочется не просто выдохнуть, а вернуть себе спокойствие как базовое состояние`;

const MAIN_BLOCK2_TEXT_3 = `ПОЧЕМУ Я СОЗДАЛА ЭТО ПРОСТРАНСТВО

Я сама воспитываю двух детей.
И я очень хорошо знаю, что такое:
— жить без подушки безопасности
— держать всё на себе
— быть сильной, пока не начинаешь сыпаться
— не иметь права развалиться, даже когда внутри нет ресурса

Я прошла путь:
жёсткая дисциплина → выгорание → срывы → обретение настоящей опоры в себе
И я очень ясно поняла одну вещь:
пока внутри у женщины нет ресурса и ощущения безопасности — нет ни денег, ни энергии, ни классных отношений в семье.`;

const MAIN_BLOCK2_TEXT_4 = `ЧТО ВНУТРИ ЗАМКА

Внутри тебя ждут комнаты по состояниям, в которые можно заходить тогда, когда тебе это реально нужно. А так же:

— короткие практики на 5–10 минут
— терапевтические сказки и аудио-погружения
— живые созвоны со мной
— поддержка в течение месяца
— инструменты, которые можно использовать в реальной жизни, когда накрывает
— пространство, где не нужно быть сильной всё время`;

const MAIN_BLOCK2_TEXT_5 = `🎁 БОНУСЫ, КОТОРЫЕ ТЫ ПОЛУЧИШЬ В ПОДАРОК К ЗАМКУ СПОКОЙСТВИЯ

🔥 Терапевтические беседы со мной (4 созвона)
Бережные разборы состояний и быстрая поддержка
💎 ценность отдельно: 16 000 ₽

🔥 Матрица судьбы + Дизайн человека
Понимание, где утечки энергии, как не выгорать и легче зарабатывать
💎 ценность отдельно: 5 000 ₽

🔥 Индивидуальные аффирмации
Точечная настройка бессознательного под тебя
💎 ценность отдельно: 1 000 ₽

🔥 Детские практики для сна и спокойствия
Когда в порядке ребёнок — в порядке мама
💎 ценность отдельно: 1 000 ₽

🔥 Групповая коучинговая сессия «Цели без насилия»
Как получать желаемое без выгорания
💎 ценность отдельно: 2 500 ₽

🔥 Чек-лист «5 минут к спокойствию»
Экстренная помощь, когда накрывает
💎 ценность отдельно: 1 500 ₽

Общая ценность — более 20 000 ₽.

✨ Сегодня доступ в Замок Спокойствия — 3333 ₽ для первых 10 участниц

Напиши мне в личку «СПОКОЙСТВИЕ» 💬
И я расскажу, как попасть внутрь 🤍`;

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

async function resolveFirstExistingPath(paths) {
  for (const filePath of paths) {
    try {
      await fs.access(filePath);
      return filePath;
    } catch (_) {}
  }
  return null;
}

async function sendVideoNote(chatId) {
  const videoNotePath = await resolveFirstExistingPath([
    path.join(process.cwd(), "media", "video-note.mp4"),
    path.join(process.cwd(), "media", "video_note.mp4"),
  ]);

  if (!videoNotePath) {
    throw new Error("Video note file not found: video-note.mp4 / video_note.mp4");
  }

  const buffer = await fs.readFile(videoNotePath);

  const form = new FormData();
  form.append("chat_id", String(chatId));
  form.append(
    "video_note",
    new Blob([buffer], { type: "video/mp4" }),
    path.basename(videoNotePath)
  );

  return tg("sendVideoNote", form, true);
}

async function sendScheduledRow(row) {
  const chatId = row.telegram_chat_id || row.chat_id;

  if (!chatId) {
    throw new Error("Missing chat id in scheduled_messages row");
  }

  if (row.payload_type === "text" && row.payload_key === "MAIN_BLOCK1_TEXT_2") {
    await sendMessage(chatId, MAIN_BLOCK1_TEXT_2);
    return;
  }

  if (row.payload_type === "text" && row.payload_key === "MAIN_BLOCK1_TEXT_3") {
    await sendMessage(chatId, MAIN_BLOCK1_TEXT_3, {
      reply_markup: enterKeyboard,
    });
    return;
  }

  if (row.payload_type === "text" && row.payload_key === "MAIN_BLOCK1_TEXT_4") {
    await sendMessage(chatId, MAIN_BLOCK1_TEXT_4);
    return;
  }

  if (row.payload_type === "video_note" && row.payload_key === "MAIN_BLOCK2_VIDEO") {
    await sendVideoNote(chatId);
    return;
  }

  if (row.payload_type === "text" && row.payload_key === "MAIN_BLOCK2_TEXT_1") {
    await sendMessage(chatId, MAIN_BLOCK2_TEXT_1);
    return;
  }

  if (row.payload_type === "text" && row.payload_key === "MAIN_BLOCK2_TEXT_2") {
    await sendMessage(chatId, MAIN_BLOCK2_TEXT_2);
    return;
  }

  if (row.payload_type === "text" && row.payload_key === "MAIN_BLOCK2_TEXT_3") {
    await sendMessage(chatId, MAIN_BLOCK2_TEXT_3);
    return;
  }

  if (row.payload_type === "text" && row.payload_key === "MAIN_BLOCK2_TEXT_4") {
    await sendMessage(chatId, MAIN_BLOCK2_TEXT_4);
    return;
  }

  if (row.payload_type === "text" && row.payload_key === "MAIN_BLOCK2_TEXT_5") {
    await sendMessage(chatId, MAIN_BLOCK2_TEXT_5, {
      reply_markup: calmKeyboard,
    });
    return;
  }

  throw new Error(`Unknown payload: ${row.payload_type} / ${row.payload_key}`);
}

module.exports = async (req, res) => {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed",
    });
  }

  try {
    const result = await db.query(`
      UPDATE scheduled_messages
      SET status = 'processing'
      WHERE id IN (
        SELECT id
        FROM scheduled_messages
        WHERE status = 'pending'
          AND send_at <= NOW()
        ORDER BY send_at ASC
        LIMIT 20
        FOR UPDATE SKIP LOCKED
      )
      RETURNING *;
    `);

    let sent = 0;
    let failed = 0;

    for (const row of result.rows) {
      try {
        await sendScheduledRow(row);

        await db.query(
          `UPDATE scheduled_messages SET status = 'sent' WHERE id = $1`,
          [row.id]
        );

        sent += 1;
      } catch (error) {
        console.error("SEND_DUE_ROW_ERROR:", row.id, error.message);

        await db.query(
          `UPDATE scheduled_messages SET status = 'failed' WHERE id = $1`,
          [row.id]
        );

        failed += 1;
      }
    }

    return res.status(200).json({
      ok: true,
      picked: result.rows.length,
      sent,
      failed,
    });
  } catch (error) {
    console.error("SEND_DUE_ERROR:", error.message);

    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
};