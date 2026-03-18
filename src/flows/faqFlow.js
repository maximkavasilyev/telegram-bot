const path = require("path");

const aboutPhotoPath = path.join(__dirname, "..", "..", "media", "about.png");

const faqMenuKeyboard = {
  inline_keyboard: [
    [{ text: "Обо мне", callback_data: "faq_about" }],
    [{ text: "О продукте", callback_data: "faq_product" }],
    [{ text: "Контакты / соцсети", callback_data: "faq_contacts" }],
  ],
};

const backToFaqKeyboard = {
  inline_keyboard: [[{ text: "← Назад в FAQ", callback_data: "faq_back" }]],
};

async function safeAnswerCallbackQuery(bot, queryId) {
  try {
    await bot.answerCallbackQuery(queryId);
  } catch (error) {
    const description = error?.response?.body?.description || error?.message || "";

    if (
      description.includes("query is too old") ||
      description.includes("query ID is invalid")
    ) {
      console.log("FAQ callback устарел, пропускаем");
      return;
    }

    throw error;
  }
}

async function openFaq(bot, chatId) {
  await bot.sendMessage(chatId, `FAQ\n\nВыбери раздел:`, {
    reply_markup: faqMenuKeyboard,
  });
}

async function handleFaqAction(bot, query) {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data === "faq_back") {
    await safeAnswerCallbackQuery(bot, query.id);
    await openFaq(bot, chatId);
    return true;
  }

  if (data === "faq_about") {
    await safeAnswerCallbackQuery(bot, query.id);

    await bot.sendPhoto(chatId, aboutPhotoPath, {
      caption: `Меня зовут Дарья, я — сказкотерапевт, женский практик и автор иммерсивных исцеляющих сказок.

Уже 7 лет я изучаю и соединяю в своей работе практики осознанности, психологию, управление вниманием, телесные и женские практики, арт-терапию, МАК-карты, энерготерапию, а также влияние звука, ритма и голоса на состояние человека.`,
    });

    await bot.sendMessage(
      chatId,
      `Мой путь начался с материнства.
Женщине нужны не просто красивые практики, а инструменты, которые помогают быстро возвращать себя в ресурс — когда накрывает стресс, когда всё на тебе, когда нужно держать быт, детей, себя и при этом не развалиться внутри.

Мне всегда говорили, что мой голос умеет исцелять. А я с детства любила писать.
Так постепенно родился мой проект авторских сказок, где каждая история становится терапевтическим погружением — в состояние, в правду, в свою внутреннюю силу.

Первыми героями моих сказок стали мои ученики. Тогда я впервые увидела, как одна история может помочь ребёнку преодолеть страх ошибок, раскрыться и начать учиться легче. Позже я стала писать сказки для себя — и именно они стали ключом к сердцам многих женщин.

Так родился мой авторский метод, в котором сказка — это не просто история, а пространство глубокой настройки, внутренней трансформации и возвращения к себе.`,
      {
        reply_markup: backToFaqKeyboard,
      }
    );

    return true;
  }

  if (data === "faq_product") {
    await safeAnswerCallbackQuery(bot, query.id);

    await bot.sendMessage(
      chatId,
      `Это же просто сказка!
Если бы всё было так просто — сказки не рассказывали бы тысячелетиями.
С детства бабушки читали нам сказки, и только повзрослев я поняла, какие мощные коды в них заложены.

Карл Юнг, Кларисса Пинкола Эстес и другие исследователи доказали:
сказки говорят напрямую с бессознательным. Через образы. Сюжеты. Архетипы. И модели поведения.

Сказка обходит сопротивление ума.
Она мягко перепрошивает программы и работает эффективнее обычной терапии.

В моей работе сказка — это не просто история.
Это терапия через образы, дыхание и звук.
Мозг входит в расслабленное состояние,
и полезные установки усваиваются легче и глубже.

Я пишу сказки для взрослых и детей.
И в Замке Спокойствия они тоже будут:
— сказки для женщин — более 15 историй под разные состояния: про самоценность, силу, кризисы и многие другие
— детские сказки для засыпания и спокойствия

Все они короткие — до 15 минут.
Но очень мощные.
Ты можешь просто попробовать.
Иногда одного прослушивания достаточно, чтобы изменить всё.

Если откликается — пиши @soulteacher_english 🤍`,
      {
        reply_markup: backToFaqKeyboard,
      }
    );

    return true;
  }

  if (data === "faq_contacts") {
    await safeAnswerCallbackQuery(bot, query.id);

    await bot.sendMessage(
      chatId,
      `📩 Контакты

Если тебе откликается мой проект, сказки, комнаты состояний или ты хочешь пойти глубже — напиши мне лично 🤍

Я помогаю:
— разобрать твоё состояние
— понять, что с тобой сейчас происходит на самом деле
— увидеть свои цели и внутренние блоки
— выбрать самый бережный и точный путь дальше

Также я провожу:
— терапии
— консультации на Таро
— консультации с МАК-картами

Связаться со мной:
Telegram: @soulteacher_english
Instagram: https://www.instagram.com/soulteacher_english?igsh=N2tlenU4a2ozdnhj&utm_source=qr
ВКонтакте: https://vk.ru/daryagrand`,
      {
        reply_markup: backToFaqKeyboard,
      }
    );

    return true;
  }

  return false;
}

module.exports = { openFaq, handleFaqAction };