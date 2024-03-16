// mongo db
const { MongoClient, ObjectId } = require('mongodb');
const URI = process.env.MONGO_DB_URI
const DB_NAME = process.env.DB_NAME

var client = null;

function open() {
    client = new MongoClient(URI)
    return client;
}
async function mongoClose() {
    try {
        await client.close();
        client = null;
        return { success: true, message: 'connection closed' }
    } catch (error) {
        return { success: false, message: error.message }
    }
}
const mongoDb = () => {
    var myClient;
    if (client == null) {
        myClient = open();
    } else {
        myClient = client;
    }
    const dbo = myClient.db(DB_NAME)
    return dbo;
}
const getMongodbQuery = (query) => {
    var mongodbQuery = []
    const operators = ["=", "!=", "<", "<=", ">", ">=", "like", "elemMath"];
    const mongodbOperators = ["$eq", "$ne", "$lt", "$lte", "$gt", "$gte", "$regex"];

    const getSingleQuery = (start, operator, end) => {
        if (start === '_id') {
            end = ObjectId(end);
        }
        for (let i = 0; i < operators.length; i++) {
            if (operator === operators[i]) {
                return { [start]: { [mongodbOperators[i]]: end } };
            }
        }
        // Handle the $in operator
        if (operator === 'in') {
            return { [start]: { $in: end } };
        } else if (operator === 'elemMatch') {
            return { [start]: { $elemMatch: end } };
        }
        return { SID: { $gt: 0 } };
    }

    if (query === undefined) {
        return {};
    } else if (typeof query[0] === 'string') {
        return getSingleQuery(query[0], query[1], query[2]);
    } else if (query.length === 0) {
        return { SID: { $gt: 0 } };
    } else {
        query.forEach(singleQuery => {
            mongodbQuery.push(getSingleQuery(singleQuery[0], singleQuery[1], singleQuery[2]));
        });

        if (query.length === 1) {
            return mongodbQuery[0];
        } else {
            return { $and: mongodbQuery };
        }
    }
}


const createCollection = async (tableName) => {
    await mongoDb().createCollection(tableName);
}
const isCollectionExists = async (tableName) => {
    const collection = await mongoDb().listCollections({ name: tableName }).toArray()
    return collection.length > 0 ? true : false
}


module.exports = {
    mongoDb,
    mongoClose,
    getMongodbQuery,
    createCollection,
    isCollectionExists,
}