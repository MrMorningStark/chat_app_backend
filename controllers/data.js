const { COLLECTION_NAME } = require("../constant");
const { mongoDb } = require("../db/mongoDb");
const { saveEntities, save } = require("../helper/database_helper");

const saveData = async (req, res) => {
    try {
        const collectionName = req.params.collectionName;
        const data = req.body;

        if (data == undefined) {
            return res
                .status(400)
                .json({ success: false, message: `Invalid data passed` });
        }

        let response;
        if (Array.isArray(data)) {
            response = await saveEntities(collectionName, data);

            res.status(200).json({
                success: true,
                message: "Data Updated/Inserted Completed",
                data: response
            });
        }
        else {
            response = await save(collectionName, data);
            if (response.success) res.status(200).json(response);
            else res.status(500).json(response);
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const searchUser = async (req, res) => {
    try {
        const searchKey = req.params.searchKey;

        if (searchKey == undefined) {
            return res
                .status(400)
                .json({ success: false, message: `Invalid data passed` });
        }

        let response = await mongoDb().collection(COLLECTION_NAME.USERS).find(
            {
                $or: [
                    { displayName: { $regex: "^" + searchKey, $options: "i" } },
                    { email: { $regex: "^" + searchKey, $options: "i" } },
                ]
            }
        ).toArray();

        return res.status(200).json({
            success: true,
            message: "",
            data: response
        });

    } catch (error) {
        res.status(500).json({ success: false, data: null, message: error.message });
    }
};


module.exports = {
    saveData,
    searchUser
}