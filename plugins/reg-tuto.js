let handler = async (m, { conn }) => {
  const usuario = m.pushName || 'Usuario';
  const videoUrl = 'https://files.catbox.moe/wwa311.jpg';

  const texto = `Hola @${m.sender.split('@')[0]} aquí está el tutorial para hacerte subbot en 𝐁𝐚𝐫𝐝𝐨𝐜𝐤 𝐁𝐨𝐭 🔥.`;

  const options = {
    quoted: m,
    caption: texto,
    mentions: [m.sender]
  };

  await conn.sendMessage(m.chat, { video: { url: videoUrl }, ...options });
};

handler.command = ['tutosub']

export default handler;