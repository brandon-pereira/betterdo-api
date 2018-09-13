const { Schema } = require('mongoose');

module.exports = (mongoose) => {
	const schema = mongoose.model('List', {
		title: {
			type: String,
			required: true
		},
		owner: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true
		},
		members: [
			{
				type: Schema.Types.ObjectId,
				ref: "User"
			}
		],
		type: String,
		color: {
			type: String,
			default: '#EEEEEE'
		}
	});
	
	return schema;
}