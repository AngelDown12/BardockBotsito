import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

const handler = async (m, { conn, text, participants, isAdmin, isOwner }) => {
  if (!m.isGroup || !(isAdmin || isOwner)) return

  const body = m.text || ''
  if (!/^n(\s.*)?$/i.test(body)) return // Solo si empieza con "n"

  try {
    const users = participants.map(u => conn.decodeJid(u.id))
    const hasQuoted = !!m.quoted
    const q = m.quoted ? m.quoted : m
    const c = m.quoted ? await m.getQuotedObj() : m
    const mime = (q.msg || q).mimetype || ''
    const isMedia = /image|video|sticker|audio/.test(mime)

    const originalCaption = (q.msg?.caption || q.text || '').trim()
    const finalCaption = body.trim().slice(1).trim() || originalCaption

    // ✅ Si hay cita y es multimedia
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
      // ✅ Si hay cita pero no es media (texto)
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
      // ✅ Si no hay cita → solo manda texto
      await conn.sendMessage(m.chat, {
        text: finalCaption,
        mentions: users
      }, { quoted: m })
    }

  } catch (e) {
    const users = participants.map(u => conn.decodeJid(u.id))
    await conn.sendMessage(m.chat, {
      text: text || 'Notificación',
      mentions: users
    }, { quoted: m })
  }
}

handler.customPrefix = /^n(\s.*)?$/i
handler.command = new RegExp
handler.group = true
handler.admin = true
handler.disabled = false

export default handler