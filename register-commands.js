require("dotenv").config();
const { REST, Routes } = require("discord.js");
const commands = require("./commands");
(async () => {
  const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;
  if (!DISCORD_TOKEN || !CLIENT_ID || !GUILD_ID) throw new Error("Preencha DISCORD_TOKEN, CLIENT_ID e GUILD_ID no .env");
  await new REST({ version: "10" }).setToken(DISCORD_TOKEN)
    .put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
  console.log("Comandos do Caramelo Bot registrados!");
})().catch(e => { console.error(e); process.exit(1); });
