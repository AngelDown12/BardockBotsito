let handler = async (m, { conn, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return global.dfail('group', m, conn)
  if (!isAdmin) return global.dfail('admin', m, conn)
  if (!isBotAdmin) return global.dfail('botAdmin', m, conn)
  if (!m.quoted) return conn.reply(m.chat, '🚩 Responde al mensaje que deseas eliminar.', m, rcanal)

  try {
    // Eliminar mensaje citado
    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: m.quoted.key.fromMe || false,
        id: m.quoted.key.id,
        participant: m.quoted.key.participant || m.quoted.participant || m.quoted.sender
      }
    })

    // Opcional: eliminar el mensaje del comando `.delete`
    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: true,
        id: m.key.id,
        participant: m.sender
      }
    })

  } catch (e) {
    conn.reply(m.chat, '❌ No se pudo eliminar el mensaje.', m, rcanal)
  }
}

handler.help = ['delete']
handler.tags = ['group']
handler.command = /^del(ete)?$/i

// ⚠️ NO pongas handler.admin = true, ya haces validaciones manuales
export default handler