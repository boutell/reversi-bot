const Discord = require('discord.js');
const client = new Discord.Client();

const games = {};

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
 
client.on('message', input);
 
client.login(process.env.REVERSI_BOT_TOKEN);

function input(msg) {
  const words = msg.content.split(' ');
  const context = words.shift();
  if (context !== 'reversi') {
    return;
  }
  const command = words.shift();
  if (command === 'start') {
    start(msg, words);
  } else if (command === 'stop') {    
    stop(msg, words);
  } else if (command.match(/^[a-z][0-9]$/)) {
    move(msg, command);
  }
}

function start(msg, words) {
  const size = words.shift();
  const sizes = {
    '4x4': 4,
    '6x6': 6,
    '8x8': 8
  };
  // one game per channel
  const gameId = msg.channel.id;
  if (games[gameId]) {
    return msg.reply('A game is already in progress in this channel.');
  }
  const board = [];
  const game = {
    board,
    players: [
      {
        id: msg.author.id,
        username: msg.author.username
      }
    ],
    turn: 0,
    size: size ? sizes[size] : 8
  };
  for (let y = 0; (y < game.size); y++) {
    board[y] = [];
    for (let x = 0; (x < game.size); x++) {
      board[y][x] = null;
    }   
  }
  const half = game.size / 2 - 1;
  board[half][half] = 0;
  board[half][half + 1] = 1;
  board[half + 1][half] = 1;
  board[half + 1][half + 1] = 0;
  games[gameId] = game;
  msg.reply(render(game));
}

function move(msg, m) {
  // one game per channel
  const gameId = msg.channel.id;
  const game = games[gameId];
  if (!game) {
    return msg.reply('No game is in progress in this channel.');
  }
  const player = game.players[game.turn];
  if (!player) {
    game.players[game.turn] = {
      id: msg.author.id,
      username: msg.author.username
    };
  } else if (player.id !== msg.author.id) {
    return;
  }
  const x = m.charCodeAt(0) - 'a'.charCodeAt(0);
  const y = parseInt(m.charAt(1)) - 1;
  if (!testMove(game, x, y, true)) {
    return msg.reply('To make a legal move, you must flip an opponent\'s token.');
  }
  game.turn++;
  if (game.turn === 2) {
    game.turn = 0;
  }
  if (!hasLegalMove(game)) {
    console.log('ending game');
    return end(msg, game);
  }
  return msg.reply(render(game));
}

function hasLegalMove(game) {
  for (let y = 0; (y < game.size); y++) {
    for (let x = 0; (x < game.size); x++) {
      if (testMove(game, x, y, false)) {
        return true;
      }
    }
  }
  return false;
}

function testMove(game, x, y, andMove) {
  if (game.board[y][x] != null) {
    return false;
  }
  const directions = [
    [ -1, -1 ],
    [ 0, -1 ],
    [ 1, -1 ],
    [ 1, 0 ],
    [ 1, 1 ],
    [ 0, 1 ],
    [ -1, 1 ],
    [ -1, 0 ]
  ];
  const opponent = 1 - game.turn;
  let good = false;
  for (const direction of directions) {
    let nx = x;
    let ny = y;
    for (let i = 0; (i < game.size); i++) {
      nx = nx + direction[0];
      ny = ny + direction[1];
      if ((nx < 0) || (nx >= game.size) || (ny < 0) || (ny >= game.size)) {
        break;
      }
      if (i === 0) {
        if (game.board[ny][nx] !== opponent) {
          break;
        }
      } else if (game.board[ny][nx] === game.turn) {
        good = true;
        if (andMove) {
          game.board[y][x] = game.turn;
          let tx = x;
          let ty = y;
          for (let j = 0; (j <= i); j++) {
            tx = x + direction[0];
            ty = y + direction[1];
            game.board[ty][tx] = game.turn;
          }
        }
        break;
      } else if (game.board[ny][nx] !== opponent) {
        break;
      }
    }
  }
  return good;
}

function stop(msg, words) {
  const gameId = msg.channel.id;
  const game = games[gameId];
  if (!game) {
    return msg.reply('No game in proge')
  }
  if (games[gameId]) {
    delete games[gameId];
    return msg.reply('Game stopped.');
  }
}

function render(game, ended) {
  const tokens = [ 'X', 'O' ];
  let message = "```   ";
  for (let i = 0; (i < game.size); i++) {
    message += ' ' + String.fromCharCode('a'.charCodeAt(0) + i) + ' ';
  }
  message += "\n" + game.board.map((row, index) => {
    return ` ${index + 1} ` + row.map(cell => {
      if (cell === null) {
        return ' . ';
      } else {
        return ` ${tokens[cell]} `;
      }
    }).join('');
  }).join('\n') + "```\n";
  if (game.players[game.turn]) {
    const scores = [ 0, 0 ];
    for (let y = 0; (y < game.size); y++) {
      for (let x = 0; (x < game.size); x++) {
        if (game.board[y][x] !== null) {
          scores[game.board[y][x]]++;
        }
      }
    }  
    game.players.forEach((player, index) => {
      message += `${player.username} is \`${tokens[index]} (${scores[index]})\`\n`;
    });
    if (ended) {
      const winner = scores[0] > scores[1] ? 0 : 1;
      message += `\n${game.players[winner].username} wins!`;
    } else {
      const player = game.players[game.turn];
      if ((game.players.length > 1) && !ended) {
        message += `${player.username}'s turn!`;
      } else {
        message += 'Now make the first move, like `reversi f4`';
      }
    }
  } else {
    message += 'To be `O`, make the second move now, like `reversi f5`';
  }
  console.log(message.replace(/```/g, ''));
  return message;
}

function end(msg, game) {
  const message = render(game, true);
  msg.reply(message);
  delete games[msg.channel.id];
}
