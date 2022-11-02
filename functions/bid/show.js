const { BidManager } = require('../../bid/BidManager');
const { guildId } = require('../../config');
const { getActiveCampaign } = require('../../prisma/bid');

async function show(interaction) {
    if (!interaction.isCommand()) return;
    if (interaction.guildId !== guildId) return;

    await interaction.deferReply('잠시만 기다려주세요...');
    const bidManager = new BidManager();

    try {
        const campaign = await getActiveCampaign(interaction.channelId);
        if (!campaign) {
            await interaction.editReply(`진행중인 경매가 없습니다.`);
        } else {
            const string = bidManager.generateStatusMessage(campaign);
            await interaction.editReply(string);
        }
    } catch (e) {
        console.log(e.message);
        await interaction.editReply(e.message);
    }

    return;
}

module.exports = {
    show,
};
