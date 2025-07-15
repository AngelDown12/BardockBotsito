import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

const handler = async (m, { conn, participants }) => {
  const body = m.text || ''
  if (!/^n(\s.*)?$/i.test(body)) return // Solo si inicia con "n"

  if (!m.isGroup) return
  const isAdmin = m.isGroup && (await conn.groupMetadata(m.chat)).participants.find(p => p.id === m.sender)?.admin
  if (!isAdmin) return

  try {
    const users = participants.map(u => conn.decodeJid(u.id))
    const hasQuoted = !!m.quoted
    const q = m.quoted ? m.quoted : m
    const c = m.quoted ? await m.getQuotedObj() : m
    const mime = (q.msg || q).mimetype || ''
    const isMedia = /image|video|sticker|audio/.test(mime)

    // ✅ Obtener texto después de la "n"
    const commandBody = body.trim().slice(1).trim()
    const originalCaption = (q.msg?.caption || q.text || '').trim()
    const finalCaption = commandBody || originalCaption || '📢 Notificación'

    if (hasQuoted && isMedia) {
      const media = await q.download()

      if (q.mtype === 'imageMessage') {
        await conn.sendMessage(m.chat, {
          image: media,
          caption: finalCaption,
          mentions: users
        }, { quoted: m })

      } else if (q.mtype === 'videoMessage') {
        await conn.sendMessage(m.chat, {
          video: media,
          caption: finalCaption,
          mentions: users,
          mimetype: 'video/mp4'
        }, { quoted: m })

      } else if (q.mtype === 'audioMessage') {
        await conn.sendMessage(m.chat, {
          audio: media,
          mimetype: 'audio/mpeg',
          fileName: 'audio.mp3',
          mentions: users
        }, { quoted: m })

      } else if (q.mtype === 'stickerMessage') {
        await conn.sendMessage(m.chat, {
          sticker: media,
          mentions: users
        }, { quoted: m })
      }

    } else if (hasQuoted) {
      // Reenviar texto citado con nuevo texto o el mismo
      const msg = conn.cMod(
        m.chat,
        generateWAMessageFromContent(
          m.chat,
          { [q.mtype || 'extendedTextMessage']: q.message?.[q.mtype] || { text: finalCaption } },
          { quoted: m, userJid: conn.user.id }
        ),
        finalCaption,
        conn.user.jid,
        { mentions: users }
      )
      await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

    } else {
      // Solo texto directo sin citar
      await conn.sendMessage(m.chat, {
        text: finalCaption,
        mentions: users
      }, { quoted: m })
    }

  } catch (e) {
    const users = participants.map(u => conn.decodeJid(u.id))
    await conn.sendMessage(m.chat, {
      text: '📢 Notificación',
      mentions: users
    }, { quoted: m })
  }
}

handler.customPrefix = /^n(\s.*)?$/i
handler.command = new RegExp
handler.group = true
handler.admin = true

export default handler