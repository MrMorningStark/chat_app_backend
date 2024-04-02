const path = require('path');
const { KAFKA_TOPICS } = require('../constant');
const fs = require('fs');

const { Kafka } = require('kafkajs');
const { saveConversation, updateStatus } = require('../helper/database_helper');
const { generateConversationId } = require('../helper/helper');

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

async function updateMessageStatus(message) {
    try {
        const producer = await createProducer();
        await producer.send({
            topic: KAFKA_TOPICS.MESSAGE_STATUS,
            messages: [
                {
                    key: `message-${Date.now()}`,
                    value: message
                }
            ]
        });
        console.log('Successfully sent updated Message Status to kafka');
        return true;
    } catch (error) {
        console.log('Failed to send update Message Status to kafka');
        return false;
    }

}

async function startMessageConsumer() {
    console.log('Init kafka consumer...');
    const consumer = kafka.consumer({ groupId: "default" });
    await consumer.connect();
    await consumer.subscribe({ topics: [KAFKA_TOPICS.MESSAGES, KAFKA_TOPICS.MESSAGE_STATUS], fromBeginning: true });

    console.log('kafka consumer started...');

    await consumer.run({
        autoCommit: true,
        eachMessage: async ({ topic, message, pause }) => {
            console.log(topic)
            if (!message.value) return;
            console.log("new mssg recieved to kafka consumer");
            try {
                let parseMessage = await JSON.parse(message.value.toString());
                switch (topic) {
                    case KAFKA_TOPICS.MESSAGES:
                        // toUID | fromUID | message | createdAt | status
                        let conversationId = generateConversationId(parseMessage.fromUID, parseMessage.toUID);
                        let saveData = {
                            message: parseMessage.message,
                            createdAt: parseMessage.createdAt,
                            createdBy: parseMessage.fromUID,
                            createdFor: parseMessage.toUID,
                            status: parseMessage.status
                        };
                        let lastMessage = {
                            message: parseMessage.message,
                            createdAt: parseMessage.createdAt,
                            createdBy: parseMessage.fromUID,
                            createdFor: parseMessage.toUID,
                            status: parseMessage.status
                        }
                        console.log(lastMessage)
                        await saveConversation(
                            conversationId, saveData, lastMessage
                        );
                        console.log('Successfully saved message to db');
                        break;
                    case KAFKA_TOPICS.MESSAGE_STATUS:
                        // toUID | conversationId | status
                        updateStatus(parseMessage.conversationId, parseMessage.status);
                        console.log('Successfully updated status in db');
                        break;
                    default:
                        break;
                }
            } catch (error) {
                console.log('Something went wrong while saving to db ' + error.message);
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
    startMessageConsumer,
    updateMessageStatus
};