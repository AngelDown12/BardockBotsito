const fs = require("fs");
const path = require("path");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

const handler = async (m, { conn, args }) => {
  const rawID = conn.user?.id || "";
  const subbotID = rawID.split(":")[0] + "@s.whatsapp.net";

  const prefixPath = path.resolve("prefixes.json");
  let prefixes = {};
  if (fs.existsSync(prefixPath)) {
    prefixes = JSON.parse(fs.readFileSync(prefixPath, "utf-8"));
  }
  const usedPrefix = prefixes[subbotID] || ".";

  const chatId = m.chat;
  const sender = m.sender;
  const senderNum = sender.replace(/[^0-9]/g, "");
  const botNumber = conn.user?.id.split(":")[0].replace(/[^0-9]/g, "");

  if (!chatId.endsWith("@g.us")) {
    return m.reply("⚠️ Este comando solo se puede usar en *grupos*.");
  }

  const groupMetadata = await conn.groupMetadata(chatId);
  const participant = groupMetadata.participants.find(p => p.id === sender);
  const isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";
  const isBot = botNumber === senderNum;

  if (!isAdmin && !isBot) {
    return m.reply("❌ Solo los administradores del grupo o el subbot pueden usar este comando.");
  }

  const allMentions = groupMetadata.participants.map(p => p.id);
  let contentToSend = null;

  const quoted = m.quoted;
  if (quoted) {
    const type = Object.keys(quoted.message)[0];
    const mime = quoted.mimetype || "";

    try {
      if (type === "conversation" || type === "extendedTextMessage") {
        contentToSend = { text: quoted.text };
      } else if (mime.startsWith("image")) {
        const stream = await downloadContentFromMessage(quoted.message.imageMessage, "image");
        let buffer = Buffer.alloc(0);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        contentToSend = { image: buffer, caption: quoted.caption || "" };
      } else if (mime.startsWith("video")) {
        const stream = await downloadContentFromMessage(quoted.message.videoMessage, "video");
        let buffer = Buffer.alloc(0);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        contentToSend = { video: buffer, caption: quoted.caption || "" };
      } else if (mime.startsWith("audio")) {
        const stream = await downloadContentFromMessage(quoted.message.audioMessage, "audio");
        let buffer = Buffer.alloc(0);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        contentToSend = { audio: buffer, mimetype: mime, ptt: true };
      } else if (type === "stickerMessage") {
        const stream = await downloadContentFromMessage(quoted.message.stickerMessage, "sticker");
        let buffer = Buffer.alloc(0);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        contentToSend = { sticker: buffer };
      } else if (mime.startsWith("application") || type === "documentMessage") {
        const stream = await downloadContentFromMessage(quoted.message.documentMessage, "document");
        let buffer = Buffer.alloc(0);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
        contentToSend = {
          document: buffer,
          mimetype: mime,
          fileName: quoted.message.documentMessage.fileName || "archivo"
        };
      }
    } catch (e) {
      return m.reply("❌ Ocurrió un error al descargar el archivo.");
    }
  }

  if (!contentToSend && args.length > 0) {
    contentToSend = { text: args.join(" ") };
  }

  if (!contentToSend) {
    return m.reply(`⚠️ Debes responder a un mensaje o escribir un texto después del comando.\n\nEjemplo: *${usedPrefix}n Hola a todos!*`);
  }

  await conn.sendMessage(chatId, {
    ...contentToSend,
    mentions: allMentions
  }, { quoted: m });
};

handler.command = ["n"];
module.exports = handler;