# reversi-bot

Play 2-player Reversi in any Discord channel. This is a Node.js app.

There is a simple home page but you don't play on the web, you play in your Discord channel. After adding the bot to your server you can type `reversi start` in any channel.

Publicly available at [reversi-bot.boutell.dev](https://reversi-bot.boutell.dev). Feel free to just use the button on that site to add the app, you don't need this source code to play. The source is just for curiosity's sake.

If you stand this up on your own, you'll need to get a bot token and set the `REVERSI_BOT_TOKEN` environment variable. You'll also need to change the bot's app id in the home page route in the source in order to get the right URL for adding your own bot (not mine) to your server. Yes it was lazy of me not to make this an environment variable too. (App ids are not secrets.)

