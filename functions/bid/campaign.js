const { BidManager } = require('../../bid/BidManager');
const { guildId } = require('../../config');

const MILLISECONDS_PER_HOUR = 3600000;
const OPERATOR_ROLE_ID = '998419522971254865';

async function campaign(interaction) {
    if (!interaction.isCommand()) return;
    if (interaction.guildId !== guildId) return;

    const name = interaction.options.getString('name');
    const description = interaction.options.getString('description');
    const hours = interaction.options.getInteger('hours');
    const creatorId = interaction.user.id;
    const channelId = interaction.channelId;

    await interaction.deferReply('잠시만 기다려주세요...');
    const bidManager = new BidManager();

    const member = interaction.member;
    const hasRole = member.roles.cache.has(OPERATOR_ROLE_ID);

    if (!hasRole) {
        await interaction.reply(
            `<@&${OPERATOR_ROLE_ID}>들만 경매를 열수있습니다. 경매를 열고 싶으시면 <@141994331669004288>에게 문의하세요.`
        );
        return;
    }

    try {
        await bidManager.createCampaign({
            name,
            description,
            creatorId,
            channelId,
            endsAt: new Date(Date.now() + MILLISECONDS_PER_HOUR * hours),
        });

        await interaction.editReply(
            `**${name}** 경매 캠페인을 만들었습니다.\`\`\`css\n${description}\`\`\`**${hours}시간** 후에 경매가 끝납니다.`
        );
    } catch (e) {
        console.log(e.message);
        await interaction.editReply(e.message);
    }

    return;
}

module.exports = {
    campaign,
};
