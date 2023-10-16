const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const { log } = require('console');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('points')
		.setDescription('See how many points you have!'),
	async execute(interaction) {
		var userlist = JSON.parse(fs.readFileSync('commands/points/userlist.json', 'utf-8'));
		var user = userlist.users.find(o => o.name == interaction.user.id);
		try{
			await interaction.reply({ content: `>>> ${interaction.user.username}, you have ${user.points} points!!`, ephemeral: true})
		} catch{
			await interaction.reply({ content: `>>> Profile not found. Use /createprofile to make a profile and start earning points!`, ephemeral: true});
		}
	},
};