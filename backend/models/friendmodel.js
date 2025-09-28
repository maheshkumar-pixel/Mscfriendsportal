const mongoose = require('mongoose');

// Correct the schema definition
const friendSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Removed the `+` that was invalid
    Firstfriend: { type: String, required: true },
    inspiration: { type: String, required: true },
    opinion: { type: String, required: true },
     batch: { type: String, required: true },
    image_url: String,
    imageOriginalname: String,
    videofile: String
});

// Export the model
module.exports = mongoose.model('friends', friendSchema); // Corrected variable name
