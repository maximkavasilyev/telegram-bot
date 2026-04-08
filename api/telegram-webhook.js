const path = require("path");
const {
  createScheduledMessage,
  clearScheduledMessagesForFlow,
} = require("../src/repositories/scheduledMessageRepo");

const BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

const VOICE_FILE_ID =
  "AwACAgIAAxkDAAIIPWnWdp7cO4y-1gJ1A1VH5Q5DXW-NAALNmAACqM2wStvPk9UH9xPWOwQ";

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

function getPhotoMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
}

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
  const fs = require("fs/promises");

  for (const filePath of paths) {
    try {
      await fs.access(filePath);
      return filePath;
    } catch (_) {}
  }
  return null;
}

async function sendPhoto(chatId, filePath, extra = {}) {
  const fs = require("fs/promises");
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
    new Blob([buffer], { type: getPhotoMimeType(filePath) }),
    path.basename(filePath)
  );

  return tg("sendPhoto", form, true);
}

async function sendPhotoIfExists(chatId, candidatePaths, extra = {}) {
  const photoPath = await resolveFirstExistingPath(candidatePaths);

  if (!photoPath) {
    return false;
  }

  await sendPhoto(chatId, photoPath, extra);
  return true;
}

async function sendVoice(chatId) {
  return tg("sendVoice", {
    chat_id: chatId,
    voice: VOICE_FILE_ID,
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

  const block2Base = now + 12 * 60 * 60 * 1000 + 3 * 60 * 1000;

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

async function openCases(chatId) {
  await sendMessage(chatId, `Отзывы / Кейсы`);

  await sendMessage(
    chatId,
    `Как я накодовала себе платье за 75 тысяч, просто написав сказку про самоценность

Когда-то я увидела платье своей мечты.
Оно стоило 75 тысяч.
Красивое до мурашек.
И, если честно, для той меня оно казалось почти невозможным.
Слишком дорогое. Слишком роскошное.
Слишком “не для меня”.

Но я всё-таки его надела.
Подошла к зеркалу.
Посмотрела на своё отражение — и меня буквально пронзило.
Потому что в зеркале я увидела не привычную себя.
Я увидела там свою Душу.

И в этот момент у меня выступили слёзы.
Потому что я вдруг очень ясно почувствовала, как долго сама себя не ценила и принижала, как смотрела на себя не своими глазами.
И жила так, будто мне нельзя хотеть большего, нельзя выбирать красивое, нельзя принимать дары жизни легко.

Этот момент стал для переломным.
В тот же день я села и написала свою первую сказку — сказку про самоценность.
Именно она потом стала первой в цикле сказок Замка.

Когда я её написала, я поняла:
это не просто история.
Это ключ к тому, чтобы женщина смогла узнать себя настоящую и вспомнила, кто она на самом деле.

Позже женщины писали мне после этой сказки со слезами. Их вскрывало от инсайтов.
А ещё спустя пару недель то самое платье чудом пришло ко мне.
И для меня это было не просто совпадение.
Это стало очень живым подтверждением:

когда женщина возвращает себе ценность,
вместе с этим она возвращает и разрешение получать.

Получать любовь.
Получать поддержку.
Получать деньги.
Получать красоту.
Получать дары мира.

Потому что пока внутри живёт обесценивание, женщина снова и снова выбирает крохи.
А когда она узнаёт себя, вспоминает свою ценность, вспоминает, что сама является даром, тогда и мир начинает отвечать иначе.`
  );

  await sendPhotoIfExists(chatId, [
    path.join(process.cwd(), "media", "proof.jpg"),
    path.join(process.cwd(), "media", "proof1.jpg"),
    path.join(process.cwd(), "media", "proof-1.jpg"),
  ]);

  await sendMessage(
    chatId,
    `Жизнь после кризиса

N пришла ко мне после аборта в очень тяжёлом состоянии.
Её первые слова были: я потеряла радость жить.

Мы не будем вдаваться в подробности.
У N были свои причины сделать этот выбор, и в той ситуации она не могла прожить иначе.
Но после этого внутри неё осталось слишком много боли.
Вина.
Самобичевание.
Осуждение себя.
Ненависть к себе за то, что произошло.

Это было не просто тяжёлое состояние.
Как будто внутри включилась программа:
не жить.
Не радоваться.
Не чувствовать.
Не иметь права на лёгкость, удовольствие и будущее.

На сессии мы не пошли в сухой разбор.
Мы пошли глубже — в чувства, в тело, в ту часть N, которая осталась один на один с этой болью.
Это была глубокая терапевтическая работа.
Самое важное произошло тогда, когда вина перестала быть просто чувством и стала видна как наказание себя.

После сессии N написала мне, что вышла на улицу — и вдруг снова почувствовала вкус жизни.
Что внутри стало легче дышать.
Что ей впервые за долгое время захотелось жить, двигаться, чувствовать.

Она снова пошла на танцы.
И не просто энергия — сама Жизнь вернулась в неё.`
  );

  await sendPhotoIfExists(chatId, [
    path.join(process.cwd(), "media", "Proof2.jpg"),
    path.join(process.cwd(), "media", "proof2.jpg"),
    path.join(process.cwd(), "media", "proof 2.jpg"),
  ]);

  await sendPhotoIfExists(chatId, [
    path.join(process.cwd(), "media", "proof 2.1.jpg"),
    path.join(process.cwd(), "media", "proof2.1.jpg"),
    path.join(process.cwd(), "media", "proof-2.1.jpg"),
  ]);

  await sendMessage(
    chatId,
    `Как за 1 сессию выйти из травматичных отношений

N пришла ко мне с тем, что звучало как «не могу отпустить бывшего».
Но реальная проблема была в другом.

N слишком долго терпела и соглашалась на то, что ей не подходило.
Ради того, чтобы её выбрали, полюбили, ибо в детстве не хватило тепла.
Было много практик и терапий — но суть не менялась, N выбирала отношения, в которых всё больше теряла себя.

Головой N давно понимала, что так быть не должно. Понимала, что рядом с этим мужчиной она не расцветает, а сжимается. Что там нет любви, в которой можно расслабиться. И что возможно, это паттерн из прошлого.

N с трудом завершила эти отношения.
Но внутри связь всё равно оставалась. Мысли возвращались. Хотелось вернуться, исправить мужчину, измениться самой.

На личной сессии мы пошли глубже обычного разговора.
Это была терапевтическая работа, где я использовала в том числе сказкотерапию — чтобы дойти до того места, где вся эта история началась.

Именно там произошёл перелом.
После одной сессии тема бывшего ушла раз и навсегда.
N перестало тянуть назад.

А уже через месяц в её жизни начались новые отношения.
Совсем другого качества.
Именно те, которые мы простроили в терапии: с уважением, глубиной, близостью и ощущением, что рядом можно быть собой, выбранной и увиденной.`
  );

  await sendMessage(
    chatId,
    `МОИ СЕССИИ ЭТО
Бережное пространство поддержки, где:
— можно выдохнуть
— быть собой
— не «вывозить»
— получать помощь

В Замке Спокойствия мы каждую неделю встречаемся в Zoom.
Делимся состояниями, переживаниями, любыми запросами.
Я как терапевт помогаю мягко развернуть ситуацию и вернуть спокойствие и ресурс.

Если ты устала справляться в одиночку — попробуй быть не сильной, а живой.
Комната Спокойствия — здесь 👉 @soulteacher_english
Я рядом 🤍`
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

      if (text === "/faq") {
        await openFaq(chatId);
        return res.status(200).json({ ok: true, handled: "faq" });
      }

      if (text === "/cases") {
        await openCases(chatId);
        return res.status(200).json({ ok: true, handled: "cases" });
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