// plugins/addco.js
const fs = require("fs");
const path = require("path");

const handler = async (m, { conn, args }) => {
  try {
    console.log("[addco] Comando recibido"); // debug

    const chatId = m.key.remoteJid;
    const from = m.key.participant || m.key.remoteJid;
    const isGroup = chatId.endsWith("@g.us");

    const senderNum = from.replace(/[^0-9]/g, "");
    const isOwner = global.owner?.some(([id]) => id === senderNum) || false;
    const isFromMe = m.key.fromMe;

    if (isGroup && !isOwner && !isFromMe) {
      const metadata = await conn.groupMetadata(chatId);
      const participant = metadata.participants.find(p => p.id === from);
      if (!participant || (participant.admin !== "admin" && participant.admin !== "superadmin")) {
        return await conn.sendMessage(chatId, { text: "🚫 Solo admins o owner pueden usar este comando." }, { quoted: m });
      }
    } else if (!isGroup && !isOwner && !isFromMe) {
      return await conn.sendMessage(chatId, { text: "🚫 Solo owner o bot pueden usar este comando en privado." }, { quoted: m });
    }

    // Validar sticker
    const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quoted || !quoted.stickerMessage) {
      return await conn.sendMessage(chatId, { text: "❌ Responde a un sticker para asignarle un comando." }, { quoted: m });
    }

    const comando = args.join(" ").trim();
    if (!comando) {
      return await conn.sendMessage(chatId, { text: "⚠️ Especifica el comando para asignar. Ejemplo: addco kick" }, { quoted: m });
    }

    const sha = quoted.stickerMessage.fileSha256?.toString("base64");
    if (!sha) {
      return await conn.sendMessage(chatId, { text: "❌ No se pudo obtener el identificador único del sticker." }, { quoted: m });
    }

    const filePath = path.resolve("./comandos.json");
    let db = {};
    if (fs.existsSync(filePath)) {
      try {
        db = JSON.parse(fs.readFileSync(filePath, "utf8"));
      } catch (e) {
        console.error("[addco] Error leyendo comandos.json:", e);
        db = {};
      }
    }

    db[sha] = comando;

    try {
      fs.writeFileSync(filePath, JSON.stringify(db, null, 2));
    } catch (e) {
      console.error("[addco] Error guardando comandos.json:", e);
      return await conn.sendMessage(chatId, { text: "❌ Error guardando el comando, intenta más tarde." }, { quoted: m });
    }

    await conn.sendMessage(chatId, { react: { text: "✅", key: m.key } });
    return await conn.sendMessage(chatId, { text: `✅ Sticker vinculado al comando: \`${comando}\``, quoted: m });
  } catch (err) {
    console.error("[addco] Error inesperado:", err);
    if (m?.key?.remoteJid) {
      await conn.sendMessage(m.key.remoteJid, { text: "❌ Ocurrió un error inesperado, revisa la consola." }, { quoted: m });
    }
  }
};

handler.command = ["addco"];
handler.tags = ["tools"];
handler.help = ["addco <comando>"];

module.exports = handler;