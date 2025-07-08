const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text || !text.includes('|')) {
    return m.reply(`✳️ Usa el comando así:\n\n${usedPrefix + command} <link del grupo> | <mensaje>\n\nEjemplo:\n${usedPrefix + command} https://chat.whatsapp.com/XXXXX | Hola grupo`);
  }

  const [link, ...mensajePartes] = text.split('|');
  const mensaje = mensajePartes.join('|').trim();
  const match = link.trim().match(/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i);

  if (!match) return m.reply('❌ El enlace del grupo no es válido.');

  const code = match[1];

  try {
    // Se une para obtener el ID (aunque ya esté dentro, no se unirá dos veces)
    const jid = await conn.groupAcceptInvite(code).catch(() => null); // si ya está, ignora error

    // Si ya estaba, usamos esta técnica para obtener el JID real
    const chats = await conn.groupFetchAllParticipating();
    const grupo = Object.values(chats).find(g => g.inviteCode === code);

    if (!grupo) return m.reply('❌ No se pudo encontrar el grupo. ¿Estás seguro de que el bot ya está dentro?');

    await conn.sendMessage(grupo.id, { text: mensaje });
    return m.reply(`✅ Mensaje enviado correctamente al grupo *${grupo.subject}*`);
  } catch (err) {
    console.error(err);
    return m.reply('❌ No se pudo enviar el mensaje. Puede que el grupo no exista o el bot no esté dentro.');
  }
};

handler.command = ['grupomen'];
handler.owner = true;

export default handler;