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
    const update = req.body;

    return res.status(200).json({
      ok: true,
      received: true,
      hasMessage: !!update?.message,
      hasCallbackQuery: !!update?.callback_query,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
};