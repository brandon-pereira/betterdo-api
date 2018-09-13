// const { Schema } = require('mongoose');
module.exports = (mongoose) => {
	const schema = mongoose.model('User', {
		google_id: String,
		firstName: {
			type: String,
			required: true
		},
		lastName: String,
		creationDate: {
			type: Date,
			default: Date.now
		},
		profilePicture: String,
		lastLogin: {
			type: Date,
			default: Date.now
		},
		isBeta: {
			type: Boolean,
			default: false
		}
	});

	// TODO: base this off internal ids (if possible?)
	schema.findOrCreate = async function(id, doc) {
		const result = await this.findOne({ google_id: id });
		if (result) {
			return result;
		} else {
			return await this.create(doc);
		}
	};
	
	return schema;
}