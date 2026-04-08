const db = require("../db");

async function createScheduledMessage({
  chatId,
  flow,
  step,
  payloadType,
  payloadKey,
  sendAt,
}) {
  const result = await db.query(
    `
    INSERT INTO scheduled_messages (
      telegram_chat_id,
      flow,
      step,
      payload_type,
      payload_key,
      send_at,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6, 'pending')
    RETURNING *;
    `,
    [chatId, flow, step, payloadType, payloadKey, sendAt]
  );

  return result.rows[0];
}

async function clearScheduledMessagesForFlow(chatId, flow) {
  await db.query(
    `
    DELETE FROM scheduled_messages
    WHERE telegram_chat_id = $1
      AND flow = $2
      AND status IN ('pending', 'processing')
    `,
    [chatId, flow]
  );
}

module.exports = {
  createScheduledMessage,
  clearScheduledMessagesForFlow,
};