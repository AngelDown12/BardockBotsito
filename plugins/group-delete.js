let handler = async (m, { conn, isAdmin, isBotAdmin }) => {
  if (!m.isGroup) return global.dfail('group', m, conn)
  if (!isAdmin) return global.dfail('admin', m, conn)
  if (!isBotAdmin) return global.dfail('botAdmin', m, conn)
  if (!m.quoted) return conn.reply(m.chat, '🚩 Responde al mensaje que deseas eliminar.', m, rcanal)

  try {
    const { id, fromMe, participant } = m.quoted.key
    const target = participant || m.quoted.participant || m.quoted.sender || m.quoted.key.remoteJid

    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: !!fromMe,
        id: id,
        participant: fromMe ? undefined : target
      }
    })

    // Opcional: Eliminar también el mensaje del comando .delete
    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: true,
        id: m.key.id,
        participant: m.sender
      }
    })

  } catch (e) {
    return conn.reply(m.chat, '❌ No se pudo eliminar el mensaje.\n🔧 Puede que ya haya sido eliminado o no tenga permisos.', m, rcanal)
  }
}

handler.help = ['delete']
handler.tags = ['group']
handler.command = /^del(ete)?$/i

export default handler