/**
 * Instantiating discord dependencies and creating the discord client
 */
const Discord = require('discord.js');
const client = new Discord.Client();

/**
 * File storing the variable information of the BOT
 */
const config = require('./config');

/**
 * BOT authentication using the DISCORD token
 */
client.login(config.discordtoken);

/**
 * Instantiation of the data necessary for the use of SQLITE3 and its DB
 */
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/data.db');

/**
 * Function allowing to send "embed" => form of markdown blocks on discord
 */
const embed = require('./embed');

/**
 * Instantiation of all remote commands in the form of functions to simplify the file
 */
const call = require('./commands/call');
const usercmd = require('./commands/user');
const secret = require('./commands/secret');
const help = require('./commands/help');

/**
 * Creation of constants allowing the bot to work
 */
const prefix = config.discordprefix;
const ADMIN = 0;
const USER = 1;

/**
 * As soon as the bot is "ready", announce it in console and put as status! Help
 */
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity(`${prefix}help`); 
});

/**
 * When a message is received, launch the code contained in the function
 */
client.on("message", function(message) {
    /**
     * If the author of the message is a bot, end the function
     */
    if (message.author.bot) return;

    /**
     * If the message does not start with the defined prefix, then it is not a command and end the function
     */
    if (!message.content.startsWith(prefix)) return;

    /**
     * Instantiation of all the variables allowing the use of the bot and the information provided
     */
    const commandBody = message.content.slice(prefix.length).toLowerCase();
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();
    const user = "@" + message.author.username + '#' + message.author.discriminator;
    const all = { commandBody, args, command, message, user };

    /**
     * Checking user permissions when ordering
     */
    db.get('SELECT permissions FROM users WHERE userid = ?', [message.author.id], (err, row) => {
      if (err) console.log(err.message);

      /**
       * System storing authorized orders according to grade
       */
      const ADMIN_CMD = ['user', 'calltest'];
      const USER_CMD = ['call', 'secret', 'help'];

      /**
       * Checking if the is admin or user, if not then it does not exist and returns an error
       */
      if(!ADMIN_CMD.includes(command) && !USER_CMD.includes(command)) {
        embed(message, 'Bad command', 15158332, "This command doesn't exist. Please ask help to an admin.", user)
      }

      /**
       * If the user is not already in the db, then he has no permissions and sets them to null
       */
      if(row != undefined)  perms = row.permissions;
      else perms = null;

      /**
       * If the user enters an admin command but does not have the rights, then a message saying that he does not have the rights is sent
       * If it is admin and runs an Admin command, then run it

       */
      if(perms != ADMIN && ADMIN_CMD.includes(command)) {
          embed(message, 'Permissions', 15158332, "message binfraudin for access", user);
      } else if(perms == ADMIN && ADMIN_CMD.includes(command)) {
          usercmd(all);
          call(all);
      }

      /**
       * If the user does not have user or admin rights, and launches a user command (except secret and help which are exceptions)
       * So tell him that he has no rights /
       * 
       * If it's a USER / ADMIN and it does a stored function, run it.
       * If it is neither user nor admin but the command is secret or help, then still allow the command:
       * help can help anyone, and secret is a security feature allowing admin anyone to use a recovery password
       */
      if(perms != USER && USER_CMD.includes(command) && perms != ADMIN && command != 'secret' && command != 'help') {
          embed(message, 'Permissions', 15158332, "You don't have the permissions to use this command. Please ask help to an admin.", user);
      } else if(perms == USER || perms == ADMIN && USER_CMD.includes(command)) {
          call(all);
          secret(all);
          help(all);
      } else {
        secret(all);
        help(all);
      }
    });
});
