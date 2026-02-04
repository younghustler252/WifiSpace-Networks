const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true
	},
	seq: {
		type: Number,
		default: 0
	}
});

const Counter =
	mongoose.models.Counter ||
	mongoose.model("Counter", counterSchema);

async function generateWsnId() {
	const counter = await Counter.findOneAndUpdate(
		{ name: "wsn" },
		{ $inc: { seq: 1 } },
		{ new: true, upsert: true }
	);

	return "WSN" + String(counter.seq).padStart(3, "0");
}

module.exports = generateWsnId;



// OLD VERSION

// const mongoose = require("mongoose");

// async function generateWsnId() {
// 	const User = mongoose.models.User;

// 	const lastUser = await User.findOne({ wsnId: { $ne: null } })
// 		.sort({ wsnId: -1 })
// 		.exec();

// 	let nextNumber = 1;

// 	if (lastUser && lastUser.wsnId) {
// 		const lastNumber = parseInt(
// 			lastUser.wsnId.replace("WSN", ""),
// 			10
// 		);
// 		nextNumber = lastNumber + 1;
// 	}

// 	return "WSN" + String(nextNumber).padStart(3, "0");
// }

// module.exports = generateWsnId;
