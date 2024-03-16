const { ObjectId } = require("mongodb");
const { mongoDb, getMongodbQuery } = require("../db/mongoDb");

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
      res = await mongoDb().collection(collectionName).updateOne({ _id: _id }, { $set: data }, { upsert: false });
    } else {
      res = await mongoDb().collection(collectionName).updateOne({ uid: data.uid }, { $set: data }, { upsert: true });
      if (res.upsertedId) {
        _id = res.upsertedId
      }
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

module.exports = {
  saveEntities,
  save
}