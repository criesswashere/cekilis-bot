const { Client, EmbedBuilder, GatewayIntentBits, Partials, ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType } = require("discord.js");
const INTENTS = Object.values(GatewayIntentBits);
const PARTIALS = Object.values(Partials);
const ravendb = require("raven.database");
const db = require("croxydb")
const ms = require("ms")
const client = new Client({
    intents: INTENTS,
    allowedMentions: {
        parse: ["users"]
    },
    partials: PARTIALS,
    retryLimit: 3
});

global.client = client;
client.commands = (global.commands = []);

const { readdirSync } = require("fs")
const { TOKEN } = require("./config.json");

/* Slash Komutları Yüklüyoruz */

readdirSync('./commands').forEach(f => {
  if(!f.endsWith(".js")) return;

 const props = require(`./commands/${f}`);

 client.commands.push({
       name: props.name.toLowerCase(),
       description: props.description,
       options: props.options,
       dm_permission: props.dm_permission,
       type: 1
 });

console.log(`[COMMAND] ${props.name} komutu yüklendi.`)

});


/* Slash Komutları Yüklüyoruz */

/* Eventleri Yüklüyoruz */

readdirSync('./events').forEach(e => {

  const eve = require(`./events/${e}`);
  const name = e.split(".")[0];

  client.on(name, (...args) => {
            eve(client, ...args)
        });

console.log(`[EVENT] ${name} eventi yüklendi.`)

});


/* Eventleri Yüklüyoruz */

client.login(TOKEN).then(app => {
  console.log(`[BOT] Token girişi başarılı.`)
}).catch(app => {
  console.log(`[BOT] Token girşi başarısız.`)
})


const modal = new ModalBuilder()
.setCustomId('form')
.setTitle('Godzilla - Çekiliş Kurulum!')
  const a1 = new TextInputBuilder()
  .setCustomId('prize')
  .setLabel('Ödül')
  .setStyle(TextInputStyle.Paragraph) 
  .setMinLength(2)
  .setPlaceholder('Çekiliş Ödülü Ne Olacak?')
  .setRequired(true)
	const a2 = new TextInputBuilder() 
	.setCustomId('key')
	.setLabel('Key')
  .setStyle(TextInputStyle.Paragraph)  
	.setMinLength(1)
	.setPlaceholder('Çekilişin Anahtarı Ne Olacak? (Reroll, End)')
	.setRequired(true)
	const a3 = new TextInputBuilder() 
	.setCustomId('zaman')
	.setLabel('Süre')
  .setStyle(TextInputStyle.Paragraph)  
	.setMinLength(1)
	.setPlaceholder('1s/1m/1h/1d')
	.setRequired(true)
	
    const row = new ActionRowBuilder().addComponents(a1);
    const row3 = new ActionRowBuilder().addComponents(a3);
    modal.addComponents(row, row3);
  
   
