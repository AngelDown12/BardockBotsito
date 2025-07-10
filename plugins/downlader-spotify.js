import fetch from 'node-fetch';

let handler = async (m, { conn, args, text }) => {
  if (!text) {
    return m.reply(
      `╭─⬣「 *bardock Ia* 」⬣
│ ≡◦ 🎧 *Uso correcto del comando:*
│ ≡◦ spotify shakira soltera
╰─⬣\n> © Bardock Ia`
    );
  }

  try {
    const res = await fetch(`https://api.nekorinn.my.id/downloader/spotifyplay?q=${encodeURIComponent(text)}`);
    const json = await res.json();

    if (!json.status || !json.result?.downloadUrl) {
      return m.reply(
        `╭─⬣「 *Barboza AI* 」⬣
│ ≡◦ ❌ *No se encontró resultado para:* ${text}
╰─⬣`
      );
    }

    const { title, artist, duration, cover, url } = json.result.metadata;
    const audio = json.result.downloadUrl;

    await conn.sendMessage(m.chat, {
      image: { url: cover },
      caption: `╭─⬣「 *MÚSICA SPOTIFY* 」⬣
│ ≡◦ 🎵 *Título:* ${title}
│ ≡◦ 👤 *Artista:* ${artist}
│ ≡◦ ⏱️ *Duración:* ${duration}
│ ≡◦ 🌐 *Spotify:* ${url}
╰─⬣`
    }, { quoted: m });

    await conn.sendMessage(m.chat, {
      audio: { url: audio },
      mimetype: 'audio/mp4',
      ptt: false,
      fileName: `${title}.mp3`
    }, { quoted: m });

  } catch (e) {
    console.error(e);
    return m.reply(
      `╭─⬣「 *Barboza AI* 」⬣
│ ≡◦ ⚠️ *Error al procesar la solicitud.*
│ ≡◦ Intenta nuevamente más tarde.
╰─⬣`
    );
  }
};

handler.help = ['spotify'];
handler.tags = ['descargas'];
handler.command = /^spotify$/i;
handler.register = true;

// ✅ Esto permite que funcione sin prefijo
handler.customPrefix = /^spotify\s+/i;
handler.explicit = true;

export default handler;