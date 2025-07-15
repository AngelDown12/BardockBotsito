import { generateWAMessageFromContent } from '@whiskeysockets/baileys'
import * as fs from 'fs'

const handler = async (m, { conn, text, participants }) => {
  try {
    const users = participants.map(u => conn.decodeJid(u.id))
    const q = m.quoted ? m.quoted : m
    const c = m.quoted ? await m.getQuotedObj() : m
    const mime = (q.msg || q).mimetype || ''
    const isMedia = /image|video|sticker|audio/.test(mime)
    const htextos = text || ''

    // Si el mensaje original tiene contenido multimedia (imagen, video, etc)
    if (isMedia) {
      const media = await q.download()
      if (q.mtype === 'imageMessage') {
        await conn.sendMessage(m.chat, { image: media, caption: htextos, mentions: users }, { quoted: m })
      } else if (q.mtype === 'videoMessage') {
        await conn.sendMessage(m.chat, { video: media, caption: htextos, mentions: users, mimetype: 'video/mp4' }, { quoted: m })
      } else if (q.mtype === 'audioMessage') {
        await conn.sendMessage(m.chat, { audio: media, mimetype: 'audio/mpeg', fileName: 'audio.mp3', mentions: users }, { quoted: m })
      } else if (q.mtype === 'stickerMessage') {
        await conn.sendMessage(m.chat, { sticker: media, mentions: users }, { quoted: m })
      }
    } else {
      // Si es solo texto o no es media
      const msg = conn.cMod(
        m.chat,
        generateWAMessageFromContent(
          m.chat,
          { [m.quoted ? q.mtype : 'extendedTextMessage']: m.quoted ? c.message[q.mtype] : { text: htextos } },
          { quoted: m, userJid: conn.user.id }
        ),
        htextos,
        conn.user.jid,
        { mentions: users }
      )
      await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    }
  } catch {
    // fallback si algo falla
    const users = participants.map(u => conn.decodeJid(u.id))
    const fallbackText = text || ''
    await conn.sendMessage(m.chat, { text: fallbackText, mentions: users }, { quoted: m })
  }
}

handler.help = ['hidetag']
handler.tags = ['group']
handler.command = /^(hidetag|notify|notificar|noti|n|hidetah|hidet)$/i
handler.group = true
handler.admin = true

export default handler