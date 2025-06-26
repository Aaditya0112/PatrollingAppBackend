import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    badgeNumber: {
        type: String,
        required: true,
        unique: true
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        min:8,
        max:8
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
    role: {
        type: String,
        enum: ["GENERAL", "ADMIN"],
        required: true
    },
    assignedGroup : { // TODO the name of assignment would be better as name of grou[p]
        type : String,
        default : "none"
    },
    fcmToken : {
        type : String
    }
},
{
    timestamps : true
}
)

userSchema.pre('save', async function (next) {

    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isCorrectPassword = async function (password) {
    return await bcrypt.compare(password, this.password)
}
export const User = mongoose.model("User", userSchema);