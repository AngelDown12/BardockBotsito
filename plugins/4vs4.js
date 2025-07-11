const handler = async (m, { conn, args, usedPrefix, command }) => {
  const chat = global.db.data.chats[m.chat];
  chat.equipo4vs4 = chat.equipo4vs4 || Array(4).fill('');
  chat.suplentes4vs4 = chat.suplentes4vs4 || Array(2).fill('');
  chat.horaMex4vs4 = chat.horaMex4vs4 || '';
  chat.modalidad4vs4 = chat.modalidad4vs4 || '';

  let equipo = chat.equipo4vs4;
  let suplentes = chat.suplentes4vs4;
  let horaMex = chat.horaMex4vs4;
  let modalidad = chat.modalidad4vs4;

  const calcularHoraCol = (horaMex) => {
    if (!horaMex) return 'Por definir';
    const [time, period] = horaMex.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    let hoursCol = hours + 1;
    if (hoursCol >= 24) hoursCol -= 24;
    if (horaMex.includes('AM') || horaMex.includes('PM')) {
      let periodCol = 'AM';
      if (hoursCol >= 12) {
        periodCol = 'PM';
        if (hoursCol > 12) hoursCol -= 12;
      }
      if (hoursCol === 0) hoursCol = 12;
      return `${hoursCol}:${minutes.toString().padStart(2, '0')} ${periodCol}`;
    } else {
      return `${hoursCol.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
  };

  const enviarLista = async () => {
    const horaColStr = horaMex ? calcularHoraCol(horaMex) : 'Por definir';
    const texto = `
──────⚔──────╮
┇➤ 4 𝐕𝐄𝐑𝐒𝐔𝐒 4
╰──────⚔──────╯

╭──────────────╮
┇➤ ⏱ 𝐇𝐎𝐑𝐀𝐑𝐈𝐎  
┇➤ 🇲🇽 𝐌𝐄𝐗 : ${horaMex || 'Por definir'}  
┇➤ 🇨🇴 𝐂𝐎𝐋 : ${horaColStr}  

┇➤ 𝐌𝐎𝐃𝐀𝐋𝐈𝐃𝐀𝐃: ${modalidad || 'Por definir'}  
┇➥ 𝗘𝗦𝗖𝗨𝗔𝗗𝗥𝗔:  
┇➥ 👨🏻‍💻 ➤ ${equipo[0] || ''}
┇➥ 👨🏻‍💻 ➤ ${equipo[1] || ''}  
┇➥ 👨🏻‍💻 ➤ ${equipo[2] || ''}
┇➥ 👨🏻‍💻 ➤ ${equipo[3] || ''}  

┇➥ ʚ 𝐒𝐔𝐏𝐋𝐄𝐍𝐓𝐄:  
┇➥ 👨🏻‍💼 ➤ ${suplentes[0] || ''}
┇➥ 👨🏻‍💼 ➤ ${suplentes[1] || ''}
╰─────────────╯

Comandos disponibles:
• ${usedPrefix}4vs4 anotar
• ${usedPrefix}4vs4 suplente
• ${usedPrefix}4vs4 limpiar`.trim();

    await conn.sendMessage(m.chat, { text: texto }, { quoted: m });
  };

  if (!args[0]) {
    const instrucciones = `
> ¿𝘊ó𝘮𝘰 𝘶𝘴𝘢𝘳 𝘦𝘭 𝘤𝘰𝘮𝘢𝘯𝘥𝘰?

▸ ${usedPrefix}4vs4 21:00 CLK
▸ ${usedPrefix}4vs4 9:00 PM CLK
▸ ${usedPrefix}4vs4 anotar
▸ ${usedPrefix}4vs4 suplente
▸ ${usedPrefix}4vs4 limpiar`.trim();
    await m.reply(instrucciones);
    return;
  }

  const nombre = '@' + (m.pushName || m.sender.split('@')[0]);

  if (args[0].toLowerCase() === 'anotar') {
    if (equipo.includes(nombre) || suplentes.includes(nombre)) {
      return await m.reply(`> *_${nombre}_* ya estás anotado. 🥖`);
    }
    const index = equipo.indexOf('');
    if (index !== -1) {
      equipo[index] = nombre;
      await m.reply(`> *_${nombre}_* anotado como jugador. 🥖`);
    } else {
      await m.reply(`> *_${nombre}_*, el equipo ya está lleno. ¿Quieres usar ${usedPrefix}4vs4 suplente? 🥖`);
    }
    await enviarLista();
    return;
  }

  if (args[0].toLowerCase() === 'suplente') {
    if (equipo.includes(nombre) || suplentes.includes(nombre)) {
      return await m.reply(`> *_${nombre}_* ya estás anotado. 🥖`);
    }
    const index = suplentes.indexOf('');
    if (index !== -1) {
      suplentes[index] = nombre;
      await m.reply(`> *_${nombre}_* anotado como suplente. 🥖`);
    } else {
      await m.reply(`> *_${nombre}_*, ya no hay lugares como suplente. 🥖`);
    }
    await enviarLista();
    return;
  }

  if (args[0].toLowerCase() === 'limpiar') {
    chat.equipo4vs4 = Array(4).fill('');
    chat.suplentes4vs4 = Array(2).fill('');
    chat.horaMex4vs4 = '';
    chat.modalidad4vs4 = '';
    await m.reply('✅ Lista borrada. Puedes empezar de nuevo.');
    await enviarLista();
    return;
  }

  // Establecer hora y modalidad
  if (args.length >= 2) {
    const timeArg = args[0];
    let horaTemp = timeArg;
    if (args[1] && ['AM', 'PM'].includes(args[1].toUpperCase())) {
      horaTemp += ' ' + args[1].toUpperCase();
      modalidad = args.slice(2).join(' ').toUpperCase();
    } else {
      modalidad = args.slice(1).join(' ').toUpperCase();
    }

    if (/(\d{1,2}:\d{2}|\d{1,2})\s*(AM|PM)?$/i.test(horaTemp)) {
      chat.horaMex4vs4 = horaTemp;
      chat.modalidad4vs4 = modalidad;
      await m.reply(`> ⏰ Hora: _${horaTemp}_\n> 🎮 Modalidad: _${modalidad}_`);
      await enviarLista();
    } else {
      await m.reply('❌ Hora inválida. Usa formato:\n- 9:00 PM\n- 21:00');
    }
    return;
  }
};

handler.command = /^4vs4$/i;
handler.help = ['4vs4 [hora] [modalidad]', '4vs4 anotar', '4vs4 suplente', '4vs4 limpiar'];
handler.tags = ['freefire'];
handler.group = true;

export default handler;