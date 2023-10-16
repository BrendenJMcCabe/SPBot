const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const { log } = require('console');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('createprofile')
		.setDescription('Creates a profile so you can start racking in points!'),
	async execute(interaction) {
		var userlist = JSON.parse(fs.readFileSync('commands/points/userlist.json', 'utf-8'));
		var userlistString = JSON.stringify(userlist);
		var userlistJSON = JSON.parse(userlistString);
		if(!userlist.users.find(o => o.name == interaction.user.id)){
			console.log("Making new profile");
			userlistJSON.users[userlistJSON.users.length] = { "name" : interaction.user.id, "points" : 300, "username" : interaction.user.displayName}
			userlistString = JSON.stringify(userlistJSON)
			fs.writeFile('commands/points/userlist.json', userlistString, (err) => {
				if(err)
					console.log (err)
				else {
					console.log(userlistJSON.users[userlistJSON.users.length-1].name + " saved successfully!");
				}

			});
		} else{
			await interaction.reply({ content: `>>> You've already made a profile dingus! user /points to see how many points you have.`, ephemeral: true});
			return;
		}
		await interaction.reply({ content: `>>> Profile created! ID: ${await interaction.guild.members.fetch(userlistJSON.users[userlistJSON.users.length - 1].name)}, Points: ${userlistJSON.users[userlistJSON.users.length - 1].points}`, ephemeral: true});
		
	},
};