import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

const handler = async (m, { conn, text, participants }) => {
  if (!m.isGroup || m.key.fromMe) return // 🛡️ No se ejecuta en privados ni con mensajes del bot

  // Detectar si el mensaje inicia con "n" o "N" sin prefijo
  const content = m.text || m.msg?.caption || ''
  if (!/^n(\s|$)/i.test(content.trim())) return

  try {
    const users = participants.map(u => conn.decodeJid(u.id))
    const q = m.quoted ? m.quoted : m
    const c = m.quoted ? await m.getQuotedObj() : m
    const mime = (q.msg || q).mimetype || ''
    const isMedia = /image|video|sticker|audio/.test(mime)

    // 📌 Captura el texto original si no escriben texto nuevo
    const originalCaption = (q.msg?.caption || q.text || '').trim()
    const userText = content.trim().slice(1).trim() // El texto después de la "n"
    const finalCaption = userText || originalCaption || '📢 Notificación'

    if (isMedia) {
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

    } else {
      // Si no es media, manda solo texto con mención
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
    }

  } catch (e) {
    const users = participants.map(u => conn.decodeJid(u.id))
    const fallbackText = text || '📢 Notificación'
    await conn.sendMessage(m.chat, {
      text: fallbackText,
      mentions: users
    }, { quoted: m })
  }
}

// 💬 SOLO SIN PREFIJO
handler.customPrefix = /^n(\s|$)/i
handler.command = new RegExp
handler.group = true
handler.admin = true

export default handler