const generateConversationId = (uid1, uid2) => {
    const sortedIds = [uid1, uid2].sort().join('-');
    return sortedIds;
}

module.exports = {
    generateConversationId
}