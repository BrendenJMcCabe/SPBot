const { ActionRowBuilder, SlashCommandBuilder, ActionRow, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, Component, InteractionCollector, UserInputBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const fs = require('fs');
const { log } = require('console');


module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('redeem')
		.setDescription('Redeem your points on various rewards!'),
	async execute(interaction, pointGen, client) {
		
		var userlist = JSON.parse(fs.readFileSync('commands/points/userlist.json', 'utf-8'));

		const opt1Button = new ButtonBuilder()
			.setCustomId('mute')
			.setLabel("Mute a User")
			.setStyle(ButtonStyle.Primary);

		const opt2Button = new ButtonBuilder()
			.setCustomId('deafen')
			.setLabel("Deafen a User")
			.setStyle(ButtonStyle.Primary);

		const opt3Button = new ButtonBuilder()
			.setCustomId('timeout')
			.setLabel("Timeout a User")
			.setStyle(ButtonStyle.Primary);

		const opt4Button = new ButtonBuilder()
			.setCustomId('hydrate')
			.setLabel("Hydrate")
			.setStyle(ButtonStyle.Primary);

		const opt5Button = new ButtonBuilder()
			.setCustomId('posture')
			.setLabel("Posture Check")
			.setStyle(ButtonStyle.Primary);

		const opt6Button = new ButtonBuilder()
			.setCustomId('pushups')
			.setLabel("Push-Ups")
			.setStyle(ButtonStyle.Primary);

		const row1 = new ActionRowBuilder()
			.addComponents([opt1Button, opt2Button, opt3Button]);

		const row2 = new ActionRowBuilder()
			.addComponents([opt4Button, opt5Button, opt6Button]);

		var user = userlist.users.find(o => o.name == interaction.user.id);

		if(!user){
			interaction.reply({content: `No user profile found. Please use the /createprofile command to get started`, ephemeral:true});
			return;
		}

		const response = await interaction.reply({ content: `>>> Select a reward to redeem.\n**Points: ${user.points}**` , components: [row1, row2], ephemeral: true});
		try {
			const redemption = await response.awaitMessageComponent({ time: (interaction.options.getString("timer") ? interaction.options.getString("timer") * 1000 : 60000) });
			
			if(redemption.customId == 'mute'){
				await interaction.editReply({ content: `**Points: ${user.points}**\nReward chosen. Processing request...`, components: [] });

				const menuRow = new ActionRowBuilder()
					.addComponents(await UsersWithPointsSelector(interaction, "mutetarget"));

				await redemption.reply({content: `>>> Cost: 500 Points \nChoose a user to be server muted for 60 seconds!`, components: [menuRow], ephemeral: true});
				await interaction.editReply({ content: `**Points: ${user.points}**\nReward chosen.`, components: [] });
			}

			if(redemption.customId == 'deafen'){
				await interaction.editReply({ content: `**Points: ${user.points}**\nReward chosen. Processing request...`, components: [] });

				const menuRow = new ActionRowBuilder()
					.addComponents(await UsersWithPointsSelector(interaction, "deafentarget"));

				await redemption.reply({content: `>>> Cost: 500 Points \nChoose a user to be server deafened for 60 seconds!`, components: [menuRow], ephemeral: true});
				await interaction.editReply({ content: `**Points: ${user.points}**\nReward chosen.`, components: [] });
			}
			if(redemption.customId == 'timeout'){
				await interaction.editReply({ content: `**Points: ${user.points}**\nReward chosen. Processing request...`, components: [] });

				const menuRow = new ActionRowBuilder()
					.addComponents(await UsersWithPointsSelector(interaction, "timeouttarget"));

				await redemption.reply({content: `>>> Cost: 5000 Points \nChoose a user to be Timed out for 5 minutes!`, components: [menuRow], ephemeral: true});
				await interaction.editReply({ content: `**Points: ${user.points}**\nReward chosen.`, components: [] });
			}

			if(redemption.customId == 'hydrate'){
				await interaction.editReply({ content: `**Points: ${user.points}**\nReward chosen. Processing request...`, components: [] });

				const menuRow = new ActionRowBuilder()
					.addComponents(await UsersWithPointsSelector(interaction, "hydratetarget"));

				await redemption.reply({content: `>>> Cost: 300 Points \nChoose a user to chug some water!`, components: [menuRow], ephemeral: true});
				await interaction.editReply({ content: `**Points: ${user.points}**\nReward chosen.`, components: [] });
			}

			if(redemption.customId == 'posture'){
				await interaction.editReply({ content: `**Points: ${user.points}**\nReward chosen. Processing request...`, components: [] });

				const menuRow = new ActionRowBuilder()
					.addComponents(await UsersWithPointsSelector(interaction, "posturetarget"));

				await redemption.reply({content: `>>> Cost: 300 Points \nChoose a user to make sure their posture is good!`, components: [menuRow], ephemeral: true});
				await interaction.editReply({ content: `**Points: ${user.points}**\nReward chosen.`, components: [] });
			}

			if(redemption.customId == 'pushups'){
				await interaction.editReply({ content: `**Points: ${user.points}**\nReward chosen. Processing request...`, components: [] });

				const menuRow = new ActionRowBuilder()
					.addComponents(await UsersWithPointsSelector(interaction, "pushupstarget"));

				await redemption.reply({content: `>>> Cost: 1000 Points \nChoose a user to do 10 push-ups!`, components: [menuRow], ephemeral: true});
				await interaction.editReply({ content: `**Points: ${user.points}**\nReward chosen.`, components: [] });
			}

		} catch (e) {
			await interaction.editReply({ content: 'No redemption chosen.', components: [] });
		}
	},
};


async function UsersWithPointsSelector(ir, str){
	//#region Make select menu with all users that have server point profiles.
	var userlist = await JSON.parse(fs.readFileSync('commands/points/userlist.json', 'utf-8'));

	const select = new StringSelectMenuBuilder()
					.setCustomId(str)
					.setPlaceholder('Choose your victim!')
	//console.log("Selection Menu created. Adding all valid users.");
	for(var obj of userlist.users) {
		if(obj.name != '1'){
			const menuUser = await ir.guild.members.fetch(obj.name);
			//console.log(`Attempting to add ${menuUser.user.displayName}`)
			let newSelection = new StringSelectMenuOptionBuilder()
			newSelection.setLabel((menuUser.nickname) ? menuUser.nickname : menuUser.user.displayName)
			newSelection.setValue(obj.name)
			select.addOptions(newSelection);				
		}
	};
	return select;
}