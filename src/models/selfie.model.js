import mongoose, {Schema} from 'mongoose'

const selfieSchema = new mongoose.Schema({
    officer: {
        type: Schema.Types.ObjectId,
        ref : "User",
        required: true
    },
    assignment: {
        type : Schema.Types.ObjectId,
        ref : "Assignment",
        required : true
    },
    imageUrl : {
        type : String,
        required : true,
    },
    imgLocation : {
        type : [Number],
        required : true
    },
    verified : {
        type : Boolean,
        default : false,
    }
    
}, { timestamps: true });

export const Selfie = mongoose.model('Selfie', selfieSchema);