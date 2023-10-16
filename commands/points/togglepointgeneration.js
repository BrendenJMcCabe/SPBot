const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const { log } = require('console');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('pointson')
		.setDescription('MODS ONLY: toggle point generation on or off'),
	async execute(interaction, pointGen) {
		if(interaction.user.id != 150368570474364929){
			await interaction.reply(`You can't use this command.`);
			return;
		}
		var userlistString = await JSON.stringify(JSON.parse(fs.readFileSync('commands/points/userlist.json', 'utf-8')));
		var userlistJSON = await JSON.parse(userlistString);
		if(pointGen.on){
			pointGen.on = false;
			await interaction.reply("Ending point generation.")
			return;
		}
		pointGen.on = true;
		interaction.reply("Beginning point generation.");
		GrantPoints(interaction, userlistString, userlistJSON, pointGen);
	},
};
async function GrantPoints(interaction, userlistString, userlistJSON, pointGen) {
	userlistString = await JSON.stringify(JSON.parse(fs.readFileSync('commands/points/userlist.json', 'utf-8')));
	userlistJSON = await JSON.parse(userlistString);
	if(!pointGen.on){
		return;
	}
	for(entity in userlistJSON.users){
		guild = interaction.guild
		guild.members.cache = null;
		var mem;
		try{
			mem = await guild.members.fetch({user: userlistJSON.users[entity].name, cache: false, force: true});
			if(mem.voice.channelId && mem.voice.channelId != "269695173544378368"){
				userlistJSON.users[entity].points += 10;
			} 
		} catch(err){
			if (userlistJSON.users[entity].name != "1"){
				console.log(err);
			}
		}
	}
	userlistString = await JSON.stringify(userlistJSON);
	fs.writeFileSync('commands/points/userlist.json', userlistString, (err) => {
		if(err)
			console.log (err)
		else {
			console.log("User points updated successfully!");
		}
	});
	if(pointGen.on){
		setTimeout(function () {
			GrantPoints(interaction, userlistString, userlistJSON, pointGen)
		}, 5 * 60 * 1000);
	}
}
