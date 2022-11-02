const bidBuilder = require('../commandBuilders/bidBuilder');
const { campaign } = require('../functions/bid/campaign');
const { make } = require('../functions/bid/make');
const { show } = require('../functions/bid/show');

module.exports = {
    data: bidBuilder,
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'campaign') {
            campaign(interaction);
        } else if (subcommand === 'make') {
            make(interaction);
        } else if (subcommand === 'show') {
            show(interaction);
        }
    },
};
