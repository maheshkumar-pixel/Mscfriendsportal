const mongoose = require('mongoose');

// Correct the schema definition
const teacherSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Removed the `+` that was invalid
    designation: { type: String, required: true },
    educationalinfo: { type: String, required: true },
    joindate: { type: String, required: true },
    image_url: String,
    imageOriginalname: String,
    
});

// Export the model
module.exports = mongoose.model('teachers', teacherSchema); // Corrected variable name
