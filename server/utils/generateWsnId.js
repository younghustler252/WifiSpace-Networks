const mongoose = require("mongoose");

async function generateWsnId() {
    const User = mongoose.models.User;  // safer than require()

    // Find latest user by wsnId
    const lastUser = await User.findOne({ wsnId: { $ne: null } })
        .sort({ wsnId: -1 })
        .exec();

    let nextNumber = 1;

    if (lastUser && lastUser.wsnId) {
        const lastNumber = parseInt(lastUser.wsnId.replace('wsn', ''));
        nextNumber = lastNumber + 1;
    }

    return "wsn" + String(nextNumber).padStart(3, '0');
}

module.exports = generateWsnId;
