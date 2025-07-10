const handler = async (m, { conn, text, participants, isAdmin, isBotAdmin, isOwner }) => {
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
    const mime = (quoted.msg || quoted)?.mimetype || '';
    const media = /image|video|sticker|audio/.test(mime) ? await quoted.download() : null;

    if (/image/.test(mime)) {
      return conn.sendMessage(m.chat, { image: media, caption: mensaje, ...options });
    } else if (/video/.test(mime)) {
      return conn.sendMessage(m.chat, { video: media, caption: mensaje, mimetype: 'video/mp4', ...options });
    } else if (/audio/.test(mime)) {
      return conn.sendMessage(m.chat, { audio: media, mimetype: 'audio/mpeg', ptt: true, ...options });
    } else if (/sticker/.test(mime)) {
      return conn.sendMessage(m.chat, { sticker: media, ...options });
    } else {
      const citado = quoted.text || quoted.body || mensaje;
      return conn.sendMessage(m.chat, { text: citado, ...options });
    }
  }

  return conn.sendMessage(m.chat, { text: mensaje, ...options });
};

// 🟢 Detecta texto que sea solo "n" o "notify", o con texto después
handler.customPrefix = /^(n|notify|noti|notificar|hidetag)(\s+.*)?$/i;
handler.command = new RegExp;
handler.group = true;
handler.register = true;

export default handler;