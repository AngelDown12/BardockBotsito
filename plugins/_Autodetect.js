import baileys from '@whiskeysockets/baileys';
const WAMessageStubType = baileys.default;

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.messageStubType || !m.isGroup) return;

  const chat = global.db.data.chats[m.chat];
  const usuario = participants.find(p => p.id === m.sender)?.name || `@${m.sender.split('@')[0]}`;
  const groupAdmins = participants.filter(p => p.admin).map(p => p.id);
  const pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => 'https://files.catbox.moe/xr2m6u.jpg');

  const fkontak = {
    key: {
      participants: "0@s.whatsapp.net",
      remoteJid: "status@broadcast",
      fromMe: false,
      id: "Halo"
    },
    message: {
      contactMessage: {
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
      }
    },
    participant: "0@s.whatsapp.net"
  };

  if (!chat.detect) return;

  if (m.messageStubType == 21) {
    await conn.sendMessage(m.chat, {
      text: `${usuario} \`𝐇𝐀 𝐂𝐀𝐌𝐁𝐈𝐀𝐃𝐎 𝐄𝐋 𝐍𝐎𝐌𝐁𝐑𝐄 𝐃𝐄𝐋 𝐆𝐑𝐔𝐏𝐎 𝐀:\`\n\n> *${m.messageStubParameters[0]}*`,
      mentions: [m.sender, ...groupAdmins]
    }, {
      quoted: fkontak,
      ephemeralExpiration: 24 * 60 * 100,
      disappearingMessagesInChat: 24 * 60 * 100
    });

  } else if (m.messageStubType == 22) {
    await conn.sendMessage(m.chat, {
      text: `${usuario} \`𝐂𝐀𝐌𝐁𝐈𝐎 𝐋𝐀 𝐅𝐎𝐓𝐎 𝐃𝐄𝐋 𝐆𝐑𝐔𝐏𝐎\``,
      mentions: [m.sender]
    }, {
      quoted: fkontak,
      ephemeralExpiration: 24 * 60 * 100,
      disappearingMessagesInChat: 24 * 60 * 100
    });

  } else if (m.messageStubType == 23) {
    await conn.sendMessage(m.chat, {
      text: `${usuario} 𝐑𝐄𝐄𝐒𝐓𝐀𝐁𝐋𝐄𝐂𝐈𝐎́ 𝐄𝐋 𝐄𝐍𝐋𝐀𝐂𝐄 𝐃𝐄𝐋 𝐆𝐑𝐔𝐏𝐎 🔗`,
      mentions: [m.sender]
    }, {
      quoted: fkontak,
      ephemeralExpiration: 24 * 60 * 100,
      disappearingMessagesInChat: 24 * 60 * 100
    });

  } else if (m.messageStubType == 24) {
    await conn.sendMessage(m.chat, {
      text: `${usuario} > 𝐍𝐔𝐄𝐕𝐀 𝐃𝐄𝐒𝐂𝐑𝐈𝐏𝐂𝐈𝐎́𝐍:\n\n${m.messageStubParameters[0] || 'Descripción no disponible'}`,
      mentions: [m.sender]
    }, {
      quoted: fkontak,
      ephemeralExpiration: 24 * 60 * 100,
      disappearingMessagesInChat: 24 * 60 * 100
    });

  } else if (m.messageStubType == 25) {
    await conn.sendMessage(m.chat, {
      text: `📌 𝐀𝐇𝐎𝐑𝐀 *${m.messageStubParameters[0] == 'on' ? '𝐒𝐎𝐋𝐎 𝐀𝐃𝐌𝐈𝐍𝐒' : '𝐓𝐎𝐃𝐎𝐒'}* 𝐏𝐔𝐄𝐃𝐄𝐍 𝐄𝐃𝐈𝐓𝐀𝐑 𝐋𝐀 𝐈𝐍𝐅𝐎 𝐃𝐄𝐋 𝐆𝐑𝐔𝐏𝐎`,
      mentions: [m.sender]
    }, {
      quoted: fkontak,
      ephemeralExpiration: 24 * 60 * 100,
      disappearingMessagesInChat: 24 * 60 * 100
    });

  } else if (m.messageStubType == 26) {
    await conn.sendMessage(m.chat, {
      text: `𝐆𝐑𝐔𝐏𝐎 *${m.messageStubParameters[0] == 'on' ? '𝐂𝐄𝐑𝐑𝐀𝐃𝐎 🔒' : '𝐀𝐁𝐈𝐄𝐑𝐓𝐎 🔓'}*\n${m.messageStubParameters[0] == 'on' ? '𝐒𝐎𝐋𝐎 𝐀𝐃𝐌𝐈𝐍𝐒 𝐏𝐔𝐄𝐃𝐄𝐍 𝐄𝐒𝐂𝐑𝐈𝐁𝐈𝐑' : '𝐘𝐀 𝐓𝐎𝐃𝐎𝐒 𝐏𝐔𝐄𝐃𝐄𝐍 𝐄𝐒𝐂𝐑𝐈𝐁𝐈𝐑'} 𝐄𝐍 𝐄𝐋 𝐆𝐑𝐔𝐏𝐎`,
      mentions: [m.sender]
    }, {
      quoted: fkontak,
      ephemeralExpiration: 24 * 60 * 100,
      disappearingMessagesInChat: 24 * 60 * 100
    });

  } else if (m.messageStubType == 29) {
    const nuevoAdmin = participants.find(p => p.id === m.messageStubParameters[0])?.name || `@${m.messageStubParameters[0].split('@')[0]}`;
    await conn.sendMessage(m.chat, {
      text: `@${m.messageStubParameters[0].split('@')[0]} 𝐀𝐇𝐎𝐑𝐀 𝐓𝐈𝐄𝐍𝐄 𝐏𝐎𝐃𝐄𝐑𝐄𝐒\n\n📌 𝐋𝐄 𝐎𝐓𝐎𝐑𝐆𝐎́ 𝐀𝐃𝐌𝐈𝐍 ${usuario}`,
      mentions: [m.sender, m.messageStubParameters[0], ...groupAdmins]
    }, {
      quoted: fkontak,
      ephemeralExpiration: 24 * 60 * 100,
      disappearingMessagesInChat: 24 * 60 * 100
    });

  } else if (m.messageStubType == 30) {
    await conn.sendMessage(m.chat, {
      text: `@${m.messageStubParameters[0].split('@')[0]} 𝐘𝐀 𝐍𝐎 𝐓𝐈𝐄𝐍𝐄 𝐏𝐎𝐃𝐄𝐑𝐄𝐒\n\n📌 𝐋𝐄 𝐐𝐔𝐈𝐓𝐎́ 𝐀𝐃𝐌𝐈𝐍 ${usuario}`,
      mentions: [m.sender, m.messageStubParameters[0], ...groupAdmins]
    }, {
      quoted: fkontak,
      ephemeralExpiration: 24 * 60 * 100,
      disappearingMessagesInChat: 24 * 60 * 100
    });

  } else if (m.messageStubType == 72) {
    await conn.sendMessage(m.chat, {
      text: `${usuario} 𝐂𝐀𝐌𝐁𝐈𝐎́ 𝐋𝐀 𝐃𝐔𝐑𝐀𝐂𝐈𝐎́𝐍 𝐃𝐄 𝐌𝐄𝐍𝐒𝐀𝐉𝐄𝐒 𝐄𝐅𝐈𝐌𝐄𝐑𝐎𝐒 𝐀 *@${m.messageStubParameters[0]}*`,
      mentions: [m.sender]
    }, {
      quoted: fkontak,
      ephemeralExpiration: 24 * 60 * 100,
      disappearingMessagesInChat: 24 * 60 * 100
    });

  } else if (m.messageStubType == 123) {
    await conn.sendMessage(m.chat, {
      text: `${usuario} 𝐃𝐄𝐒𝐀𝐂𝐓𝐈𝐕𝐎́ 𝐋𝐎𝐒 𝐌𝐄𝐍𝐒𝐀𝐉𝐄𝐒 𝐓𝐄𝐌𝐏𝐎𝐑𝐀𝐋𝐄𝐒.`,
      mentions: [m.sender]
    }, {
      quoted: fkontak,
      ephemeralExpiration: 24 * 60 * 100,
      disappearingMessagesInChat: 24 * 60 * 100
    });
  }
}