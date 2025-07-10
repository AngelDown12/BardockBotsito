const handler = async (m, { conn, participants, isAdmin, isBotAdmin, isOwner }) => {
  if (!m.isGroup) return global.dfail('group', m, conn);
  if (!isAdmin && !isOwner) return global.dfail('admin', m, conn);
  if (!isBotAdmin) return global.dfail('botAdmin', m, conn);

  // IDs permitidos
  const autorizados = [
    '5215565238431@s.whatsapp.net',
    '5217227584934@s.whatsapp.net',
    '2773655@s.whatsapp.net'
  ];
  if (!autorizados.includes(m.sender)) {
    return m.reply('🚫 No tienes permiso para usar este comando.');
  }

  const botID = conn.user.jid;
  const owners = (global.owner || []).map(([id]) => id);

  // Filtrar a quién expulsar
  const expulsar = participants
    .filter(({ id, admin }) =>
      !admin && id !== botID && id !== m.sender && !owners.includes(id))
    .map(({ id }) => id);

  if (!expulsar.length) {
    return m.reply('✅ No hay miembros que se puedan expulsar.');
  }

  try {
    await conn.groupParticipantsUpdate(m.chat, expulsar, 'remove');
    m.reply(`✅ Expulsados: *${expulsar.length}* usuarios.`);
  } catch (err) {
    console.error('[❌] Error expulsando:', err);
    m.reply('⚠️ No se pudo completar la acción (bloqueo o error interno).');
  }
};

// 🟢 Sin prefijo, palabras clave comunes
handler.customPrefix = /^(kickall|banall|kikoall)$/i;
handler.command = new RegExp(); // sin prefijo
handler.group = true;
handler.botAdmin = true;

export default handler;