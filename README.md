🎮 Sistema: Mundo dos Amigos
 
1. 📌 VISÃO GERAL DO SISTEMA
O sistema Mundo dos Amigos é um jogo educacional acessível focado em:
• 
Crianças (especialmente TEA)
• 
Acessibilidade total (voz, vibração, foco, navegação teclado)
• 
Feedback multimodal (visual + sonoro + tátil)
• 
Persistência de dados local + Firebase
🔥 Tecnologias principais
Tecnologia
Uso
HTML5
Estrutura
CSS3
Estilização responsiva
JavaScript (Vanilla)
Lógica completa
Firebase Realtime DB
Persistência online
LocalStorage
Persistência local
Web Speech API
Narração
Vibration API
Feedback tátil
Audio API
Sons e música
Copiar tabela
 
2. 🧠 ARQUITETURA DO PROJETO
Copiar
mundo-dos-amigos/
│
├── index.html
├── game.html
├── end.html
├── highscores.html
│
├── css/
│   ├── app.css
│   ├── game.css
│   └── highscores.css
│
├── js/
│   ├── firebase.js
│   ├── game.js
│   ├── end.js
│   ├── highscores.js
│   ├── sons.js
│   ├── voz.js
│   ├── vibracao.js
│   └── service-worker.js
│
├── sons/
│   ├── acerto.mp3
│   ├── erro.mp3
│   ├── clique.mp3
│   ├── fundo1.mp3
│   ├── fundo2.mp3
│   ├── fundo3.mp3
│   ├── home.mp3
│   └── sair.mp3
│
├── img/
│   ├── avatar-padrao.png
│   └── coroa.png
│
└── questions.json
 
3. 🔄 FLUXO COMPLETO DO SISTEMA
Copiar
index.html → game.html → end.html → highscores.html
Etapas:
1. 
Jogador entra nome + escolhe matéria
2. 
Jogo inicia (game.js)
3. 
Sistema gera perguntas dinâmicas
4. 
Jogador responde
5. 
Score é salvo
6. 
Finaliza → ranking
 
4. 🧩 COMPONENTES DETALHADOS
 
🏠 4.1 INDEX (Tela inicial)
📄 Arquivo: 
index
Responsabilidades:
• 
Capturar nome do jogador
• 
Selecionar matéria
• 
Upload de foto
• 
Iniciar jogo
Armazenamento:
JavaScript
Copiar
localStorage.setItem("nomeJogador", nome)
localStorage.setItem("materiaAtual", materia)
localStorage.setItem("fotoJogador", base64)
Acessibilidade:
• 
role="button"
• 
Navegação por teclado (Enter/Space)
• 
Narração inicial
 
🎮 4.2 GAME (Motor principal)
📄 Arquivo: 
game
Estado global:
JavaScript
Copiar
fase
nivel
score
respostaCorreta
combo
errosSeguidos
 
🔥 LÓGICA CENTRAL
1. Inicialização
JavaScript
Copiar
iniciarJogo()
• 
Carrega progresso (Firebase)
• 
Atualiza HUD
• 
Gera primeira pergunta
 
2. Geração de perguntas
• 
Baseado em:
• 
Matéria (soma, subtração, divisão)
• 
Nível (1 → 3)
• 
Erros consecutivos
JavaScript
Copiar
limite = nivel === 1 ? 5 : 10 ou 20
 
3. Montagem das opções
JavaScript
Copiar
opcoes = [correta + erros aleatórios]
• 
Sempre 4 alternativas
• 
Embaralhadas
 
4. Verificação de resposta
JavaScript
Copiar
if (escolha === respostaCorreta)
✔ Acerto:
• 
Soma pontos
• 
Avança fase
• 
Ativa combo
• 
Salva no Firebase
❌ Erro:
• 
Incrementa erros
• 
Mantém fase
 
5. Feedback multimodal
Tipo
Implementação
Som
sons.js
Voz
voz.js
Vibração
vibracao.js
Visual
CSS (correto/errado)
Copiar tabela
 
