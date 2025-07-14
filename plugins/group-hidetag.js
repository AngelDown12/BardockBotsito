import { generateWAMessageFromContent } from '@whiskeysockets/baileys'
import * as fs from 'fs'

const handler = async (m, { conn, text, participants }) => {
  try {
    const users = participants.map(u => conn.decodeJid(u.id))
    const q = m.quoted ? m.quoted : m
    const c = m.quoted ? await m.getQuotedObj() : m

    const msg = conn.cMod(
      m.chat,
      generateWAMessageFromContent(
        m.chat,
        { [m.quoted ? q.mtype : 'extendedTextMessage']: m.quoted ? c.message[q.mtype] : { text: '' } },
        { quoted: m, userJid: conn.user.id }
      ),
      text || '',
      conn.user.jid,
      { mentions: users }
    )

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
  } catch {
    const users = participants.map(u => conn.decodeJid(u.id))
    const quoted = m.quoted ? m.quoted : m
    const mime = (quoted.msg || quoted).mimetype || ''
    const isMedia = /image|video|sticker|audio/.test(mime)
    const htextos = `${text ? text : ''}`

    if (isMedia && quoted.mtype === 'imageMessage' && htextos) {
      const media = await quoted.download?.()
      await conn.sendMessage(m.chat, { image: media, mentions: users, caption: htextos }, { quoted: m })
    } else if (isMedia && quoted.mtype === 'videoMessage' && htextos) {
      const media = await quoted.download?.()
      await conn.sendMessage(m.chat, { video: media, mentions: users, caption: htextos, mimetype: 'video/mp4' }, { quoted: m })
    } else if (isMedia && quoted.mtype === 'audioMessage' && htextos) {
      const media = await quoted.download?.()
      await conn.sendMessage(m.chat, { audio: media, mentions: users, mimetype: 'audio/mpeg', fileName: 'audio.mp3' }, { quoted: m })
    } else if (isMedia && quoted.mtype === 'stickerMessage') {
      const media = await quoted.download?.()
      await conn.sendMessage(m.chat, { sticker: media, mentions: users }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, {
        text: htextos,
        mentions: users
      }, { quoted: m })
    }
  }
}

handler.help = ['hidetag']
handler.tags = ['group']
handler.command = /^(hidetag|notify|notificar|noti|n|hidetah|hidet)$/i
handler.group = true
handler.admin = true

export default handler