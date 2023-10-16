const { ActionRowBuilder, SlashCommandBuilder, ActionRow, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, Component, InteractionCollector } = require('discord.js');
const fs = require('fs');
const { log } = require('console');


module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('updateprofile')
		.setDescription('Owner only: Update profiles.'),
	async execute(interaction, pointGen, client) {
		if(interaction.user.id != 150368570474364929){
			await interaction.reply(`You can't use this command.`);
			return;
		}

		userlist = await JSON.parse(fs.readFileSync('commands/points/userlist.json', 'utf-8'));
		for(entity in userlist.users){
			try{
				var mem = await interaction.guild.members.fetch({user: userlist.users[entity].name, cache: false, force: true});
				userlist.users[entity].username = mem.user.displayName;
				console.log(userlist.users[entity]);
			} catch(err){
				if (userlist.users[entity].name != "1"){
					console.log(err);
				}
			}
		}

		userlistString = await JSON.stringify(userlist);
		fs.writeFileSync('commands/points/userlist.json', userlistString, (err) => {
			if(err)
				console.log (err)
			else {
				console.log("User points updated successfully!");
			}
		});

		await interaction.reply("Command executed.");
	}
};