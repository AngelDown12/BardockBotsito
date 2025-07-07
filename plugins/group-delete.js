let handler = async (m, { conn, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return global.dfail('group', m, conn)
  if (!isAdmin) return global.dfail('admin', m, conn)
  if (!isBotAdmin) return global.dfail('botAdmin', m, conn)
  if (!m.quoted) return conn.reply(m.chat, '🚩 Responde al mensaje que deseas eliminar.', m, rcanal)

  try {
    let key = m.quoted.key || m.quoted.vM?.key
    if (!key?.id || !key?.participant) throw false

    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: key.id,
        participant: key.participant
      }
    })
  } catch {
    try {
      await conn.sendMessage(m.chat, {
        delete: m.quoted.vM?.key || m.quoted.key
      })
    } catch {
      conn.reply(m.chat, '❌ No se pudo eliminar el mensaje.', m, rcanal)
    }
  }
}

handler.help = ['delete']
handler.tags = ['group']
handler.command = /^del(ete)?$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler