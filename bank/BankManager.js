const got = require('got');
const { api, bugcity } = require('../config');
const { log } = require('../utils/webhook');

class BankManager {
    async deposit(user, point) {
        if (!user || !point) return;

        try {
            var details = {
                point: point * -1,
                memo: '바나나 deposit',
                allowNegative: true,
            };
            const url = `${api}/v2/users/${user.id}/points/BANANA`;
            const json = await got
                .patch(url, {
                    headers: {
                        'X-Auth-Token': bugcity,
                    },
                    json: details,
                })
                .json();
            log(`[DEPOSIT SUCCESS] <@${user.id}> - ${point} BANANA`);
            console.log('deposit', user.id, point);
            return json;
        } catch (e) {
            log(
                `[DEPOSIT ERROR] <@${user.id}> - ${point} BANANA, ${e?.message}`
            );
            console.error(e);
            throw new Error('바나나 입금 실패');
        }
    }

    async getBalance(user) {
        try {
            const url = `${api}/v2/users/${user.id}/points/BANANA`;
            const json = await got
                .get(url, {
                    headers: {
                        'X-Auth-Token': bugcity,
                    },
                })
                .json();
            return json;
        } catch (e) {
            console.error(e);
            throw new Error('바나나 밸런스 조회 실패');
        }
    }

    async withdraw(user, point) {
        if (!user || !point) return;

        try {
            var details = {
                point,
                memo: '바나나 withdraw',
                allowNegative: true,
            };
            const url = `${api}/v2/users/${user.id}/points/BANANA`;
            const json = await got
                .patch(url, {
                    headers: {
                        'X-Auth-Token': bugcity,
                    },
                    json: details,
                })
                .json();
            console.log('withdraw', user.id, point);
            log(`[WITHDRAW SUCCESS] <@${user.id}> - ${point} BANANA`);
            return json;
        } catch (e) {
            log(
                `[WITHDRAW ERROR] <@${user.id}> - ${point} BANANA, ${e?.message}`
            );
            console.error(e);
            throw new Error('바나나 출금 실패');
        }
    }
}

module.exports = BankManager;
