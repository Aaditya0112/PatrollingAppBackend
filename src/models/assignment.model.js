import mongoose, {Schema} from "mongoose"

const assignmentSchema = new Schema({
    officer : {
        type : Schema.Types.ObjectId,
        ref : "User",
        required : true,
    },
    assignedAt : {
        type: Date,
        default : Date.now
    },
    startsAt : {
        type : Date,
        required : true
    },
    endsAt : {
        type : Date,
        required : true
    },
    location : {
        type: {
            type : String,
            enum : ["Point", "Polygon"],
            required : true
        },
        coordinates : {
            type : Array,
            required : true
        }
        // TODO check
    }
});

assignmentSchema.index({location : "2dsphere"});

export const Assignment = mongoose.model("Assignment", assignmentSchema)