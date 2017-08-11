module.exports = (mongoose) =>
	mongoose.model('Task', {
		title: String,
		listId: String,
		creator: String,
		isCompleted: Boolean,
		dueDate: String,
		notes: String,
		subtasks: [
			{
				title: String,
				isComplete: Boolean
			}
		],
		priority: Number,
		creationDate: {
			type: Date,
			default: Date.now
		},
		
	});