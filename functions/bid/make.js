const { BidManager } = require('../../bid/BidManager');
const { guildId } = require('../../config');

let bidding = false;

async function make(interaction) {
    if (!interaction.isCommand()) return;
    if (interaction.guildId !== guildId) return;

    const message = interaction.options.getString('message');
    const banana = interaction.options.getInteger('banana');
    const discordId = interaction.user.id;
    const channelId = interaction.channelId;

    if (bidding) {
        interaction.reply({
            content: '누군가 입찰하고있습니다. 다시 시도해주세요.',
            ephemeral: true,
        });
        return;
    }

    await interaction.deferReply('잠시만 기다려주세요...');
    const bidManager = new BidManager();
    try {
        bidding = true;
        const { update, difference } = await bidManager.makeBid({
            channelId,
            message,
            amount: banana,
            discordId,
        });

        if (update) {
            await interaction.editReply(
                `<@${discordId}>님이 **${difference}바나나**를 추가 입찰하셨습니다\n\`\`\`${message}\`\`\``
            );
        } else {
            await interaction.editReply(
                `<@${discordId}>님이 **${banana}바나나**에 입찰하셨습니다\n\`\`\`${message}\`\`\``
            );
        }
    } catch (e) {
        console.log(e.message);
        await interaction.editReply(e.message);
    }

    bidding = false;
    return;
}

module.exports = {
    make,
};
