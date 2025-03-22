import mongoose, {Mongoose, Schema} from 'mongoose'

const reportSchema = new mongoose.Schema({
    user : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    images: [
        {
            type: String,
            required : true
        }
    ],
    location : {
        type :{
            type : String,
            enum : ["Point", "Polygon"],
            required : true
        },
        coordinates : {
            type : Array, // [longitude and latitude]
            required : true
        }
    },
    description : {
        type : String,
        required : true
    }
    
}, { timestamps: true });

export const Report = mongoose.model('Report', reportSchema);