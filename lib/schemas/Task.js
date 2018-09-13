const { Schema } = require('mongoose');

module.exports = (mongoose) =>
	mongoose.model('Task', {
		title: {
			type: String,
			required: true
		},
		list: {
			type: Schema.Types.ObjectId,
			ref: "Task",
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
		},
		
	});