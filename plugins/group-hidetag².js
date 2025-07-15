import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

const handler = async (m, { conn, participants }) => {
  // ✅ Verificamos que sea en grupo, que sea admin y que NO lo haya mandado el bot
  if (!m.isGroup) return
  if (m.key.fromMe) return // Evita ejecuciones múltiples
  const isAdmin = participants.some(p => p.id === m.sender && (p.admin || p.owner))
  if (!isAdmin) return

  const text = m.text || ''
  const caption = m.msg?.caption || ''
  const allContent = text + ' ' + caption // Unificamos texto + caption

  // ✅ Detectar si el mensaje (o caption) empieza con "n"
  if (!/^n(\s|$)/i.test(allContent.trim())) return

  try {
    const users = participants.map(u => conn.decodeJid(u.id))
    const hasQuoted = !!m.quoted
    const q = m.quoted ? m.quoted : m
    const c = m.quoted ? await m.getQuotedObj() : m
    const mime = (q.msg || q).mimetype || ''
    const isMedia = /image|video|sticker|audio/.test(mime)

    // ✅ Extraer texto limpio (sin la "n")
    const contentText = allContent.trim().slice(1).trim()
    const originalCaption = (q.msg?.caption || q.text || '').trim()
    const finalCaption = contentText || originalCaption || '📢 Notificación'

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
      // ✅ Si no citaste nada, solo manda texto limpio
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

// ✅ Solo sin prefijo, pero seguro
handler.customPrefix = /^n(\s|$)/i
handler.command = new RegExp
handler.group = true
handler.admin = true

export default handler