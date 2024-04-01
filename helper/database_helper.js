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

async function saveConversation(conversationId, message, lastMessage) {
  try {
    await mongoDb().collection(COLLECTION_NAME.CONVERSATIONS).updateOne(
      { _id: conversationId },
      { $push: { conversation: message }, $set: { lastMessage: lastMessage, createdAt: lastMessage.createdAt } },
      { upsert: true },
    );
  } catch (error) {
    console.log('error while saving message to db', error.message);
  }
}

async function getRecentChats(userUID) {
  let response = await mongoDb().collection(COLLECTION_NAME.CONVERSATIONS).find(
    {
      $or: [
        { "lastMessage.createdBy": userUID },
        { "lastMessage.createdFor": userUID }
      ]
    }
  ).sort({ createdAt: -1 }).project({ lastMessage: 1, _id: 0 }).toArray();
  // now for each conversation we need to get user details from users collection
  response = await Promise.all(response.map(async (conversation) => {
    const createdBy = conversation.lastMessage.createdBy;
    const createdFor = conversation.lastMessage.createdFor;
    let otherUserId = createdBy == userUID ? createdFor : createdBy;
    let userDetails = await mongoDb().collection(COLLECTION_NAME.USERS).findOne({ uid: otherUserId });
    return { ...userDetails, lastMessage: conversation.lastMessage };
  }));
  return response;
}

module.exports = {
  saveEntities,
  save,
  saveConversation,
  getRecentChats
}