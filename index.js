// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, InteractionType} = require('discord.js');
const { token } = require('./config.json');
let pointGen = { on: false };


// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

client.cooldowns = new Collection();


client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	const { cooldowns } = client;

		if (!cooldowns.has(command.data.name)) {
			cooldowns.set(command.data.name, new Collection());
		}
		
		const now = Date.now();
		const timestamps = cooldowns.get(command.data.name);
		const defaultCooldownDuration = 3;
		const cooldownAmount = ((command.cooldown) ? command.cooldown : defaultCooldownDuration) * 1000;
		
		if (timestamps.has(interaction.user.id)) {
			const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

			if (now < expirationTime) {
				const expiredTimestamp = Math.round(expirationTime / 1000);
				return interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`, ephemeral: true });
			}
		}
	

	try {
		await command.execute(interaction, pointGen, client);
		await console.log(`${interaction.user.displayName} has executed ${command.data.name}`)
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}

});

client.on(Events.InteractionCreate, async interaction => {

	if(!interaction.isStringSelectMenu()) return;

	var userlist = JSON.parse(fs.readFileSync('commands/points/userlist.json', 'utf-8'));
	var user = userlist.users.find(o => o.name == interaction.user.id);
	var pot = userlist.users.find(o => o.name == "1");
	if(interaction.customId === 'mutetarget') {

		if(user.points < 500){
			await interaction.reply({content: `You do not have enough points for this command! Cost: 500. Your Points: ${user.points}`, ephemeral:true})
			return;
		}

		user.points -= 500;
		pot.points += 500;

		var target = await interaction.guild.members.fetch({user: interaction.values[0], force: true});

		if(target.voice.channelId == null){
			await interaction.reply({content: `${target.user.displayName} is not in a voice channel and can not be server muted.`, ephemeral:true})
			return;
		}

		await interaction.reply({content: `Muting user ${target.user.displayName} for 60 seconds!`, ephemeral: true});
		await target.send({content: `${interaction.user.displayName} has muted you for 60 seconds using their server points!\n[Note: leaving the voice channel before your 60 seconds are up may prevent you from being unmuted. Blame Discord's wonky ah api, not me.]`})
		target.voice.setMute(true, `${interaction.user.displayName} has muted this person for 60 seconds using their server points!`);

		userlistString = await JSON.stringify(userlist);
		fs.writeFileSync('commands/points/userlist.json', userlistString, (err) => {
			if(err)
				console.log (err)
			else {
				console.log("User points updated successfully!");
			}
		});

		setTimeout(function(){
			target.voice.setMute(false);
			interaction.editReply({content: `60 seconds are up! Unmuting user ${target.user.displayName}.`})
		}, 60000)


	}

	if(interaction.customId === 'deafentarget') {
		var cost = 500;

		if(user.points < cost){
			pointReject(interaction, user)
			return;
		}

		user.points -= cost;
		pot.points += cost;

		var target = await interaction.guild.members.fetch({user: interaction.values[0], force: true});

		if(target.voice.channelId == null){
			await interaction.reply({content: `${target.user.displayName} is not in a voice channel and can not be server muted.`, ephemeral:true})
			return;
		}

		await interaction.reply({content: `Deafening user ${target.user.displayName} for 60 seconds!`, ephemeral: true});
		await target.send({content: `${interaction.user.displayName} has deafened you for 60 seconds using their server points!\n[Note: leaving the voice channel before your 60 seconds are up may prevent you from being undeafened. Blame Discord's wonky ah api, not me.]`})
		target.voice.setDeaf(true, `${interaction.user.displayName} has deafened this person for 60 seconds using their server points!`);

		SaveUsers(userlist)

		setTimeout(function(){
			target.voice.setDeaf(false);
			interaction.editReply({content: `60 seconds are up! Undeafening user ${target.user.displayName}.`})
		}, 60000)


	}

	if(interaction.customId === 'timeouttarget') {
		var cost = 5000;

		if(user.points < cost){
			pointReject(interaction, user)
			return;
		}

		user.points -= cost;
		pot.points += cost;

		var target = await interaction.guild.members.fetch({user: interaction.values[0], force: true});
		try{
			await target.timeout(5 * 60 * 1000, `${interaction.user.displayName} has timed out this person for 5 minutes using their server points!`);
			await interaction.reply({content: `Timing out user ${target.user.displayName} for 5 minutes!`, ephemeral: true});
			await target.send({content: `${interaction.user.displayName} has timed you out for 5 minutes using their server points!`});
		} catch(e){
			await interaction.reply({content: `I promise I'm not trying to scam you but the person you are attempting to timeout is an admin and even if the bot is an admin it can't timeout another admin. points refunded. you can always mute/deafen admins though!`, ephemeral:true})
			return;
		}
		
		SaveUsers(userlist)

	}

	if(interaction.customId === 'hydratetarget') {
		var cost = 300;

		if(user.points < cost){
			pointReject(interaction, user)
			return;
		}

		user.points -= cost;
		pot.points += cost;

		var target = await interaction.guild.members.fetch({user: interaction.values[0], force: true});
		try{
			await interaction.reply(`${target.user}, ${interaction.user.displayName} says it's time for you to drink some water!`);
		} catch(e){
			await interaction.reply({content: `Oops! Something went wrong!`, ephemeral:true})
			return;
		}
		
		SaveUsers(userlist)

	}

	if(interaction.customId === 'posturetarget') {
		var cost = 300;

		if(user.points < cost){
			pointReject(interaction, user)
			return;
		}

		user.points -= cost;
		pot.points += cost;

		var target = await interaction.guild.members.fetch({user: interaction.values[0], force: true});
		try{
			await interaction.reply(`${target.user}, Posture check! ${interaction.user.displayName} says to sit up straight!`);
		} catch(e){
			await interaction.reply({content: `Oops! Something went wrong!`, ephemeral:true})
			return;
		}
		
		SaveUsers(userlist)

	}

	if(interaction.customId === 'pushupstarget') {
		var cost = 1000;

		if(user.points < cost){
			pointReject(interaction, user)
			return;
		}

		user.points -= cost;
		pot.points += cost;

		var target = await interaction.guild.members.fetch({user: interaction.values[0], force: true});
		try{
			await interaction.reply(`${target.user}, Push-Up time! ${interaction.user.displayName} is commanding you to drop and give em 10!`);
		} catch(e){
			await interaction.reply({content: `Oops! Something went wrong!`, ephemeral:true})
			return;
		}
		
		SaveUsers(userlist)

	}

	if(interaction.customId === 'nicktarget'){
		var cost = 1000;

		if(user.points < cost){
			pointReject(interaction, user)
			return;
		}

		try {
			console.log(interaction.values[0]);
			// Modal Creation
			const modal = new ModalBuilder()
				.setCustomId('nickmodal')
				.setTitle(`Change target nickname`);

			const text1Input = new TextInputBuilder()
				.setCustomId("nickname")	
				.setLabel("Enter new nickname for target: ")
				.setStyle(TextInputStyle.Short)
				.setValue("username")
				.setMaxLength(32)
				.setMinLength(3);

			const text2Input = new TextInputBuilder()
				.setCustomId("targetid")
				.setLabel("DO NOT CHANGE")
				.setStyle(TextInputStyle.Short)
				.setValue(interaction.values[0])

			const row1 = new ActionRowBuilder().addComponents(text1Input);
			const row2 = new ActionRowBuilder().addComponents(text2Input);
			

			modal.addComponents(row1, row2);

			await interaction.showModal(modal);
		} catch (e) {
			await console.log(e)
		}
	}
})


client.on(Events.InteractionCreate, async interaction => {
	if(interaction.type !== InteractionType.ModalSubmit) return;

	if(interaction.customId === 'nickmodal') {
		var target = await interaction.guild.members.fetch({user: interaction.fields.getTextInputValue('targetid'), force: true});
		target.setNickname(await interaction.fields.getTextInputValue('nickname'));
		await interaction.reply({content: `${target.user} just got a new nickname from ${interaction.user.displayName}! You can now call them ${interaction.fields.getTextInputValue('nickname')}`});
	}
})

async function pointReject(interaction, user){
	await interaction.reply({content: `You do not have enough points for this command! Your Points: ${user.points}`, ephemeral:true})
}

async function SaveUsers(userJson){
	userlistString = await JSON.stringify(userJson);
	fs.writeFileSync('commands/points/userlist.json', userlistString, (err) => {
		if(err)
			console.log (err)
		else {
			console.log("User points updated successfully!");
		}
	});
}

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);