const { Schema } = require('mongoose');

module.exports = (mongoose) => {
	const schema = new Schema({
		title: {
			type: String,
			required: true,
			maxlength: 100,
			minlength: 1
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
		type: {
		type: String,
			default: 'default',
			enum: ['inbox', 'default'],
		},
		tasks: [
			{
				type: Schema.Types.ObjectId,
				ref: "Task"
			}
		],
		color: {
			type: String,
			default: '#EEEEEE',
			validate: {
				validator: function(v) {
					return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(v);
				},
				message: props => `${props.value} is not a hex color code!`
			},
		}
	});


	const model = mongoose.model('List', schema);

	model._create = model.create;

	model.create = async function(doc) {
		try {
			if(doc.owner) {
				doc.members = [doc.owner];
			}
			return await this._create(doc);
		} catch(err) {
			throw err;
		}
	}

	model.getLists = async function(user_id, list_id, {
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

	model.addTaskToList = async function(task_id, list_id) {
		const list = await this.findOne({_id: list_id });
		// Try adding show
		list.tasks.addToSet(task_id);
		// Save/return
		await list.save();
		return list;
	}
	
	return model;
}