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
    // token: {
    //     type: String,
    // }
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

// userSchema.methods.generateToken = function () {
    // return jwt.sign(
    //     {
    //         _id: this._id,
    //         name: this.name,
    //         role: this.role,
    //     },
    //     process.env.TOKEN_SECRET,
    //     {
    //         expiresIn: process.env.TOKEN_EXPIRY
    //     }
    // )
// }


export const User = mongoose.model("User", userSchema);