const { Schema } = require('mongoose');

module.exports = (mongoose) => {
	const schema = mongoose.model('Task', {
		title: {
			type: String,
			required: true
		},
		list: {
			type: Schema.Types.ObjectId,
			ref: "List",
			required: true
		},
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true
		},
		isCompleted: {
			type: Boolean,
			default: false
		},
		dueDate: Date,
		notes: {
			type: String,
			default: ""
		},
		subtasks: [
			{
				title: String,
				isComplete: Boolean
			}
		],
		priority: {
			type: Number,
			default: 1
		},
		creationDate: {
			type: Date,
			default: Date.now
		}
	});

	// TODO: bind? schema._create =
	schema.createTask = async function(doc, list_id, creator) {
		return this.create({
			...doc,
			list: list_id,
			createdBy: creator
		});
	}

	return schema;
}