import PhoneNumber from 'awesome-phonenumber';

let handler = async (m, { conn }) => {
  m.react('🔥');

  const imageUrl = 'https://files.catbox.moe/wwa311.jpg';
  const numCreador = '5215565238431';
  const ownerJid = numCreador + '@s.whatsapp.net';
  const name = await conn.getName(ownerJid) || 'Alee';
  const about = (await conn.fetchStatus(ownerJid).catch(() => {}))?.status || `𝐒𝐨𝐲 𝐂𝐫𝐢𝐬𝐭𝐢𝐚𝐧, 𝐃𝐮𝐞𝐧̃𝐨 𝐝𝐞𝐥 𝐁𝐨𝐭 𝐁𝐚𝐫𝐝𝐨𝐜𝐤 𝐁𝐨𝐭 🔥.`;
  const empresa = '𝐂𝐫𝐢𝐬𝐭𝐢𝐚𝐧 - 𝐒𝐞𝐫𝐯𝐢𝐜𝐢𝐨𝐬 𝐭𝐞𝐜𝐧𝐨𝐥𝐨𝐠𝐢𝐜𝐨𝐬';
  const instagramUrl = 'https://www.instagram.com/bki_hm66';

  const vcard = `
BEGIN:VCARD
VERSION:3.0
N:;${name};;;
FN:${name}
ORG:${empresa};
TITLE:CEO & Fundador
TEL;waid=${numCreador}:${new PhoneNumber('+' + numCreador).getNumber('international')}
EMAIL:correo@empresa.com
URL:${instagramUrl}
NOTE:${about}
ADR:;;Dirección de tu empresa;;;;
X-ABADR:ES
X-ABLabel:Dirección Web
X-ABLabel:Correo Electrónico
X-ABLabel:Teléfono de contacto
X-WA-BIZ-NAME:${name}
X-WA-BIZ-DESCRIPTION:${about}
END:VCARD`.trim();

  const textbot = '𝐁𝐚𝐫𝐝𝐨𝐜𝐤 𝐁𝐨𝐭 🔥';
  const dev = 'Cristian';

  await conn.sendMessage(
    m.chat,
    {
contextInfo: {
  externalAdReply: {
    title: '𝐁𝐚𝐫𝐝𝐨𝐜𝐤 𝐁𝐨𝐭 🔥',
    body: '𝐁𝐚𝐫𝐝𝐨𝐜𝐤 𝐁𝐨𝐭 🔥',
    mediaType: 1,
    thumbnailUrl: 'https://files.catbox.moe/wwa311.jpg',
    renderLargerThumbnail: false,
    sourceUrl: ''
  }
},

      contacts: {
        displayName: name,
        contacts: [{ vcard }]
      },
      contextInfo: {
        mentionedJid: [m.sender],
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
          newsletterJid: 'Alee'.id,
          newsletterName: 'Alee'.name,
          serverMessageId: -1,
        },
        externalAdReply: {
          title: textbot,
          body: dev,
          thumbnailUrl: imageUrl,
          sourceUrl: instagramUrl,
          mediaType: 1,
          showAdAttribution: true,
          renderLargerThumbnail: true,
        },
      }
    },
    { quoted: m }
  );
}

handler.help = ['owner'];
handler.tags = ['main'];
handler.command = ['owner', 'creator', 'creador', 'dueño'];

export default handler;