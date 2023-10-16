const { ActionRowBuilder, SlashCommandBuilder, ActionRow, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, Component, InteractionCollector } = require('discord.js');
const fs = require('fs');
const { log } = require('console');
const savingGambas = false //testing only.


module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('creategamba')
		.setDescription('Create a new bet for players to bid on!')
		.addStringOption(option => 
			option.setName('title')
				.setDescription('The title of the new prediction.')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('option1')
				.setDescription('First possible outcome of prediction.')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('option2')
				.setDescription('Second possible outcome of prediction.')
				.setRequired(true))	
		.addStringOption(option =>
			option.setName('option3')
				.setDescription('Third possible outcome of prediction.')
				.setRequired(false))
		.addStringOption(option =>
			option.setName('option4')
				.setDescription('Fourth possible outcome of prediction.')
				.setRequired(false))
		.addIntegerOption(option => 
			option.setName('timer')
				.setDescription('How long - in seconds - bids will be accepted.')
				.setRequired(false)),
	async execute(interaction, pointGen, client) {
		if(interaction.user.id != 150368570474364929){
			await interaction.reply(`You can't use this command.`);
			return;
		}
		
		//const interactionCollector = new InteractionCollector({client: client, options: [{channel: interaction.channel.id}]})


		// Saving Gamba
		if(savingGambas){
			var gambas = await JSON.parse(fs.readFileSync('commands/points/gambas.json', 'utf-8'));
			if(!gambas.servers.find(o => o.serverID == interaction.guild.id)){
				var newServer = {"serverID" : interaction.guild.id, "gambas" : []}
				gambas.servers[gambas.servers.length] = newServer;
			}
			var server = gambas.servers.find(o => o.serverID == interaction.guild.id)
			var gambaID = server.gambas.length;
			server.gambas[server.gambas.length] = addGamba(gambaID, interaction.options.getString("title"), interaction.options.getString("option1"), interaction.options.getString("option2"), interaction.options.getString("option3"), interaction.options.getString("option4"), 60);

			var gambasString = JSON.stringify(gambas);
			fs.writeFile('commands/points/gambas.json', gambasString, (err) => {
				if(err)
					console.log (err)
				else {
				}

			})
		}

		const opt1Button = new ButtonBuilder()
			.setCustomId('bid')
			.setLabel("Place Bid")
			.setStyle(ButtonStyle.Primary);

		const row1 = new ActionRowBuilder()
			.addComponents([opt1Button]);

		const gambaEmbed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle(`New Prediction: ${interaction.options.getString("title")}`)
			.setAuthor({name: `Gamba Author: ${interaction.user.username}`})
			.setDescription("Place your bets!")
			//.setThumbnail('./coins.jpg')
			.addFields(
				{ name: "Potential Outcomes", value: "Below are the possible outcomes of the prediction."},
				{ name: '\u200B', value: '\u200B'},
				{ name: 'Option 1', value: interaction.options.getString("option1")},
				{ name: 'Option 2', value: interaction.options.getString("option2")},
				{ name: interaction.options.getString("option3") ? 'Option 3' : '\u200B', value: interaction.options.getString("option3") ? interaction.options.getString("option3") : '\u200B'},
				{ name: interaction.options.getString("option4") ? 'Option 4' : '\u200B', value: interaction.options.getString("option4") ? interaction.options.getString("option4") : '\u200B'}
			)
			.setTimestamp()
			.setFooter({text: 'Server Points command message.'});
			
		const response = await interaction.reply({ embeds: [gambaEmbed] , components: [row1]});
		
		try {
			const confirmation = await response.awaitMessageComponent({ time: (interaction.options.getString("timer") ? interaction.options.getString("timer") * 1000 : 60000) });
			
			if(confirmation.customId == 'bid'){
				// Modal Creation
				const modal = new ModalBuilder()
					.setCustomId('gambamodal')
					.setTitle('Enter your bid');

				const bid1Input = new TextInputBuilder()
					.setCustomId("opt1Txt")	
					.setLabel("Enter Amount for option 1: ")
					.setStyle(TextInputStyle.Short)
					.setValue("0");

				const bid2Input = new TextInputBuilder()
					.setCustomId("opt2Txt")	
					.setLabel("Enter Amount for option 2: ")
					.setStyle(TextInputStyle.Short)
					.setValue("0");

				const row1 = new ActionRowBuilder().addComponents(bid1Input);
				const row2 = new ActionRowBuilder().addComponents(bid2Input);

				modal.addComponents(row1, row2);

				await confirmation.showModal(modal);
			}
		} catch (e) {
			await interaction.editReply({ embeds: [gambaEmbed], content: 'Bids have been closed', components: [] });
		}
	},
};

function addGamba(ID, title, option1, option2, option3, option4, timer){
	var templateJSON = {
		"ID" : ID,
		"Title" : title,
		"Options" : [option1, option2, option3, option4],
		"Timer" : timer,
		"Bids" : ""
	}

	return templateJSON;
}