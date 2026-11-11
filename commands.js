const { SlashCommandBuilder, ChannelType } = require("discord.js");
module.exports = [
  new SlashCommandBuilder().setName("configurarcanal").setDescription("Define o canal de avisos administrativos.")
    .addChannelOption(o => o.setName("canal").setDescription("Canal de avisos").addChannelTypes(ChannelType.GuildText).setRequired(true)),
  new SlashCommandBuilder().setName("criarproduto").setDescription("Cadastra produto com Game Pass individual.")
    .addStringOption(o => o.setName("nome").setDescription("Nome do produto").setMaxLength(80).setRequired(true))
    .addIntegerOption(o => o.setName("robux").setDescription("Preço em Robux").setMinValue(1).setMaxValue(1000000).setRequired(true))
    .addStringOption(o => o.setName("descricao").setDescription("Descrição").setMaxLength(500).setRequired(true))
    .addStringOption(o => o.setName("gamepass").setDescription("URL da Game Pass deste produto").setMaxLength(300).setRequired(true)),
  new SlashCommandBuilder().setName("produtos").setDescription("Publica a loja neste canal."),
  new SlashCommandBuilder().setName("comprovante").setDescription("Envia o vídeo da compra da Game Pass.")
    .addStringOption(o => o.setName("pedido_id").setDescription("ID do pedido").setRequired(true))
    .addAttachmentOption(o => o.setName("video").setDescription("Vídeo mostrando a compra").setRequired(true))
    .addStringOption(o => o.setName("usuario_roblox").setDescription("Seu usuário Roblox").setMaxLength(20).setRequired(true)),
  new SlashCommandBuilder().setName("aprovar").setDescription("Aprova manualmente um pagamento após verificar a compra.")
    .addStringOption(o => o.setName("pedido_id").setDescription("ID do pedido").setRequired(true)),
  new SlashCommandBuilder().setName("saldo").setDescription("Mostra Robux aprovados e pedidos pendentes."),
  new SlashCommandBuilder().setName("pedidos").setDescription("Lista os pedidos recentes."),
  new SlashCommandBuilder().setName("entregar").setDescription("Marca um pedido aprovado como entregue.")
    .addStringOption(o => o.setName("pedido_id").setDescription("ID do pedido").setRequired(true))
].map(x => x.toJSON());
