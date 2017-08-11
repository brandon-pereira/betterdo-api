module.exports = (mongoose) => {
	const schema = new mongoose.Schema({
		title: String,
		owner: String,
		members: [String],
		type: String,
		color: {
			type: String,
			default: '#EEEEEE'
		}
	});
	return mongoose.model('list', schema);
}