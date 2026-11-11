# 🐶 Caramelo Bot — Robux Edition v2.0

Bot Discord de loja com uma Game Pass individual por produto e comprovante em vídeo.

## Fluxo da compra
1. Admin cadastra produto com `/criarproduto`, preço em Robux e URL da Game Pass.
2. Admin publica a loja com `/produtos`.
3. Cliente clica em Comprar; o bot cria um pedido e envia o link da Game Pass.
4. Cliente compra no Roblox e envia vídeo com `/comprovante pedido_id video usuario_roblox`.
5. O bot encaminha o vídeo ao canal administrativo.
6. Admin verifica a compra diretamente no Roblox e usa `/aprovar pedido_id`.
7. O valor é registrado no `/saldo`.
8. Admin entrega o produto e usa `/entregar pedido_id`.

## Comandos
- `/configurarcanal canal:#canal`
- `/criarproduto nome robux descricao gamepass`
- `/produtos`
- `/comprovante pedido_id video usuario_roblox`
- `/aprovar pedido_id`
- `/saldo`
- `/pedidos`
- `/entregar pedido_id`

## Configuração
Requer Node.js 20+, bot Discord e hospedagem persistente.
1. Renomeie `.env.example` para `.env`.
2. Preencha `DISCORD_TOKEN`, `CLIENT_ID`, `GUILD_ID` e `ADMIN_IDS`.
3. Nunca compartilhe o token do bot.
4. Execute `npm install`, `npm run register` e `npm start`.
5. Convide o bot com escopos `bot` e `applications.commands`.
6. Configure o canal administrativo com `/configurarcanal`.

## Atenção
- O bot não consegue confirmar sozinho uma compra de Game Pass apenas pelo vídeo. O administrador deve verificar o histórico/recebimento na conta Roblox proprietária da Game Pass antes de aprovar.
- Vídeos são evidência auxiliar e podem ser editados; não aprove apenas com base no vídeo.
- Não solicite senhas, cookies, códigos de autenticação ou acesso à conta Roblox.
- O saldo é um registro interno de Robux aprovados, não uma carteira nem garantia de Robux recebidos. Robux de vendas de itens de experiência podem estar sujeitos a taxas, pendências e regras da Roblox.
- Confirme que a venda e a entrega do produto são permitidas pelas regras atuais da Roblox e do Discord. A transferência/venda de contas Roblox pode violar as regras da plataforma.
- O comando `/comprovante` aceita vídeos até 25 MB. O limite real de anexos do Discord pode variar conforme a conta/servidor.
