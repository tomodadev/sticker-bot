const dotenv = require('dotenv');
dotenv.config();
module.exports = {
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,
    webhook: process.env.WEBHOOK,
    webhookFactoryUrl: process.env.WEBHOOK_FACTORY,
    webhookLogsUrl: process.env.WEBHOOK_LOGS,
    token: process.env.DISCORD_TOKEN,
    bugcity: process.env.BUGCITY,
    api: process.env.API_ROOT,
    channelId: process.env.CHANNEL_ID,
};
