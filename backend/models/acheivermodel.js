const mongoose = require('mongoose');

// Correct the schema definition
const acheiverSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Removed the `+` that was invalid
    achievement: { type: String, required: true },
    year: { type: String, required: true },
    batch: { type: String, required: true },
    image_url: String,
    imageOriginalname: String,
    
});

// Export the model
module.exports = mongoose.model('acheivers', acheiverSchema); // Corrected variable name
