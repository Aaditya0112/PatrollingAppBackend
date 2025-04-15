import mongoose, { Schema } from "mongoose"

const assignmentSchema = new Schema({

    // TODO : THERE MUST BE A LIST OF OFFICERS OR GROUP ASSIGNED to a work
    officer: [{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }],
    assignedAt: {
        type: Date,
        default: Date.now
    },
    startsAt: {
        type: Date,
        required: true
    },
    endsAt: {
        type: Date,
        required: true
    },
    checkpoints: [{
        type: [Number],
        required: true,
    }],
    duration: {
        type: Number,
        required: true,
    }

    // TODO add report model also
}, 
);


// Ensure virtuals are included when converting to JSON or Objects
// assignmentSchema.set("toJSON", { virtuals: true });
// assignmentSchema.set("toObject", { virtuals: true });



export const Assignment = mongoose.model("Assignment", assignmentSchema)