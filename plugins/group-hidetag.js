const fs = require("fs");
const path = require("path");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");

const handler = async (msg, { conn, args }) => {
  const rawID = conn.user?.id || "";
  const subbotID = rawID.split(":")[0] + "@s.whatsapp.net";

  const prefixPath = path.resolve("prefixes.json");
  let prefixes = {};
  if (fs.existsSync(prefixPath)) {
    prefixes = JSON.parse(fs.readFileSync(prefixPath, "utf-8"));
  }
  const usedPrefix = prefixes[subbotID] || ".";

  const chatId = msg.key.remoteJid;
  const senderJid = msg.key.participant || msg.key.remoteJid;
  const senderNum = senderJid.replace(/[^0-9]/g, "");
  const botNumber = conn.user?.id.split(":")[0].replace(/[^0-9]/g, "");

  if (!chatId.endsWith("@g.us")) {
    return await conn.sendMessage(chatId, {
      text: "⚠️ Este comando solo se puede usar en grupos."
    }, { quoted: msg });
  }

  const groupMetadata = await conn.groupMetadata(chatId);
  const participant = groupMetadata.participants.find(p => p.id.includes(senderNum));
  const isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";
  const isBot = botNumber === senderNum;

  if (!isAdmin && !isBot) {
    return await conn.sendMessage(chatId, {
      text: "❌ Solo los administradores del grupo o el subbot pueden usar este comando."
    }, { quoted: msg });
  }

  const allMentions = groupMetadata.participants.map(p => p.id);
  let messageToForward = null;
  let hasMedia = false;

  const context = msg.message?.extendedTextMessage?.contextInfo || {};
  const quoted = context.quotedMessage || context.message || null;

  if (quoted) {
    const processMedia = async (streamPromise, mimetype, extra = {}) => {
      const stream = await streamPromise;
      let buffer = Buffer.alloc(0);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
      if (buffer.length > 10 * 1024 * 1024) {
        return await conn.sendMessage(chatId, {
          text: "⚠️ El archivo citado es demasiado grande para reenviarlo (máx. 10 MB)."
        }, { quoted: msg });
      }
      messageToForward = { ...extra, mimetype, ...extra.type === "audio" ? { ptt: true } : {}, buffer };
      return buffer;
    };

    if (quoted.conversation) {
      messageToForward = { text: quoted.conversation };
    } else if (quoted.extendedTextMessage?.text) {
      messageToForward = { text: quoted.extendedTextMessage.text };
    } else if (quoted.imageMessage) {
      const buffer = await processMedia(downloadContentFromMessage(quoted.imageMessage, "image"), quoted.imageMessage.mimetype || "image/jpeg", {
        image: true,
        caption: quoted.imageMessage.caption || ""
      });
      if (!buffer) return;
      hasMedia = true;
    } else if (quoted.videoMessage) {
      const buffer = await processMedia(downloadContentFromMessage(quoted.videoMessage, "video"), quoted.videoMessage.mimetype || "video/mp4", {
        video: true,
        caption: quoted.videoMessage.caption || ""
      });
      if (!buffer) return;
      hasMedia = true;
    } else if (quoted.audioMessage) {
      const buffer = await processMedia(downloadContentFromMessage(quoted.audioMessage, "audio"), quoted.audioMessage.mimetype || "audio/mp3", {
        audio: true
      });
      if (!buffer) return;
      hasMedia = true;
    } else if (quoted.stickerMessage) {
      const stream = await downloadContentFromMessage(quoted.stickerMessage, "sticker");
      let buffer = Buffer.alloc(0);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
      if (buffer.length > 10 * 1024 * 1024) {
        return await conn.sendMessage(chatId, {
          text: "⚠️ El sticker citado es demasiado grande para reenviarlo."
        }, { quoted: msg });
      }
      messageToForward = { sticker: buffer };
      hasMedia = true;
    } else if (quoted.documentMessage) {
      const buffer = await processMedia(downloadContentFromMessage(quoted.documentMessage, "document"), quoted.documentMessage.mimetype || "application/pdf", {
        document: true,
        caption: quoted.documentMessage.caption || ""
      });
      if (!buffer) return;
      hasMedia = true;
    }
  }

  if (!hasMedia && args.join(" ").trim().length > 0) {
    messageToForward = { text: args.join(" ") };
  }

  if (!messageToForward) {
    return await conn.sendMessage(chatId, {
      text: `⚠️ Usa este comando respondiendo a un mensaje *o* escribe un texto después del comando.\n\n📌 Ejemplo: ${usedPrefix}n Hola a todos!`
    }, { quoted: msg });
  }

  await conn.sendMessage(chatId, {
    ...messageToForward,
    mentions: allMentions
  }, { quoted: msg });

  console.log(`[NOTIFICAR] ${senderNum} usó el comando en ${chatId}`);
};

handler.customPrefix = /^(n|notificar)$/i;
handler.command = new RegExp;

module.exports = handler;