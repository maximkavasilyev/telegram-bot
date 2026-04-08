const fs = require("fs/promises");
const path = require("path");

const BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

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
  const voicePath = await resolveFirstExistingPath([
    path.join(process.cwd(), "media", "voice2.ogg"),
    path.join(process.cwd(), "media", "voice.ogg"),
  ]);

  if (!voicePath) {
    throw new Error("Voice file not found: voice2.ogg / voice.ogg");
  }

  const buffer = await fs.readFile(voicePath);

  const form = new FormData();
  form.append("chat_id", String(chatId));
  form.append("caption", "ТЕМНАЯ-КОМНАТА");
  form.append(
    "voice",
    new Blob([buffer], { type: "audio/ogg" }),
    path.basename(voicePath)
  );

  const response = await fetch(`${TELEGRAM_API}/sendVoice`, {
    method: "POST",
    body: form,
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(data.description || "sendVoice failed");
  }

  return data;
}

async function sendPhoto(chatId, filePath, extra = {}) {
  const buffer = await fs.readFile(filePath);

  const form = new FormData();
  form.append("chat_id", String(chatId));

  if (extra.caption) {
    form.append("caption", extra.caption);
  }

  if (extra.reply_markup) {
    form.append("reply_markup", JSON.stringify(extra.reply_markup));
  }

  form.append(
    "photo",
    new Blob([buffer], { type: "image/png" }),
    path.basename(filePath)
  );

  return tg("sendPhoto", form, true);
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

async function openFaq(chatId) {
  await sendMessage(chatId, `FAQ\n\nВыбери раздел:`, {
    reply_markup: faqMenuKeyboard,
  });
}

async function handleFaqCallback(callbackQuery) {
  const chatId = callbackQuery?.message?.chat?.id;
  const data = callbackQuery?.data;

  if (!chatId || !data) {
    return false;
  }

  if (data === "faq_back") {
    await answerCallbackQuery(callbackQuery.id);
    await openFaq(chatId);
    return true;
  }

  if (data === "faq_about") {
    await answerCallbackQuery(callbackQuery.id);

    const aboutPhotoPath = await resolveFirstExistingPath([
      path.join(process.cwd(), "media", "about.png"),
      path.join(process.cwd(), "media", "about.jpg"),
      path.join(process.cwd(), "media", "about.jpeg"),
    ]);

    const aboutCaption = `Меня зовут Дарья, я — сказкотерапевт, женский практик и автор иммерсивных исцеляющих сказок.

Уже 7 лет я изучаю и соединяю в своей работе практики осознанности, психологию, управление вниманием, телесные и женские практики, арт-терапию, МАК-карты, энерготерапию, а также влияние звука, ритма и голоса на состояние человека.`;

    if (aboutPhotoPath) {
      await sendPhoto(chatId, aboutPhotoPath, {
        caption: aboutCaption,
      });
    } else {
      await sendMessage(chatId, aboutCaption);
    }

    await sendMessage(
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
    await answerCallbackQuery(callbackQuery.id);

    await sendMessage(
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
    await answerCallbackQuery(callbackQuery.id);

    await sendMessage(
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
        await handleStart(chatId);
        return res.status(200).json({ ok: true, handled: "start" });
      }

      if (text === "/faq") {
        await openFaq(chatId);
        return res.status(200).json({ ok: true, handled: "faq" });
      }

      if (text === "/cases") {
        await sendMessage(
          chatId,
          `Отзывы / кейсы подключаю следующим шагом.
Сейчас сначала добиваем FAQ, чтобы не мешать два слоя сразу.`
        );
        return res.status(200).json({ ok: true, handled: "cases_stub" });
      }
    }

    if (callbackQuery?.message?.chat?.id) {
      const faqHandled = await handleFaqCallback(callbackQuery);
      if (faqHandled) {
        return res.status(200).json({ ok: true, handled: "faq_callback" });
      }

      if (callbackQuery.data === "enter_room") {
        await answerCallbackQuery(callbackQuery.id);
        await sendVoice(callbackQuery.message.chat.id);
        return res.status(200).json({ ok: true, handled: "enter_room" });
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