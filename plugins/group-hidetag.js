const handler = async (m, { conn, text, participants, isAdmin, isOwner, isBotAdmin }) => {
  if (!m.isGroup) return global.dfail('group', m, conn);
  if (!isAdmin && !isOwner) return global.dfail('admin', m, conn);
  if (!isBotAdmin) return global.dfail('botAdmin', m, conn);

  const users = participants.map(p => p.id);
  const contenido = text?.trim() || '';
  const firma = '> 𝐁𝐚𝐫𝐝𝐨𝐜𝐤 𝐁𝐨𝐭 🔥';
  const mensaje = contenido ? `${contenido}\n\n${firma}` : firma;
  const options = { mentions: users, quoted: m };

  if (m.quoted) {
    const quoted = m.quoted;
    const mime = quoted?.mimetype || '';
    const media = /image|video|audio|sticker/.test(mime) ? await quoted.download() : null;

    if (/sticker/.test(mime)) {
      return conn.sendMessage(m.chat, { sticker: media, ...options });
    } else if (/image/.test(mime)) {
      return conn.sendMessage(m.chat, { image: media, caption: mensaje, ...options });
    } else if (/video/.test(mime)) {
      return conn.sendMessage(m.chat, { video: media, caption: mensaje, mimetype: 'video/mp4', ...options });
    } else if (/audio/.test(mime)) {
      return conn.sendMessage(m.chat, { audio: media, mimetype: 'audio/mpeg', ptt: true, ...options });
    } else {
      const citado = quoted.text || quoted.body || mensaje;
      return conn.sendMessage(m.chat, { text: citado, ...options });
    }
  }

  return conn.sendMessage(m.chat, { text: mensaje, ...options });
};

// ✅ Soporte para comandos SIN prefijo
handler.customPrefix = /^(n|hidetag|notify|noti|notificar|todos)(\s+.*)?$/i;
handler.command = new RegExp(); // deja vacío para evitar conflictos
handler.group = true;
handler.register = true;

export default handler;