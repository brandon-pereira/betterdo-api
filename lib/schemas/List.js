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

	schema.getLists = async function(user_id, list_id, {
		userQueryData = undefined
	}) {
		let lists = [];
		try {
			lists = await this.find({
				...list_id ? {_id: list_id} : {},
				members: user_id
			})
				.populate('members', userQueryData)
				.populate('owner', userQueryData)
				.exec();
		} catch(err) {
			console.log("getLists returned error", err.message)
			return [];
		}
		return lists;
	}
	
	return schema;
}