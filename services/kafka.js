const path = require('path');
const { KAFKA_TOPICS, COLLECTION_NAME } = require('../constant');
const fs = require('fs');

const { Kafka, Partitioners } = require('kafkajs');
const { save, saveConversation } = require('../helper/database_helper');

const kafka = new Kafka({
    brokers: [process.env.KAFKA_BROKER],
    ssl: {
        ca: [fs.readFileSync(path.join(__dirname, './ca.pem'), 'utf-8')],
    },
    sasl: {
        username: process.env.KAFKA_USERNAME,
        password: process.env.KAFKA_PASSWORD,
        mechanism: 'plain',
    }
})

let producer = null;

async function createProducer() {
    if (producer) return producer;

    const _producer = kafka.producer();
    await _producer.connect();
    producer = _producer;
    return producer;
}

async function produceMessage(message) {
    try {
        const producer = await createProducer();
        await producer.send({
            topic: KAFKA_TOPICS.MESSAGES,
            messages: [
                {
                    key: `message-${Date.now()}`,
                    value: message
                }
            ]
        });
        console.log('Successfully produced message to kafka');
        return true;
    } catch (error) {
        console.log('Failed to produce message to kafka');
        return false;
    }

}

async function startMessageConsumer() {
    console.log('Init kafka consumer...');
    const consumer = kafka.consumer({ groupId: "default" });
    await consumer.connect();
    await consumer.subscribe({ topic: KAFKA_TOPICS.MESSAGES, fromBeginning: true });

    console.log('kafka consumer started...');

    await consumer.run({
        autoCommit: true,
        eachMessage: async ({ message, pause }) => {
            if (!message.value) return;
            console.log("new mssg recieved to kafka consumer");
            try {
                // toUID | fromUID | message | createdAt
                let parseMessage = JSON.parse(message.value.toString());
                await saveConversation(
                    generateConversationId(parseMessage.fromUID, parseMessage.toUID), {
                    message: parseMessage.message,
                    createdAt: parseMessage.createdAt,
                    createdBy: parseMessage.fromUID,
                }
                );
                console.log('Successfully saved message to db');
            } catch (error) {
                console.log('Something went wrong while saving message to db');
                pause();
                setTimeout(() => {
                    consumer.resume([{ topic: KAFKA_TOPICS.MESSAGES }]);
                }, 60 * 1000);
            }
        }
    });
}

module.exports = {
    produceMessage,
    startMessageConsumer
};