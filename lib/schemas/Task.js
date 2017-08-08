module.exports = (mongoose) =>
	mongoose.model('Task', {
		title: String,
		listId: String,
		owner: String,
		isCompleted: Boolean,
		dueDate: String,
		
	});