const BankManager = require('../bank/BankManager');
const { guildId } = require('../config');
const { send, factoryWebhook } = require('../utils/webhook');
const bankManager = new BankManager();

const BOOSTER_ROLE_ID = '996650657291456615';
const OG_ROLE_ID = '1003569734568124426';
const HOLDER_ID = '996603707477200926';
const CRYPTOTEENS_ROLE_ID = '1001818297496506419';
const HAWKWON_ROLE_ID = '1014465381177495582';

async function distribute(client) {
    const guild = await client.guilds.fetch(guildId);
    const members = await guild.members.fetch();

    let og = [];
    let holders = [];
    let boosters = [];
    let cryptoteens = [];
    let hawkwon = [];

    members.map((m) => {
        if (m.roles.cache.find((role) => role.id === BOOSTER_ROLE_ID)) {
            boosters.push(m.id);
        }

        if (m.roles.cache.find((role) => role.id === OG_ROLE_ID)) {
            og.push(m.id);
        }

        if (m.roles.cache.find((role) => role.id === HOLDER_ID)) {
            holders.push(m.id);
        }

        if (m.roles.cache.find((role) => role.id === CRYPTOTEENS_ROLE_ID)) {
            cryptoteens.push(m.id);
        }

        if (m.roles.cache.find((role) => role.id === HAWKWON_ROLE_ID)) {
            hawkwon.push(m.id);
        }
    });

    // const today = new Date().getDate();
    // const ogAmount = (Math.floor((today - 1) / 7) + 1) * 10;

    //fix og amount to 20
    const ogAmount = 20;

    // og gets 10 more
    await distributeToGroup(holders, ogAmount, HOLDER_ID);
    // await distributeToGroup(cryptoteens, ogAmount, CRYPTOTEENS_ROLE_ID);
    await distributeToGroup(boosters, 20, BOOSTER_ROLE_ID);
    await distributeToGroup(og, 10, OG_ROLE_ID);
    await distributeToGroup(hawkwon, 10, HAWKWON_ROLE_ID);
}

async function distributeToGroup(group, amount, roleId) {
    let str = `으아앗...!! <@&${roleId}>숭이들 머리위에 바나나가 호다닥 떨어진다!! 🍌\n`;
    for (const id of group) {
        try {
            const {
                point: { current },
            } = await bankManager.withdraw({ id }, amount);
            str += `<@${id}> 에게 ${amount} BANANA 🍌 추가 완료! [현재: ${current} BANANA]\n`;
        } catch (e) {
            console.error(e);
            str += `<@${id}> 에게 ${amount} BANANA 🍌 분배 실패\n`;
        }
    }

    if (str.length > 2000) {
        const arr = str.split('\n');
        const half = Math.ceil(arr.length / 2);
        const firstHalf = arr.splice(0, half);
        const secondHalf = arr.splice(-half);
        await send(firstHalf.join('\n'), factoryWebhook);
        await send(secondHalf.join('\n'), factoryWebhook);
    } else {
        await send(str, factoryWebhook);
    }
}

module.exports = {
    distribute,
};
