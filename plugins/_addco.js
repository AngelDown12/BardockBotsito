// plugins/addco.js
const fs = require("fs");
const path = require("path");

const handler = async (m, { conn, args }) => {
  const chatId = m.key.remoteJid;
  const isGroup = chatId.endsWith("@g.us");
  const senderId = m.key.participant || m.key.remoteJid;
  const senderNum = senderId.replace(/[^0-9]/g, "");
  const isOwner = global.owner?.some(([id]) => id === senderNum);
  const isFromMe = m.key.fromMe;

  // === Verificar permisos ===
  if (isGroup && !isOwner && !isFromMe) {
    // Solo admins, owner o bot pueden usarlo en grupos
    const metadata = await conn.groupMetadata(chatId).catch(() => null);
    if (!metadata) return;
    const participant = metadata.participants.find(p => p.id === senderId);
    const isAdmin = participant?.admin === "admin" || participant?.admin === "superadmin";
    if (!isAdmin) {
      return conn.sendMessage(chatId, { text: "🚫 *Solo admins, owner o el bot pueden usar este comando en grupos.*" }, { quoted: m });
    }
  } else if (!isGroup && !isOwner && !isFromMe) {
    // Solo owner o bot en chats privados
    return conn.sendMessage(chatId, { text: "🚫 *Solo el owner o el bot pueden usar este comando en privado.*" }, { quoted: m });
  }

  // === Validar que se responda a un sticker ===
  const quotedMsg = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  if (!quotedMsg || !quotedMsg.stickerMessage) {
    return conn.sendMessage(chatId, { text: "❌ *Por favor responde a un sticker para asignarle un comando.*" }, { quoted: m });
  }

  // === Validar que se pase un comando válido ===
  const comando = args.join(" ").trim();
  if (!comando) {
    return conn.sendMessage(chatId, { text: "⚠️ *Debes especificar el comando que quieres asignar al sticker. Ejemplo:* addco kick" }, { quoted: m });
  }

  // === Obtener el ID único del sticker (SHA256) ===
  const fileSha = quotedMsg.stickerMessage.fileSha256?.toString("base64");
  if (!fileSha) {
    return conn.sendMessage(chatId, { text: "❌ *No se pudo obtener el identificador único del sticker.*" }, { quoted: m });
  }

  // === Guardar comando en archivo JSON ===
  const jsonPath = path.resolve("./comandos.json");
  let data = {};
  if (fs.existsSync(jsonPath)) {
    try {
      data = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
    } catch {
      data = {};
    }
  }

  data[fileSha] = comando;

  try {
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
  } catch (error) {
    return conn.sendMessage(chatId, { text: "❌ *Error al guardar el comando. Intenta de nuevo más tarde.*" }, { quoted: m });
  }

  // === Confirmación con reacción y mensaje ===
  await conn.sendMessage(chatId, { react: { text: "✅", key: m.key } });

  return conn.sendMessage(chatId, {
    text: `✅ *Sticker vinculado correctamente al comando:* \`${comando}\``,
    quoted: m
  });
};

handler.command = ["addco"];
handler.tags = ["tools"];
handler.help = ["addco <comando>"];

module.exports = handler;