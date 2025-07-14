q// plugins/addco.js
const fs = require("fs");
const path = require("path");

const handler = async (m, { conn, args }) => {
  const chatId = m.key.remoteJid;
  const from = m.key.participant || m.key.remoteJid;
  const isGroup = chatId.endsWith("@g.us");

  // Permisos: solo owner o admins en grupo
  const senderNum = from.replace(/[^0-9]/g, "");
  const isOwner = global.owner?.some(([id]) => id === senderNum) || false;
  const isFromMe = m.key.fromMe;

  if (isGroup && !isOwner && !isFromMe) {
    try {
      const metadata = await conn.groupMetadata(chatId);
      const participant = metadata.participants.find(p => p.id === from);
      if (!participant || (participant.admin !== "admin" && participant.admin !== "superadmin")) {
        return await conn.sendMessage(chatId, { text: "🚫 Solo admins o owner pueden usar este comando." }, { quoted: m });
      }
    } catch {
      return await conn.sendMessage(chatId, { text: "🚫 No se pudo verificar permisos de admin." }, { quoted: m });
    }
  } else if (!isGroup && !isOwner && !isFromMe) {
    return await conn.sendMessage(chatId, { text: "🚫 Solo owner o bot pueden usar este comando en privado." }, { quoted: m });
  }

  // Debe responder a sticker
  const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  if (!quoted || !quoted.stickerMessage) {
    return await conn.sendMessage(chatId, { text: "❌ Responde a un sticker para asignarle un comando." }, { quoted: m });
  }

  // Comando debe existir
  const comando = args.join(" ").trim();
  if (!comando) {
    return await conn.sendMessage(chatId, { text: "⚠️ Especifica el comando para asignar. Ejemplo: addco kick" }, { quoted: m });
  }

  // Obtener SHA256 del sticker
  const sha = quoted.stickerMessage.fileSha256?.toString("base64");
  if (!sha) {
    return await conn.sendMessage(chatId, { text: "❌ No se pudo obtener el identificador único del sticker." }, { quoted: m });
  }

  // Leer o crear archivo JSON
  const filePath = path.resolve("./comandos.json");
  let db = {};
  if (fs.existsSync(filePath)) {
    try {
      db = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (e) {
      db = {};
    }
  }

  // Guardar comando
  db[sha] = comando;

  try {
    fs.writeFileSync(filePath, JSON.stringify(db, null, 2));
  } catch {
    return await conn.sendMessage(chatId, { text: "❌ Error guardando el comando, intenta más tarde." }, { quoted: m });
  }

  // Confirmar con reacción y mensaje
  await conn.sendMessage(chatId, { react: { text: "✅", key: m.key } });
  return await conn.sendMessage(chatId, { text: `✅ Sticker vinculado al comando: \`${comando}\``, quoted: m });
};

handler.command = ["addco"];
handler.tags = ["tools"];
handler.help = ["addco <comando>"];

module.exports = handler;