🔊 4.3 SISTEMA DE SOM
📄 Arquivo: 
sons
Estrutura:
JavaScript
Copiar
const sons = {
  clique,
  acerto,
  erro,
  fundo1, fundo2, fundo3
}
Recurso avançado:
🔥 Audio Ducking
JavaScript
Copiar
abaixarMusica()
restaurarMusica()
➡ Baixa volume da música durante efeitos
 
🗣️ 4.4 SISTEMA DE VOZ
📄 Arquivo: 
voz
Funções:
JavaScript
Copiar
narrar(texto)
narrarAcerto()
narrarErro()
Inteligência:
• 
Ajusta tom:
• 
Festa → animado
• 
Dica → calmo
• 
Neutro → padrão
 
📳 4.5 VIBRAÇÃO
📄 Arquivo: 
vibracao
JavaScript
Copiar
vibrarAcerto()
vibrarErro()
• 
Acerto → vibração longa
• 
Erro → padrão intermitente
 
☁️ 4.6 FIREBASE
📄 Arquivo: 
firebase
Funções:
JavaScript
Copiar
salvarProgresso(nome, fase, score)
carregarProgresso(nome)
Estrutura no banco:
Copiar
jogadores/
   nome/
      fase_atual
      pontos
      data
 
🏁 4.7 TELA FINAL
📄 Arquivo: 
end
Responsabilidades:
• 
Mostrar score
• 
Salvar ranking
• 
Validar nome
Regra:
JavaScript
Copiar
MAX_HIGH_SCORES = 5
 
🏆 4.8 RANKING
📄 Arquivo: 
highscores
Fonte:
JavaScript
Copiar
localStorage.getItem("highScores")
Renderização:
JavaScript
Copiar
<li>Nome - Score</li>
 
🎨 5. CSS (ESTILO E UX)
 
📄 Base global
Arquivo: 
app
• 
Mobile-first
• 
Fontes grandes
• 
Alto contraste
• 
Botões acessíveis
 
🎮 Game UI
Arquivo: 
game
Destaques:
• 
.choice-container → respostas
• 
.correto / .errado → feedback
• 
.tema-nivel-X → cores por nível
• 
animações:
• 
pulseSuccess
• 
shakeError
 
🏆 Ranking CSS
Arquivo: 
highscores
Simples e direto:
• 
lista
• 
hover leve
 
📦 6. DADOS (QUESTÕES)
📄 Arquivo: 
questions
Formato:
JSON
Copiar
{
  "question": "...",
  "choice1": "...",
  "answer": 1
}
⚠️ Atualmente o game usa geração dinâmica, mas esse arquivo permite:
• 
expansão futura
• 
perguntas fixas
 
🧠 7. ACESSIBILIDADE (PONTO CRÍTICO)
O sistema foi construído com:
✔ Leitor de tela
• 
aria-live
• 
foco automático
• 
narração
✔ Teclado
• 
Enter / Space ativa botão
✔ Feedback múltiplo
• 
som
• 
voz
• 
vibração
 
🚀 8. COMO INICIAR O PROJETO
✔ Execução simples
Bash
Copiar
abrir index.html
 
✔ Execução ideal
Usar servidor local:
Bash
Copiar
npx serve
ou
Bash
Copiar
live server (VS Code)
 
✔ Firebase
Já configurado:
JavaScript
Copiar
firebase.initializeApp(firebaseConfig)
 
⚠️ 9. PONTOS CRÍTICOS (ENGENHARIA)
🔴 Dependências implícitas
• 
game.js depende de:
• 
voz.js
• 
sons.js
• 
vibracao.js
• 
firebase.js
Se remover → quebra funcionalidades
 
🔴 Ordem de scripts
Obrigatório:
HTML
Copiar
Editar
Código
Pré-visualização
firebase → voz → sons → vibracao → game
 
🔴 LocalStorage obrigatório
Sem isso:
• 
nome quebra
• 
score quebra
• 
ranking quebra
 
🧩 10. EXTENSIBILIDADE (PRONTO PRA IA)
Este sistema permite:
✔ adicionar matérias
✔ adicionar níveis
✔ integrar IA de perguntas
✔ salvar ranking online
✔ multiplayer futuro
 