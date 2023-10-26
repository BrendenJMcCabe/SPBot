const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('redeemrules')
		.setDescription('View the rules associated with redeems!'),
	async execute(interaction) {

		const embed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle(`Rules of Point Redeems`)
			.setDescription(`Just to lay out ground rules to prevent exploits and potential arguments from occuring.`)
			.addFields(
				{ name: "Rule 1", value: "Targeted redemptions that are not handled automatically by the bot must be completed by the target within 1 hour of the redemption being posted and the user being aware of the redemption. \n\nPunishment is not currently defined though expect an extreme loss of points or possible terminaton of your Server Points profile."},
				{ name: 'Rule 2', value: 'Targeted redemptions that are not handled automatically are limited to 5 of each type per 12 hours. The bot will allow you to redeem more of the same type of redemption for the same target, but the target has no obligation to complete '},
				{ name: 'Rule 3', value: 'If a targeted redemption impacts your voice call (IE mute or deafen) the target must not change anything about their voice state including, joining a different voice channel, leaving the voice channel, or attempting to unmute or undeafen themselves.'},
				{ name: 'Rule 4', value: 'Anyone found dodging targeted redemptions that are handled automatically will be at risk of an extreme loss of points or a possible termination of their Server Points profile.'},
				{ name: 'Note', value: 'Ideas for point redemptions are welcome! I (@Khaljasper) am always accepting new recommendations in whatever way you can contact me.'},


			)	
			.setTimestamp()
		await interaction.reply({embeds: [embed], ephemeral: true});
	},
};