client.on('interactionCreate', async (interaction) => {

	if (interaction.commandName ==="çekiliş-başlat") {    
    await interaction.showModal(modal);
	}
})
client.on('interactionCreate', async interaction => {
  if (interaction.type !== InteractionType.ModalSubmit) return;
  if (interaction.customId === 'form') {


const prize = interaction.fields.getTextInputValue("prize")
const time = interaction.fields.getTextInputValue('zaman')
let var1 = ms(time)
  
  let zaman = Date.now();

  let sure;
  let data
  try {
 data = ms(var1)
  } catch(err){
   interaction.reply("Girdiğin süre geçerli bir süre değil!")
  }
  if(data){
  let s = data.seconds;
  let m = data.minutes;
  let h = data.hours;
  let d = data.days;
  if (s) {
    sure = `${s} Seconds`;
  }
  if (m) {
    sure = `${m} Minutes`;
  }
  if (h) {
    sure = `${h} Hours`;
  }
  if (d) {
    sure = `${d} Days`;
  }
  let vars = await db.get(`cekilis.${interaction.guild.id}_${interaction.channel.id}`);
  if (!vars) {
    const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
      .setEmoji("🎉")
      .setCustomId("giveaway")
      .setStyle(ButtonStyle.Primary)
    )
    let embed = new EmbedBuilder()
      .setColor("#5865f2")
      .setTitle(prize)
      .setTimestamp()
.setDescription(`
Süre: <t:${Math.floor(Date.now()/1000) + Math.floor(var1/1000)}:R> (<t:${Math.floor(Date.now() /1000) + Math.floor(var1/1000)}:f>)
Düzenleyen: <@${interaction.user.id}>
Kazanan: 1
Katılımcı: **0**`);
interaction.reply({content: "Çekiliş Başarıyla Oluşturuldu.", ephemeral: true})
    interaction.channel.send({embeds: [embed], components: [row]}).then(mesaj => {
      db.set(`cekilis_${mesaj.id}`, interaction.user.id)
      db.push(`user_${mesaj.id}`, interaction.user.id)
       db.set(`reroll_${interaction.guild.id}`, { channelID: interaction.channel.id, messageID: mesaj.id })
      db.set(`cekilis_${interaction.channel.id}`, {
        kanalid: interaction.channel.id,
        mesajid: mesaj.id,
        hosted: interaction.user.id,
        sure: var1,
        zaman: zaman,
        toplam: 1,
        odul: prize,
        ex: Math.floor(Date.now()/1000) + Math.floor(var1/1000)
      });
      db.set(`cekilis_${mesaj.id}`, {
        kanalid: interaction.channel.id,
        mesajid: mesaj.id,
        hosted: interaction.user.id,
        sure: var1,
        zaman: zaman,
        toplam: 1,
        odul: prize,
        ex: Math.floor(Date.now()/1000) + Math.floor(var1/1000)
      });
    
    });
   

  }

  }
}

})
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;
  let message = await interaction.channel.messages.fetch(interaction.message.id)
  if (interaction.customId === 'giveaway') {
    const varmi = db.get(`user_${interaction.message.id}`)
    let data = db.get(`cekilis_${interaction.channel.id}`)
    if(!varmi) {
      let odul = data.odul
      let sure = data.ex
      let hosted = data.hosted
 
      db.push(`user_${interaction.message.id}`, interaction.user.id)
      interaction.reply({content: "Başarıyla çekilişe katıldın!", ephemeral: true})
      let katılımcı = db.get(`user_${interaction.message.id}`).length;

      const embed = new EmbedBuilder()
      .setTitle(odul)
      .setDescription(`
      Süre: <t:${sure}:R> (<t:${sure}:f>)
      Düzenleyen: <@${hosted}>
      Kazanan: 1
      Katılımcı: **${katılımcı}**`)
      .setColor("Blurple")
      message.edit({embeds: [embed]})
    } else if(varmi.includes(interaction.user.id)) {
         
      db.unpush(`user_${interaction.message.id}`, interaction.user.id)
      interaction.reply({ content: `Başarıyla çekilişten ayrıldın!` , ephemeral: true })
      let katılımcı = db.get(`user_${interaction.message.id}`).length;
      let odul = data.odul
      let sure = data.ex
      let hosted = data.hosted
      const embed = new EmbedBuilder()
      .setTitle(odul)
      .setDescription(`
      Süre: <t:${sure}:R> (<t:${sure}:f>)
      Düzenleyen: <@${hosted}>
      Kazanan: 1
      Katılımcı: **${katılımcı}**`)
      .setColor("Blurple")
      message.edit({embeds: [embed]})
    } else {
      let odul = data.odul
      let sure = data.ex
      let hosted = data.hosted
      db.push(`user_${interaction.message.id}`, interaction.user.id)
      interaction.reply({content: "Başarıyla çekilişe katıldın!", ephemeral: true})
      let katılımcı = db.get(`user_${interaction.message.id}`).length;
      const embed = new EmbedBuilder()
      .setTitle(odul)
      .setDescription(`
      Süre: <t:${sure}:R> (<t:${sure}:f>)
      Düzenleyen: <@${hosted}>
      Kazanan: 1
      Katılımcı: **${katılımcı}**`)
      .setColor("Blurple")
      message.edit({embeds: [embed]})
    }
}
})
client.on("ready", async () => {
  const moment = require("moment") 
  require("moment-duration-format")
  moment.locale("tr")
 setInterval(async () => {
   client.guilds.cache.map(async guild => {
     guild.channels.cache.map(async channel => {
       let datax = db.fetch(`cekilis_${channel.id}`);
      if (!datax) return;
        let mesaj = datax.mesajid
      
      let data = db.get(`cekilis_${mesaj}`)
       if (data) {
         let time = Date.now() - data.zaman;
         let sure = data.sure;

let kanal = guild.channels.cache.get(data.kanalid);
kanal.messages.fetch(data.mesajid).then(async mesaj => {
           })

        if (time >= sure) {
          let winner = [];
          let kazanan = db.get(`user_${mesaj}`)[
            Math.floor(Math.random() * db.get(`user_${mesaj}`).length)];
            if (!winner.map((winir) => winir).includes(kazanan)) winner.push(kazanan);
         
             
          
           
     
           kanal.messages.fetch(data.mesajid).then(async mesaj => {   
            let katılımcı = db.get(`user_${mesaj.id}`).length;       
             const embed = new EmbedBuilder()
               .setTitle(data.odul)
              .setColor("#5865f2")
               .setTimestamp()
             .setDescription(`
Sona Erdi: <t:${Math.floor(Date.now() /1000)}:R> (<t:${Math.floor(Date.now() /1000)}:f>)
Düzenleyen: <@${data.hosted}>
Kazanan: <@${winner}> 
Katılımcı: **${katılımcı}**`)
           mesaj.edit({embeds: [embed], components: []})  
    
            if(winner){
             db.set(`cekilis_${mesaj.id}`, data.odul);  
             db.delete(`cekilis_${channel.id}`);
            
             kanal.send(`Tebrikler <@${winner}> **${data.odul}** Kazandın!`)
           db.set(`son_${mesaj.id}`, true)
       
            } else {
              db.delete(`cekilis_${mesaj.id}`);  
              db.delete(`cekilis_${channel.id}`);                
               const embed = new EmbedBuilder()
               .setTitle(data.odul)
              .setColor("#5865f2")
             .setDescription(`
Sona Erdi: <t:${Math.floor(Date.now() /1000)}:R> (<t:${Math.floor(Date.now() /1000)}:f>)
Düzenleyen: <@${data.hosted}>
Kazanan: Bilinmiyor.
Katılımcı: **0**`) 
mesaj.edit({embeds: [embed], components: []})

         
            }
                   })                                           
                  }
         }
       })
       }
     );
   });
 }, 5000);
