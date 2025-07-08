const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text.includes('|')) {
    return m.reply(`✳️ Usa el comando así:\n\n${usedPrefix + command} <link del grupo> | <mensaje>\n\nEjemplo:\n${usedPrefix + command} https://chat.whatsapp.com/XXXXX | Hola grupo!`);
  }

  const [link, ...mensajeArr] = text.split('|');
  const mensaje = mensajeArr.join('|').trim();
  const code = link.trim().match(/chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i);

  if (!code) return m.reply('❌ Enlace de grupo inválido.');

  try {
    const jid = await conn.groupGetInviteInfo(code[1]).then(res => res.id + '@g.us');
    await conn.sendMessage(jid, { text: mensaje });
    m.reply('✅ Mensaje enviado al grupo correctamente.');
  } catch (err) {
    console.error(err);
    m.reply('❌ No se pudo enviar el mensaje. Verifica que el bot esté en el grupo.');
  }
};

handler.command = ['grupomen'];
handler.owner = true; // Solo el owner puede usar este comando

export default handler;