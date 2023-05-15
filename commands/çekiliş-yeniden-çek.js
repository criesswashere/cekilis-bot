const { Client, EmbedBuilder } = require("discord.js");
const db = require("croxydb")

module.exports = {
  name: "çekiliş-yenile",
  description: "Bir çekilişi yeniden çekersin!",
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
    let data = db.get(`cekilis_${key}`)
    console.log(data)
    let mesajs = data.mesajid
    let sonaerdimi = db.fetch(`son_${key}`)
    if (!sonaerdimi) return interaction.reply("Bu çekiliş henüz sona ermemiş veya böyle bir çekiliş yok!")
    let kullanici = db.fetch(`user_${key}`)
    if (!kullanici) return interaction.reply("Yeterli katılımcı bulunamadı.")
    let kazanan = kullanici[
        Math.floor(Math.random() * kullanici.length)];
        interaction.reply({content: "Başarıyla çekiliş yeniden çekildi.", ephemeral: true})
        db.delete(`cekilis_${interaction.channel.id}`);
        interaction.channel.send("<@"+kazanan+"> Tebrikler **"+data+"** Kazandın!")

  }
}
