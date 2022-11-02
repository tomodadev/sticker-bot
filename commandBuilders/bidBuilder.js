const { SlashCommandBuilder } = require('@discordjs/builders');

const classBuilder = new SlashCommandBuilder()
    .setName('bid')
    .setDescription('경매 관련 명령어입니다.')
    //create
    .addSubcommand((subcommand) =>
        subcommand
            .setName('campaign')
            .setDescription('경매 캠페인을 만듭니다.')
            .addStringOption((option) =>
                option
                    .setName('name')
                    .setDescription('경매 이름')
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName('description')
                    .setDescription('경매 설명')
                    .setRequired(true)
            )
            .addIntegerOption((option) =>
                option
                    .setName('hours')
                    .setDescription('몇시간동안 경매가 진행되나요?')
                    .setMinValue(1)
                    .setRequired(true)
            )
    )
    //make
    .addSubcommand((subcommand) =>
        subcommand
            .setName('make')
            .setDescription('경매에 참여합니다')
            .addStringOption((option) =>
                option
                    .setName('message')
                    .setDescription('사람들에게 보이는 내 경매 메시지')
                    .setRequired(true)
            )
            .addIntegerOption((option) =>
                option
                    .setName('banana')
                    .setDescription('몇 바나나로 입찰하시나요?')
                    .setMinValue(1)
                    .setRequired(true)
            )
    )
    //show
    .addSubcommand((subcommand) =>
        subcommand
            .setName('show')
            .setDescription('이 채널의 경매 현황을 보여줍니다.')
    );

module.exports = classBuilder;
