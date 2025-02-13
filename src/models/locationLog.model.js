import mongoose, {Schema} from "mongoose"

const locationLogSchema = new Schema({
    officer : {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    location : {
        type :{
            type : String,
            enum : ["Point"],
            required : true
        },
        coordinates : {
            type : [Number], // [longitude and latitude]
            required : true
        }
        
    }
},
{
    timestamps : true
}
)

locationLogSchema.index({ location: '2dsphere' });

export const LocationLog = mongoose.model("LocationLog", locationLogSchema)