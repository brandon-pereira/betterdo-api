module.exports = (mongoose) => {
	const schema = new mongoose.Schema({
		title: String,
		owner: String,
		members: Array,
		type: String
	});
	return mongoose.model('list', schema);
}