// importação de dependência(s)
import express  from 'express';
import fs from 'fs';
const app = express();

// variáveis globais deste módulo
const PORT = 3000;



// carregar "banco de dados" (data/jogadores.json e data/jogosPorJogador.json)
// você pode colocar o conteúdo dos arquivos json no objeto "db" logo abaixo
// dica: 1-4 linhas de código (você deve usar o módulo de filesystem (fs))

const jogadores =  JSON.parse(fs.readFileSync('server/data/jogadores.json').toString());
const jogosPorJogador =  JSON.parse(fs.readFileSync('server/data/jogosPorJogador.json').toString());
jogadores.players.forEach(jogador => {
    jogador.game_count = jogosPorJogador[jogador.steamid].game_count;
    jogador.games = jogosPorJogador[jogador.steamid].games;
});
const db = jogadores.players;

// configurar qual templating engine usar. Sugestão: hbs (handlebars)
app.set('view engine', 'hbs');
app.set('views', './server/views');


// EXERCÍCIO 1
// configurar para servir os arquivos estáticos da pasta "client"
// dica: 1 linha de código


app.use(express.static('./client/'));

// abrir servidor na porta 3000 (constante PORT)
// dica: 1-3 linhas de código
app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});



// EXERCÍCIO 2
// definir rota para página inicial --> renderizar a view index, usando os
// dados do banco de dados "data/jogadores.json" com a lista de jogadores
// dica: o handler desta função é bem simples - basta passar para o template
//       os dados do arquivo data/jogadores.json (~3 linhas)

app.get('/', (req, res) => {
    res.render("index.hbs", {jogadores: db})
});


// EXERCÍCIO 3
// definir rota para página de detalhes de um jogador --> renderizar a view
// jogador, usando os dados do banco de dados "data/jogadores.json" e
// "data/jogosPorJogador.json", assim como alguns campos calculados
// dica: o handler desta função pode chegar a ter ~15 linhas de código

app.get('/jogador/:numero_identificador', (req, res) => {
    const jogador = db.find(el => el.steamid ==  req.params.numero_identificador);
    if(!jogador) return res.statusCode(404);
    jogador.never_played = jogador.games.filter(el => el.playtime_forever == 0).length;
    jogador.games = jogador.games.sort((b,a) => a.playtime_forever - b.playtime_forever).filter((el, index) => index < 5);
    jogador.games.forEach(game => {
        game.playtime_forever_hours = (game.playtime_forever / 60).toFixed(0);
        game.logo = `http://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_logo_url}.jpg`
        game.statistics = `http://steamcommunity.com/profiles/${jogador.steamid}/stats/${game.appid}`
    });
    jogador.favoriteGame = jogador.games[0]
    console.log(jogador);
    res.render("jogador.hbs", jogador )
});
