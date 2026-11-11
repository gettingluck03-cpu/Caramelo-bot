require("dotenv").config();
const crypto = require("node:crypto");
const {
 Client, GatewayIntentBits, Events, EmbedBuilder, ActionRowBuilder,
 ButtonBuilder, ButtonStyle
} = require("discord.js");
const db = require("./db");

if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID || !process.env.GUILD_ID) {
 console.error("Configure DISCORD_TOKEN, CLIENT_ID e GUILD_ID no .env");
 process.exit(1);
}
const admins = new Set((process.env.ADMIN_IDS || "").split(",").map(x => x.trim()).filter(Boolean));
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const setting = k => db.prepare("SELECT value FROM settings WHERE key=?").get(k)?.value;
const setSetting = (k,v) => db.prepare("INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(k,v);
const isAdmin = id => admins.has(id);
const robux = n => `${Number(n).toLocaleString("pt-BR")} R$`;

function adminCheck(i) {
 if (isAdmin(i.user.id)) return true;
 i.reply({ content: "⛔ Comando exclusivo dos administradores.", ephemeral: true }).catch(()=>{});
 return false;
}
async function adminNotice(payload) {
 const id = setting("admin_channel");
 if (!id) return;
 try {
  const ch = await client.channels.fetch(id);
  if (ch?.isTextBased()) await ch.send(payload);
 } catch(e) { console.error("Falha ao avisar admins:", e.message); }
}
function validGamepassUrl(value) {
 try {
  const u = new URL(value);
  return u.protocol === "https:" && (u.hostname === "www.roblox.com" || u.hostname === "roblox.com");
 } catch { return false; }
}

client.once(Events.ClientReady, c => console.log(`🐶 Caramelo Bot online como ${c.user.tag}`));

client.on(Events.InteractionCreate, async i => {
 try {
  if (i.isChatInputCommand()) {
   const cmd = i.commandName;
   const adminCommands = ["configurarcanal","criarproduto","aprovar","saldo","pedidos","entregar"];
   if (adminCommands.includes(cmd) && !adminCheck(i)) return;

   if (cmd === "configurarcanal") {
    const ch = i.options.getChannel("canal", true);
    setSetting("admin_channel", ch.id);
    return i.reply({content:`✅ Canal administrativo definido: ${ch}`,ephemeral:true});
   }
   if (cmd === "criarproduto") {
    const name = i.options.getString("nome",true).trim();
    const price = i.options.getInteger("robux",true);
    const description = i.options.getString("descricao",true).trim();
    const url = i.options.getString("gamepass",true).trim();
    if (!validGamepassUrl(url) || !/\/game-pass\/\d+/i.test(new URL(url).pathname)) {
     return i.reply({content:"❌ Envie um link válido de Game Pass do Roblox, no formato roblox.com/game-pass/ID.",ephemeral:true});
    }
    const r = db.prepare("INSERT INTO products(name,description,price_robux,gamepass_url) VALUES(?,?,?,?)").run(name,price,description,url);
    return i.reply({content:`✅ Produto **${name}** cadastrado por **${robux(price)}**. Game Pass individual vinculada. ID: \`${r.lastInsertRowid}\``,ephemeral:true});
   }
   if (cmd === "produtos") {
    const products = db.prepare("SELECT * FROM products WHERE active=1 ORDER BY id DESC LIMIT 20").all();
    if (!products.length) return i.reply({content:"A loja ainda está vazia. Um admin pode usar `/criarproduto`.",ephemeral:true});
    await i.reply({content:"🐶 **Caramelo Vendas — Loja oficial**\nEscolha seu produto:",ephemeral:false});
    for (const p of products) {
     const embed = new EmbedBuilder().setColor(0xD99A45).setTitle(`🛒 ${p.name}`)
      .setDescription(p.description).addFields({name:"Preço",value:robux(p.price_robux)})
      .setFooter({text:`Produto #${p.id} • Game Pass individual`});
     const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`buy:${p.id}`).setLabel("Comprar").setEmoji("🐶").setStyle(ButtonStyle.Success)
     );
     await i.channel.send({embeds:[embed],components:[row]});
    }
    return;
   }
   if (cmd === "comprovante") {
    const orderId = i.options.getString("pedido_id",true).trim().toUpperCase();
    const attachment = i.options.getAttachment("video",true);
    const username = i.options.getString("usuario_roblox",true).trim();
    const order = db.prepare("SELECT * FROM orders WHERE id=?").get(orderId);
    if (!order || order.buyer_id !== i.user.id) return i.reply({content:"❌ Pedido não encontrado ou não pertence a você.",ephemeral:true});
    if (order.status !== "awaiting_proof" && order.status !== "proof_received") return i.reply({content:"Este pedido não está aguardando comprovante.",ephemeral:true});
    if (!attachment.contentType?.startsWith("video/")) return i.reply({content:"Envie um arquivo de vídeo. Não envie senhas, cookies ou dados privados.",ephemeral:true});
    if (attachment.size > 25 * 1024 * 1024) return i.reply({content:"O vídeo precisa ter até 25 MB. Você pode comprimir o vídeo antes de enviar.",ephemeral:true});
    db.prepare("UPDATE orders SET roblox_username=?, proof_url=?, status='proof_received' WHERE id=?")
      .run(username,attachment.url,orderId);
    const embed = new EmbedBuilder().setColor(0xF1C40F).setTitle("🎥 Novo comprovante de Game Pass")
      .setDescription("O cliente enviou um vídeo. Verifique a compra diretamente no Roblox antes de aprovar.")
      .addFields(
       {name:"Pedido",value:`\`${orderId}\``,inline:true},
       {name:"Produto",value:order.product_name,inline:true},
       {name:"Valor",value:robux(order.price_robux),inline:true},
       {name:"Cliente Discord",value:`<@${i.user.id}>`,inline:true},
       {name:"Usuário Roblox informado",value:username,inline:true},
       {name:"Vídeo",value:`[Assistir/baixar comprovante](${attachment.url})`}
      ).setTimestamp();
    await adminNotice({embeds:[embed]});
    return i.reply({content:"✅ Vídeo recebido! Seu pedido está aguardando a verificação de um administrador.",ephemeral:true});
   }
   if (cmd === "aprovar") {
    const id = i.options.getString("pedido_id",true).trim().toUpperCase();
    const order = db.prepare("SELECT * FROM orders WHERE id=?").get(id);
    if (!order) return i.reply({content:"Pedido não encontrado.",ephemeral:true});
    if (order.status !== "proof_received") return i.reply({content:"Este pedido ainda não tem vídeo enviado ou já foi processado.",ephemeral:true});
    db.prepare("UPDATE orders SET status='approved', approved_at=CURRENT_TIMESTAMP WHERE id=?").run(id);
    await i.reply({content:`✅ Pedido \`${id}\` aprovado. Foram registrados ${robux(order.price_robux)} no saldo de vendas.`,ephemeral:true});
    try {
     const user = await client.users.fetch(order.buyer_id);
     await user.send(`🐶 Seu pagamento do pedido \`${id}\` foi aprovado! O administrador vai providenciar a entrega.`);
    } catch {}
    return;
   }
   if (cmd === "saldo") {
    const s = db.prepare("SELECT COUNT(*) count, COALESCE(SUM(price_robux),0) total FROM orders WHERE status IN ('approved','delivered')").get();
    const pending = db.prepare("SELECT COUNT(*) count, COALESCE(SUM(price_robux),0) total FROM orders WHERE status IN ('awaiting_proof','proof_received')").get();
    const e = new EmbedBuilder().setColor(0x2ECC71).setTitle("🐶 Saldo de vendas — Caramelo")
     .setDescription(`**${robux(s.total)}** registrados como aprovados`)
     .addFields(
      {name:"Pedidos aprovados",value:String(s.count),inline:true},
      {name:"Aguardando verificação",value:`${pending.count} (${robux(pending.total)})`,inline:true}
     ).setFooter({text:"Relatório interno. Robux só são contabilizados após verificação manual."});
    return i.reply({embeds:[e],ephemeral:true});
   }
   if (cmd === "pedidos") {
    const rows = db.prepare("SELECT * FROM orders ORDER BY created_at DESC LIMIT 12").all();
    if (!rows.length) return i.reply({content:"Ainda não há pedidos.",ephemeral:true});
    return i.reply({content:"**📦 Pedidos recentes**\n"+rows.map(o=>`\`${o.id}\` • ${o.product_name} • ${robux(o.price_robux)} • **${o.status}**${o.delivered?" • entregue":""}`).join("\n"),ephemeral:true});
   }
   if (cmd === "entregar") {
    const id = i.options.getString("pedido_id",true).trim().toUpperCase();
    const o = db.prepare("SELECT * FROM orders WHERE id=?").get(id);
    if (!o) return i.reply({content:"Pedido não encontrado.",ephemeral:true});
    if (!["approved","delivered"].includes(o.status)) return i.reply({content:"O pagamento ainda não foi aprovado.",ephemeral:true});
    if (o.delivered) return i.reply({content:"Este pedido já foi marcado como entregue.",ephemeral:true});
    db.prepare("UPDATE orders SET delivered=1, status='delivered', delivered_at=CURRENT_TIMESTAMP WHERE id=?").run(id);
    return i.reply({content:`📦 Pedido \`${id}\` marcado como entregue.`,ephemeral:true});
   }
  }

  if (i.isButton() && i.customId.startsWith("buy:")) {
   const pid = Number(i.customId.split(":")[1]);
   const p = db.prepare("SELECT * FROM products WHERE id=? AND active=1").get(pid);
   if (!p) return i.reply({content:"Produto indisponível.",ephemeral:true});
   const orderId = crypto.randomUUID().slice(0,8).toUpperCase();
   db.prepare("INSERT INTO orders(id,product_id,product_name,price_robux,gamepass_url,buyer_id) VALUES(?,?,?,?,?,?)")
    .run(orderId,p.id,p.name,p.price_robux,p.gamepass_url,i.user.id);
   const embed = new EmbedBuilder().setColor(0xD99A45).setTitle("🐶 Finalize seu pedido")
    .setDescription(`**Produto:** ${p.name}\n**Preço:** ${robux(p.price_robux)}\n**Pedido:** \`${orderId}\`\n\n1. Abra a Game Pass abaixo e conclua a compra no Roblox.\n2. Grave um vídeo curto mostrando a confirmação da compra, sem exibir dados privados.\n3. Volte aqui e use \`/comprovante\` com o ID do pedido, seu usuário Roblox e o vídeo.\n4. Aguarde a verificação do administrador.`);
   const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setLabel("Abrir Game Pass").setStyle(ButtonStyle.Link).setURL(p.gamepass_url)
   );
   return i.reply({embeds:[embed],components:[row],ephemeral:true});
  }
 } catch(e) {
  console.error("Erro em interação:",e);
  const msg = "Ocorreu um erro. Tente novamente ou avise um administrador.";
  if (i.deferred || i.replied) await i.followUp({content:msg,ephemeral:true}).catch(()=>{});
  else await i.reply({content:msg,ephemeral:true}).catch(()=>{});
 }
});

client.login(process.env.DISCORD_TOKEN);
