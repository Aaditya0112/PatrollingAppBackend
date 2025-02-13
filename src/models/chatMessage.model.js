import mongoose, { Schema } from 'mongoose'

const chatMessageSchema = new mongoose.Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: "User"// TODO : check requirement
    },
    message: {
        type: string,
        required: true
    },
    assignmentId: {
        type: Schema.Types.ObjectId,
        ref: "Assignment"
    }
}, { timestamps: true });

export const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);