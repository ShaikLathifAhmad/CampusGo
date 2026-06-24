const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Location name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    lat: {
        type: Number,
        required: [true, 'Latitude is required']
    },
    lng: {
        type: Number,
        required: [true, 'Longitude is required']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters'],
        default: ''
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Location', locationSchema);
