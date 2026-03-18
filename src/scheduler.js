const db = require("./db");
const path = require("path");

let intervalId = null;

const videoNotePath = path.join(__dirname, "..", "media", "video-note.mp4");

const calmKeyboard = {
  inline_keyboard: [
    [{ text: "СПОКОЙСТВИЕ тут", url: "https://t.me/soulteacher_english" }],
  ],
};

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

async function sendScheduledRow(bot, row) {
  const chatId = row.chat_id;

  if (row.payload_type === "video_note" && row.payload_key === "MAIN_BLOCK2_VIDEO") {
    await bot.sendVideoNote(chatId, videoNotePath);
    return;
  }

  if (row.payload_type === "text" && row.payload_key === "MAIN_BLOCK2_TEXT_1") {
    await bot.sendMessage(chatId, MAIN_BLOCK2_TEXT_1);
    return;
  }

  if (row.payload_type === "text" && row.payload_key === "MAIN_BLOCK2_TEXT_2") {
    await bot.sendMessage(chatId, MAIN_BLOCK2_TEXT_2);
    return;
  }

  if (row.payload_type === "text" && row.payload_key === "MAIN_BLOCK2_TEXT_3") {
    await bot.sendMessage(chatId, MAIN_BLOCK2_TEXT_3);
    return;
  }

  if (row.payload_type === "text" && row.payload_key === "MAIN_BLOCK2_TEXT_4") {
    await bot.sendMessage(chatId, MAIN_BLOCK2_TEXT_4);
    return;
  }

  if (row.payload_type === "text" && row.payload_key === "MAIN_BLOCK2_TEXT_5") {
    await bot.sendMessage(chatId, MAIN_BLOCK2_TEXT_5, {
      reply_markup: calmKeyboard,
    });
    return;
  }

  throw new Error(`Неизвестный payload: ${row.payload_type} / ${row.payload_key}`);
}

async function pollScheduledMessages() {
  const { bot } = require("./bot");

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

  for (const row of result.rows) {
    try {
      await sendScheduledRow(bot, row);

      await db.query(
        `UPDATE scheduled_messages SET status = 'sent' WHERE id = $1`,
        [row.id]
      );

      console.log("SENT FROM SCHEDULER:", row.id, row.payload_key);
    } catch (error) {
      console.error("SCHEDULER ERROR:", row.id, error.message);

      await db.query(
        `UPDATE scheduled_messages SET status = 'failed' WHERE id = $1`,
        [row.id]
      );
    }
  }
}

function start() {
  if (intervalId) return;

  intervalId = setInterval(() => {
    pollScheduledMessages().catch((error) => {
      console.error("POLL ERROR:", error.message);
    });
  }, 5000);

  pollScheduledMessages().catch((error) => {
    console.error("INITIAL POLL ERROR:", error.message);
  });

  console.log("Scheduler запущен");
}

module.exports = { start };