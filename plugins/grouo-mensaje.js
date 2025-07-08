const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text || !text.includes('|')) {
    return m.reply(`✳️ Usa el comando así:\n\n${usedPrefix + command} <link del grupo> | <mensaje>\n\nEjemplo:\n${usedPrefix + command} https://chat.whatsapp.com/XXXXX | Hola grupo`);
  }

  const [link, ...mensajePartes] = text.split('|');
  const mensaje = mensajePartes.join('|').trim();
  const match = link.trim().match(/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i);

  if (!match) return m.reply('❌ Enlace del grupo no válido.');

  const groupCode = match[1];

  try {
    const groupInfo = await conn.groupGetInviteInfo(groupCode);
    const groupJid = groupInfo.id + '@g.us';

    await conn.sendMessage(groupJid, { text: mensaje });
    return m.reply(`✅ Mensaje enviado correctamente al grupo *${groupInfo.subject}*`);
  } catch (err) {
    console.error(err);
    return m.reply('❌ No se pudo enviar el mensaje. Asegúrate de que el bot esté en el grupo y el enlace sea válido.');
  }
};

handler.command = ['grupomen'];
handler.owner = true; // Solo el dueño puede usarlo

export default handler;