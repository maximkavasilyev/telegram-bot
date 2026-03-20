const TelegramBot = require("node-telegram-bot-api");
const path = require("path");
const { openFaq, handleFaqAction } = require("./flows/faqFlow");
const { openProof } = require("./flows/proofFlow");
const {
  createScheduledMessage,
  clearScheduledMessagesForFlow,
} = require("./repositories/scheduledMessageRepo");

const botToken = process.env.BOT_TOKEN;

const audioPath = path.join(__dirname, "..", "media", "ТЕМНАЯ-КОМНАТА.ogg");

const bot = new TelegramBot(botToken, { polling: true });

const enterKeyboard = {
  inline_keyboard: [[{ text: "ЗАЙТИ", callback_data: "enter_room" }]],
};

async function safeAnswerCallbackQuery(botInstance, queryId) {
  try {
    await botInstance.answerCallbackQuery(queryId);
  } catch (error) {
    const description =
      error?.response?.body?.description || error?.message || "";

    if (
      description.includes("query is too old") ||
      description.includes("query ID is invalid")
    ) {
      console.log("Callback устарел, пропускаем");
      return;
    }

    throw error;
  }
}

async function setupMenu() {
  await bot.setMyCommands([
    { command: "main", description: "Главное" },
    { command: "faq", description: "Обо мне и соцсети" },
    { command: "cases", description: "Отзывы и кейсы" },
  ]);

  await bot.setChatMenuButton({
    menu_button: { type: "commands" },
  });
}

async function sendMainBlock1(chatId) {
  await bot.sendMessage(
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

  await bot.sendMessage(
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

  await bot.sendMessage(
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
      reply_markup: enterKeyboard,
    }
  );

  await bot.sendMessage(
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

async function enqueueMainBlock2(chatId) {
  const baseTime = Date.now() + 12 * 60 * 60 * 1000;

  await createScheduledMessage({
    chatId,
    flow: "main",
    step: "block2_video",
    payloadType: "video_note",
    payloadKey: "MAIN_BLOCK2_VIDEO",
    sendAt: new Date(baseTime),
  });

  await createScheduledMessage({
    chatId,
    flow: "main",
    step: "block2_text_1",
    payloadType: "text",
    payloadKey: "MAIN_BLOCK2_TEXT_1",
    sendAt: new Date(baseTime + 1 * 60 * 1000),
  });

  await createScheduledMessage({
    chatId,
    flow: "main",
    step: "block2_text_2",
    payloadType: "text",
    payloadKey: "MAIN_BLOCK2_TEXT_2",
    sendAt: new Date(baseTime + 2 * 60 * 1000),
  });

  await createScheduledMessage({
    chatId,
    flow: "main",
    step: "block2_text_3",
    payloadType: "text",
    payloadKey: "MAIN_BLOCK2_TEXT_3",
    sendAt: new Date(baseTime + 3 * 60 * 1000),
  });

  await createScheduledMessage({
    chatId,
    flow: "main",
    step: "block2_text_4",
    payloadType: "text",
    payloadKey: "MAIN_BLOCK2_TEXT_4",
    sendAt: new Date(baseTime + 4 * 60 * 1000),
  });

  await createScheduledMessage({
    chatId,
    flow: "main",
    step: "block2_text_5",
    payloadType: "text",
    payloadKey: "MAIN_BLOCK2_TEXT_5",
    sendAt: new Date(baseTime + 5 * 60 * 1000),
  });
}

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  await clearScheduledMessagesForFlow(chatId, "main");

  await sendMainBlock1(chatId);
  await enqueueMainBlock2(chatId);
});

bot.onText(/\/main/, async (msg) => {
  const chatId = msg.chat.id;

  await bot.sendMessage(
    chatId,
    `Ты уже в главном сценарии.

Если хочешь пройти цепочку заново — нажми /start.`
  );
});

bot.onText(/\/faq/, async (msg) => {
  const chatId = msg.chat.id;
  await openFaq(bot, chatId);
});

bot.onText(/\/cases/, async (msg) => {
  const chatId = msg.chat.id;
  await openProof(bot, chatId);
});

bot.on("callback_query", async (query) => {
  const faqHandled = await handleFaqAction(bot, query);
  if (faqHandled) return;

  const chatId = query.message.chat.id;
  const data = query.data;

  if (data === "enter_room") {
    await safeAnswerCallbackQuery(bot, query.id);
    await bot.sendVoice(chatId, audioPath);
  }
});

bot.on("message", async (msg) => {
  const text = msg.text || "";

  if (
    text === "/start" ||
    text === "/main" ||
    text === "/faq" ||
    text === "/cases"
  ) {
    return;
  }
});

setupMenu().catch(console.error);

console.log("Бот запущен");

module.exports = { bot };
