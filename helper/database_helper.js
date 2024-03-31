const { ObjectId } = require("mongodb");
const { mongoDb, getMongodbQuery } = require("../db/mongoDb");
const { COLLECTION_NAME } = require("../constant");

async function saveEntities(collectionName, dataList) {
  let responseData = [];
  for (const element of dataList) {
    let response = await save(collectionName, element);
    responseData.push(response);
  }
  return responseData;
}

async function save(collectionName, data) {

  try {
    let res;
    let _id = null;
    if (data._id) {
      _id = ObjectId(data._id);
      delete data._id;
      res = await mongoDb().collection(collectionName).updateOne({ _id: _id }, { $set: data }, { upsert: true });
    } else if (data.uid) {
      res = await mongoDb().collection(collectionName).updateOne({ uid: data.uid }, { $set: data }, { upsert: true });
      if (res.upsertedId) {
        _id = res.upsertedId
      }
    } else {
      res = await mongoDb().collection(collectionName).insertOne(data);
      _id = res.insertedId;
    }
    return {
      success: true,
      data: { _id: _id, ...data },
      message: "inserted/updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error.message,
    };
  }

}

async function saveConversation(conversationId, message) {
  try {
    // append message to conversation
    let res = await mongoDb().collection(COLLECTION_NAME.CONVERSATIONS).updateOne(
      { _id: ObjectId(conversationId) },
      { $push: { conversation: message } },
      { upsert: true },
    );
    return res;
  } catch (error) {
    return {
      success: false,
      data: null,
      message: error.message,
    };
  }
}

module.exports = {
  saveEntities,
  save,
  saveConversation
}