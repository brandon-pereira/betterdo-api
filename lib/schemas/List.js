module.exports = (mongoose) => {
	const schema = new mongoose.Schema({
		title: {
			type: String,
			required: true
		},
		owner: {
			type: String,
			required: true
		},
		members: [String],
		type: String,
		color: {
			type: String,
			default: '#EEEEEE'
		}
	});
	return mongoose.model('list', schema);
}