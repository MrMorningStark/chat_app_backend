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
        const uid = req.body.uid;

        if (searchKey == undefined || uid == undefined) {
            return res
                .status(400)
                .json({ success: false, message: `Invalid data passed` });
        }

        let response = await mongoDb().collection(COLLECTION_NAME.USERS).find(
            {
                $or: [
                    { displayName: { $regex: "^" + searchKey, $options: "i" } },
                    { email: { $regex: "^" + searchKey, $options: "i" } },
                ],
                uid: { $ne: uid }
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

const usersExist = async (req, res) => {
    try {
        const { users } = req.body;

        const updatedUsersList = [];

        for (let i = 0; i < users.length; i++) {
            let user = users[i];
            user.phoneNumber = user.phoneNumber.replace('+91', '').trim();
            let response = await mongoDb().collection(COLLECTION_NAME.USERS).findOne({ phoneNumber: user.phoneNumber.toString() })
            if (response) {
                user.displayName = response.displayName;
                user.photoURL = response.photoURL;
                user.email = response.email;
                user.uid = response.uid;
                user.isUserExist = true;
            }
            else {
                user.isUserExist = false;
            }

            updatedUsersList.push(user);

        }

        res.status(200).json({ success: true, data: updatedUsersList, message: null });
    } catch (error) {
        res.status(500).json({ success: false, data: null, message: error.message });
    }

}

module.exports = {
    saveData,
    searchUser,
    usersExist
}