const handler = async (m, { conn, text, participants, isAdmin, isBotAdmin, isOwner }) => {
  if (!m.isGroup) return global.dfail('group', m, conn);
  if (!isAdmin && !isOwner) return global.dfail('admin', m, conn);
  if (!isBotAdmin) return global.dfail('botAdmin', m, conn);

  const users = participants.map(p => p.id);
  const commandUsed = m.text?.split(' ')[0] || '';
  const contenido = text?.replace(new RegExp(`^${commandUsed}\\s*`, 'i'), '').trim();
  const firma = '> Bardock Bot 🔥';
  const mensaje = contenido ? `${contenido}\n\n${firma}` : firma;
  const options = { mentions: users, quoted: m };

  if (m.quoted) {
    const quoted = m.quoted;
    const mime = (quoted.msg || quoted)?.mimetype || '';
    const isMedia = /image|video|audio|sticker/.test(mime);

    if (isMedia) {
      const media = await quoted.download();
      if (!media) return m.reply('❌ No se pudo descargar el contenido citado.');

      if (/image/.test(mime)) {
        return conn.sendMessage(m.chat, {
          image: media,
          caption: mensaje,
          ...options
        });
      }

      if (/video/.test(mime)) {
        return conn.sendMessage(m.chat, {
          video: media,
          caption: mensaje,
          mimetype: 'video/mp4',
          ...options
        });
      }

      if (/audio/.test(mime)) {
        return conn.sendMessage(m.chat, {
          audio: media,
          mimetype: 'audio/mpeg',
          ptt: true,
          ...options
        });
      }

      if (/sticker/.test(mime)) {
        await conn.sendMessage(m.chat, { sticker: media, ...options });
        return conn.sendMessage(m.chat, { text: mensaje, ...options });
      }
    } else {
      const citado = quoted.text || quoted.body || '';
      return conn.sendMessage(m.chat, {
        text: `${citado}\n\n${firma}`,
        ...options
      });
    }
  }

  return conn.sendMessage(m.chat, { text: mensaje, ...options });
};

handler.help = ['hidetag'];
handler.tags = ['group'];
handler.command = /^(hidetag|notify|noti|notificar|n)$/i;
handler.group = true;

export default handler;