module.exports = (mongoose) => {
	const schema = mongoose.model('User', {
		google_id: String,
		firstName: String,
		lastName: String,
		email: String,
		creationDate: {
			type: Date,
			default: Date.now
		},
		profilePicture: String,
		lastLogin: Date,
		isBeta: {
			type: Boolean,
			default: false
		}
	});

	schema.findOrCreate = function(id, doc, callback) {
		this.findOne({google_id: id}, (err, result) => {
			if(result) {
				callback(err, result)
			} else {
				this.create(doc, (err, result) => callback(err, result));
			}
		});
	}
	
	return schema;
}