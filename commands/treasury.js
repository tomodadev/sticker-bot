const { SlashCommandBuilder } = require('@discordjs/builders');
const { guildId } = require('../config');
const ethers = require('ethers');

const network = 'mainnet'; // use rinkeby testnet
const provider = ethers.getDefaultProvider(network);
const address = '0x9991f7dad8B96126B51642Fce6737b5E32237A6F';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('treasury')
        .setDescription('꼬마갱 treasury에 현재 쌓인 ETH'),
    async execute(interaction) {
        if (!interaction.isCommand()) return;
        if (interaction.guildId !== guildId) return;

        await interaction.deferReply('잠시만 기다려주세요...');
        try {
            const treasury = await provider.getBalance(address);
            await interaction.editReply(
                `Treasury Balance: ${ethers.utils.formatEther(treasury)} ETH`
            );
        } catch (e) {
            console.log(e);
            await interaction.editReply(
                '트레져리 금액을 불러오는데 실패했습니다.'
            );
        }

        return;
    },
};
