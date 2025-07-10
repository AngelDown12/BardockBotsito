const handler = async (m, { conn, text, participants, isAdmin, isOwner, isBotAdmin }) => {
  if (!m.isGroup) return global.dfail('group', m, conn);
  if (!isAdmin && !isOwner) return global.dfail('admin', m, conn);
  if (!isBotAdmin) return global.dfail('botAdmin', m, conn);

  const users = participants.map(p => p.id);
  const contenido = text?.trim() || '';
  const firma = '> 𝐁𝐚𝐫𝐝𝐨𝐜𝐤 𝐁𝐨𝐭 🔥';
  const mensaje = contenido ? `${contenido}\n\n${firma}` : firma;
  const opciones = { mentions: users, quoted: m };

  if (m.quoted) {
    const quoted = m.quoted;
    const mime = quoted?.mimetype || '';
    const media = /image|video|audio|sticker/.test(mime) ? await quoted.download() : null;

    if (/sticker/.test(mime)) {
      return conn.sendMessage(m.chat, { sticker: media, ...opciones });
    } else if (/image/.test(mime)) {
      return conn.sendMessage(m.chat, { image: media, caption: mensaje, ...opciones });
    } else if (/video/.test(mime)) {
      return conn.sendMessage(m.chat, { video: media, caption: mensaje, mimetype: 'video/mp4', ...opciones });
    } else if (/audio/.test(mime)) {
      return conn.sendMessage(m.chat, { audio: media, mimetype: 'audio/mpeg', ptt: true, ...opciones });
    } else {
      const citado = quoted.text || quoted.body || mensaje;
      return conn.sendMessage(m.chat, { text: citado, ...opciones });
    }
  }

  return conn.sendMessage(m.chat, { text: mensaje, ...opciones });
};

// 🟡 Sin prefijo: solo al escribir "n", "noti", etc.
handler.customPrefix = /^(n|hidetag|notify|noti|notificar|todos)(\s+.*)?$/i;
handler.command = new RegExp(); // ← evita conflictos con .comandos
handler.group = true;

export default handler;