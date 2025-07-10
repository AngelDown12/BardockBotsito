const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

const handler = async (m, { conn, args }) => {
  const chatId = m.chat;
  const sender = m.sender;

  if (!chatId.endsWith("@g.us")) {
    return m.reply("⚠️ Este comando solo se puede usar en *grupos*.");
  }

  const group = await conn.groupMetadata(chatId);
  const isAdmin = group.participants.find(p => p.id === sender)?.admin;
  const isBot = conn.user?.id.split(":")[0] + "@s.whatsapp.net" === sender;

  if (!isAdmin && !isBot) {
    return m.reply("❌ Solo los administradores o el subbot pueden usar este comando.");
  }

  const mentions = group.participants.map(p => p.id);
  let content = null;
  const quoted = m.quoted;

  if (quoted) {
    const qMsg = quoted.message;
    const qType = Object.keys(qMsg || {})[0];
    const mime = quoted.mimetype || "";

    try {
      if (qType === "conversation" || qType === "extendedTextMessage") {
        content = { text: quoted.text };
      } else if (mime.startsWith("image")) {
        const stream = await downloadContentFromMessage(qMsg.imageMessage, "image");
        let buffer = Buffer.alloc(0);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        content = {
          image: buffer,
          caption: quoted.caption || "",
        };
      } else if (mime.startsWith("video")) {
        const stream = await downloadContentFromMessage(qMsg.videoMessage, "video");
        let buffer = Buffer.alloc(0);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        content = {
          video: buffer,
          caption: quoted.caption || "",
        };
      } else if (mime.startsWith("audio")) {
        const stream = await downloadContentFromMessage(qMsg.audioMessage, "audio");
        let buffer = Buffer.alloc(0);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        content = {
          audio: buffer,
          mimetype: mime,
          ptt: true
        };
      } else if (qType === "stickerMessage") {
        const stream = await downloadContentFromMessage(qMsg.stickerMessage, "sticker");
        let buffer = Buffer.alloc(0);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        content = { sticker: buffer };
      } else if (qType === "documentMessage") {
        const stream = await downloadContentFromMessage(qMsg.documentMessage, "document");
        let buffer = Buffer.alloc(0);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        content = {
          document: buffer,
          mimetype: mime,
          fileName: qMsg.documentMessage.fileName || "archivo"
        };
      }
    } catch (e) {
      return m.reply("❌ Error al procesar el mensaje citado.");
    }
  }

  if (!content && args.length > 0) {
    content = { text: args.join(" ") };
  }

  if (!content) {
    return m.reply("⚠️ Responde a un mensaje o escribe un texto para notificar.");
  }

  await conn.sendMessage(chatId, {
    ...content,
    mentions
  }, { quoted: m });
};

handler.help = ['hidetag'];
handler.tags = ['group'];
handler.command = /^(hidetag|notify|noti|notificar|n)$/i;
handler.group = true;

export default handler;