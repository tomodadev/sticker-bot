const { WebhookClient } = require('discord.js');
const {
    webhook: url,
    webhookFactoryUrl,
    webhookLogsUrl,
} = require('../config');

const webhook = new WebhookClient({
    url: url,
});

const factoryWebhook = new WebhookClient({
    url: webhookFactoryUrl,
});

const logWebhook = new WebhookClient({
    url: webhookLogsUrl,
});

async function send(text = 'hello', wh = webhook) {
    try {
        if (text.length >= 2000) {
            const arr = text.split('\n');
            const half = Math.ceil(arr.length / 2);
            const firstHalf = arr.splice(0, half);
            const secondHalf = arr.splice(-half);
            await wh.send({ content: firstHalf.join('\n') });
            const msg = await wh.send({ content: secondHalf.join('\n') });
            return msg;
        } else {
            const message = await wh.send({
                content: text,
            });
            return message;
        }
    } catch (e) {
        console.error(e);
    }
}

async function log(text = 'hello', wh = logWebhook) {
    try {
        const message = await wh.send({
            content: text,
        });
        return message;
    } catch (e) {
        console.error(e);
    }
}

async function edit(id, text = 'hello') {
    try {
        const message = await webhook.editMessage(id, {
            content: text,
        });
        return message;
    } catch (e) {
        console.error(e);
    }
}

async function sendEmbed(embed) {
    try {
        const message = await webhook.send({
            embeds: [embed],
        });
        return message;
    } catch (e) {
        console.error(e);
    }
}

async function editEmbed(id, embed) {
    try {
        const message = await webhook.editMessage(id, {
            embeds: [embed],
        });
        return message;
    } catch (e) {
        console.error(e);
    }
}

async function deleteMessage(id) {
    try {
        const message = await webhook.deleteMessage(id);
        return message;
    } catch (e) {
        console.error(e);
    }
}

module.exports = {
    webhook,
    send,
    sendEmbed,
    edit,
    editEmbed,
    deleteMessage,
    factoryWebhook,
    logWebhook,
    log,
};
