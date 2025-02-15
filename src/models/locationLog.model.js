import mongoose, {Schema} from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const locationLogSchema = new Schema({
    officer : {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
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
        
    }
},
{
    timestamps : true
}
)
locationLogSchema.plugin(mongooseAggregatePaginate)

locationLogSchema.index({ location: '2dsphere' });

export const LocationLog = mongoose.model("LocationLog", locationLogSchema)