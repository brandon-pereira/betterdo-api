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
		tasks: [
			{
				type: Schema.Types.ObjectId,
				ref: "Task"
			}
		],
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
			lists = this.find({
				...list_id ? {_id: list_id} : {},
				members: user_id
			})
				.populate('members', userQueryData)
				.populate('owner', userQueryData)
			if(list_id) {
				lists = lists.populate('tasks')
			}
			lists = await lists.exec();
		} catch(err) {
			console.log("getLists returned error", err.message)
			return [];
		}
		return lists;
	}

	schema.addTaskToList = async function(task_id, list_id) {
		const list = await this.findOne({_id: list_id });
		// Try adding show
		list.tasks.addToSet(task_id);
		// Save/return
		await list.save();
		return list;
	}
	
	return schema;
}