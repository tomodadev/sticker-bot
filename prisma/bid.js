const prisma = require('./prisma');

async function createCampaign(data) {
    const { endsAt, name, description, creatorId, channelId } = data;
    const campaign = await prisma.campaign.create({
        data: {
            endsAt,
            name,
            description,
            creatorId,
            channelId,
        },
    });

    return campaign;
}

async function editCampaign(campaignId, data) {
    const campaign = await prisma.campaign.update({
        where: {
            id: Number(campaignId),
        },
        data,
    });

    return campaign;
}

async function endCampaign(campaignId) {
    const campaign = await prisma.campaign.update({
        where: {
            id: Number(campaignId),
        },
        data: {
            active: false,
        },
    });

    return campaign;
}

async function getActiveCampaign(channelId) {
    const campaign = await prisma.campaign.findFirst({
        where: {
            channelId,
            active: true,
        },
        include: {
            Bids: true,
        },
    });

    return campaign;
}

async function getActiveCampaigns() {
    const campaign = await prisma.campaign.findMany({
        where: {
            active: true,
        },
        include: {
            Bids: true,
        },
    });

    return campaign;
}

async function makeBid(data) {
    const { discordId, campaignId, message, amount } = data;
    const bid = await prisma.bid.create({
        data: {
            campaignId,
            message,
            discordId,
            amount,
        },
    });

    return bid;
}

async function updateBid(data) {
    const { id, message, amount } = data;
    const bid = await prisma.bid.update({
        where: {
            id,
        },
        data: {
            message,
            amount,
        },
    });

    return bid;
}

async function updateRefundAmount(data) {
    const { id, refunded } = data;
    const bid = await prisma.bid.update({
        where: {
            id,
        },
        data: {
            refunded,
        },
    });

    return bid;
}

module.exports = {
    makeBid,
    updateBid,
    createCampaign,
    editCampaign,
    endCampaign,
    getActiveCampaign,
    getActiveCampaigns,
    updateRefundAmount,
};
