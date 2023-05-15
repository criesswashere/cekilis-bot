const { Client, EmbedBuilder } = require("discord.js");
const db = require("croxydb")

module.exports = {
  name: "çekiliş-bitir",
  description: "Bir çekilişi sona erdirirsin!",
  type: 1,
  options: [
    {
        name:"mesaj",
        description:"Çekiliş mesaj id girin!",
        type:3,
        required:true
    },
  ],
  run: async(client, interaction) => {
    const key = interaction.options.getString('mesaj')
    let data = db.fetch(`cekilis_${key}`)
    if (!data) return interaction.reply("Böyle bir çekiliş bulunamadı!")
    let mesajs = data.mesajid
    let mesaj = await interaction.channel.messages.fetch(mesajs)
    let kullanici = db.fetch(`user_${key}`)
    if (!kullanici) return interaction.reply("Yeterli katılımcı bulunamadı.")
    let kazanan = kullanici[
        Math.floor(Math.random() * kullanici.length)];
        let katılımcı = db.get(`user_${key}`).length;       
        const embed = new EmbedBuilder()
        .setTitle(data.odul)
       .setColor("#5865f2")
        .setTimestamp()
      .setDescription(`
    Sona Erdi: <t:${Math.floor(Date.now() /1000)}:R> (<t:${Math.floor(Date.now() /1000)}:f>)
    Düzenleyen: <@${data.hosted}>
    Kazanan: <@${kazanan}>
    Katılımcı: **${katılımcı}**`)
        mesaj.edit({embeds: [embed], components: []})
        interaction.reply({content: "Başarıyla çekiliş bitirildi.", ephemeral: true})
        db.set(`cekilis_${mesaj.id}`, data.odul);  
        db.delete(`cekilis_${interaction.channel.id}`);
        db.set(`son_${mesaj.id}`, true)
        interaction.channel.send("<@"+kazanan+"> Tebrikler **"+data.odul+"** Kazandın!")
  }
}
