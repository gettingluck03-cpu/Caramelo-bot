Caramelo Vendas — site independente (GitHub Pages + Firebase)
Arquivos: index.html (o site), firestore.rules (regras de segurança do banco).
1. Criar o projeto Firebase (grátis, plano Spark)
Acesse https://console.firebase.google.com → Adicionar projeto.
Build → Authentication → Começar → Google → ativar, escolher email de suporte, salvar.
Build → Firestore Database → Criar banco (modo produção, região southamerica-east1).
Aba Regras do Firestore → apague tudo, cole o conteúdo de firestore.rules → Publicar.
(O email do dono, henriquee3404@gmail.com, já está nas regras. Troque nos dois lugares se precisar.)
Configurações do projeto (engrenagem) → Seus apps → Web (</>) → registrar app → copie o firebaseConfig.
