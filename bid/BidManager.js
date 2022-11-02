const BankManager = require('../bank/BankManager');
const {
    createCampaign,
    makeBid,
    getActiveCampaign,
    getActiveCampaigns,
    updateBid,
    editCampaign,
    endCampaign,
    updateRefundAmount,
} = require('../prisma/bid');
const { formatTime } = require('../utils/time');

const bankManager = new BankManager();

const MINUTES_IN_AN_HOUR = 60;

class BidManager {
    constructor(client) {
        if (BidManager._instance) return BidManager._instance;
        BidManager._instance = this;

        this.client = client;

        this.time();
    }

    async time() {
        let minutes = 0;

        const tick = async () => {
            minutes++;
            if (minutes % MINUTES_IN_AN_HOUR === 0) {
                this.printStatus();
            }
            this.checkCampaignEnd();
        };

        if (!this.tickInterval) {
            this.tickInterval = setInterval(
                tick,
                60 * 1000 //every minute
            );
        }

        tick();
    }

    async sendMessageToCampaign(campaign, message) {
        if (message && campaign) {
            const channel = this.client.channels.cache.get(campaign.channelId);
            channel.send(message);
        }
    }

    async checkCampaignEnd() {
        const activeCampaigns = await getActiveCampaigns();

        for (const campaign of activeCampaigns) {
            if (Date.now() > campaign.endsAt.getTime()) {
                await endCampaign(campaign.id);
                let highestBid;
                if (campaign.Bids.length > 0) {
                    highestBid = campaign.Bids.sort(
                        (a, b) => b.amount - a.amount
                    )[0];
                }
                if (!highestBid) {
                    this.sendMessageToCampaign(
                        campaign,
                        '입찰자가 없었습니다. 경매를 종료합니다.'
                    );
                } else {
                    this.sendMessageToCampaign(
                        campaign,
                        `🎉 축하합니다! <@${highestBid.discordId}>숭이가 **${campaign.name}** 경매에서 낙찰되었습니다! 🧑🏻‍⚖️`
                    );
                }
                console.log('campaign ended', campaign);
            } else if (
                //less than 10 minutes
                campaign.endsAt.getTime() - Date.now() < 60 * 1000 * 10 &&
                //greater than 9 minutes
                campaign.endsAt.getTime() - Date.now() > 60 * 1000 * 9
            ) {
                this.sendMessageToCampaign(
                    campaign,
                    `@everyone ${campaign.name} 경매가 종료되기 10분 전입니다.`
                );
            } else {
                console.log('campaign not ended');
            }
        }
    }

    generateStatusMessage(campaign) {
        const remaining = (campaign.endsAt - Date.now()) / 1000;
        let bidStatusString = `**[${campaign.name} 경매 현황]**\`\`\`css\n${
            campaign.description
        }\`\`\`남은시간: **${formatTime(remaining)}**\n`;
        const bidsSorted = campaign.Bids.sort((a, b) => b.amount - a.amount);

        let count = 1;
        for (const bid of bidsSorted) {
            bidStatusString += `${count}. <@${bid.discordId}> ${bid.message} ${bid.amount} BANANA 입찰\n`;
            count++;
        }
        if (bidsSorted.length === 0) {
            bidStatusString += '입찰자가 없습니다.';
        }

        return bidStatusString;
    }

    async printStatus() {
        const activeCampaigns = await getActiveCampaigns();

        for (const campaign of activeCampaigns) {
            const string = this.generateStatusMessage(campaign);
            this.sendMessageToCampaign(campaign, string);
        }
    }

    async createCampaign(data) {
        const campaign = await getActiveCampaign(data.channelId);
        console.log('existing campaign', campaign);
        if (campaign) {
            const remaining = (campaign.endsAt - Date.now()) / 1000;

            throw new Error(
                `이미 진행중인 캠페인이 있습니다 - **${
                    campaign.name
                }**\n남은시간: **${formatTime(remaining)}**`
            );
        }
        return await createCampaign(data);
    }

    async makeBid(data) {
        const campaign = await getActiveCampaign(data.channelId);
        if (!campaign) {
            throw new Error('진행중인 캠페인이 없습니다.');
        }

        if (campaign.Bids.length > 0) {
            const highestBid = Math.max(
                ...campaign.Bids.map((bid) => bid.amount)
            );
            console.log(highestBid);
            if (highestBid.discordId === data.discordId) {
                throw new Error(
                    `<@${data.discordId}>숭이님, 이미 최고 입찰가입니다.`
                );
            }
            if (highestBid >= data.amount) {
                throw new Error(
                    `<@${data.discordId}>숭이님, 최고 입찰가보다 높게 입찰하셔야합니다. 현재 최고 입찰가: [${highestBid} BANANA]`
                );
            }
        }

        const myBid = campaign.Bids.find(
            (bid) => bid.discordId === data.discordId
        );

        const userBalance = await bankManager.getBalance({
            id: data.discordId,
        });

        let amount = data.amount;

        // if (myBid) {
        //     amount = data.amount - myBid.amount;
        // }

        if (userBalance?.point?.current < amount) {
            throw new Error(
                '보유하고있는 바나나보다 많은 바나나를 입찰할수없습니다.'
            );
        }

        await bankManager.deposit(
            {
                id: data.discordId,
            },
            amount
        );

        if (myBid) {
            await updateBid({ ...data, id: myBid.id });
        } else {
            // create new bid
            await makeBid({ ...data, campaignId: campaign.id });
        }

        if (campaign.endsAt - Date.now() < 60 * 1000 * 5) {
            //within last 5 minutes
            console.log('is last 5 minutes');
            const edited = await editCampaign(campaign.id, {
                endsAt: new Date(campaign.endsAt.getTime() + 60 * 1000 * 5),
            });

            const remaining = (edited.endsAt - Date.now()) / 1000;

            await this.sendMessageToCampaign(
                campaign,
                `<@${
                    data.discordId
                }>숭이 입찰하여 경매가 5분 연장되었습니다. [남은시간: ${formatTime(
                    remaining
                )}]`
            );
        }

        const updatedCampaign = await getActiveCampaign(data.channelId);
        const msg = this.generateStatusMessage(updatedCampaign);
        await this.sendMessageToCampaign(updatedCampaign, msg);

        let highestBid,
            remainingBids = [];
        if (updatedCampaign.Bids.length > 0) {
            highestBid = updatedCampaign.Bids.sort(
                (a, b) => b.amount - a.amount
            )[0];
            remainingBids = updatedCampaign.Bids.filter(
                (bid) => bid.id !== highestBid.id && bid.refunded < bid.amount
            );
        }

        let str = '';

        for (const remainingBid of remainingBids) {
            const refundAmount = remainingBid.amount;
            if (remainingBid.refunded !== refundAmount) {
                try {
                    await updateRefundAmount({
                        ...remainingBid,
                        refunded: refundAmount,
                    });
                    await bankManager.withdraw(
                        { id: remainingBid.discordId },
                        refundAmount
                    );
                    str += `최고 입찰자가 바뀌어 <@${remainingBid.discordId}>숭이님에게 ${refundAmount} BANANA를 환불해드렸습니다.\n`;
                } catch (e) {
                    console.log(e);
                    str += `최고 입찰자가 바뀌었지만 <@${remainingBid.discordId}>숭이님에게 ${refundAmount} BANANA를 환불을 실패했습니다.\n`;
                }
            }
        }

        if (remainingBids.length > 0 && str) {
            await this.sendMessageToCampaign(updatedCampaign, str);
        }

        return { update: myBid, difference: amount };
    }
}

module.exports = {
    BidManager,
};
