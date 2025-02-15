import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const token = jwt.sign(
            {
                _id: user._id,
                name: user.name,
                role: user.role,
            },
            process.env.TOKEN_SECRET,
            {
                expiresIn: process.env.TOKEN_EXPIRY
            }
        )

        return token

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating the tokens")
    }
}

const registerUser = asyncHandler(async (req, res) =>{
    const {name, badgeNumber, phoneNumber, password, role} = req.body;

    if(
        [name, badgeNumber, phoneNumber, password, role].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "all fields are required")
    }

    const existingUser = await User.findOne({
        $or :[
        {badgeNumber},
        {phoneNumber}
    ]
    })

    if(existingUser) throw new ApiError(400, "User already exists")

    const user = await User.create({
        name,
        badgeNumber,
        phoneNumber,
        password,
        role
    })

    const createdUser = await User.findById(user._id).select("-password ")

    if(!createdUser) throw new ApiError(500, "Error while registering the User")

    return res.code(202)
        .send(
            new ApiResponse(200, createdUser, "User registered Successfully")
        )
})

const loginUser = asyncHandler(async(req, res) =>{
    const {phoneNumber, password} = req.body;

    if(
        [phoneNumber, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findOne({
        phoneNumber
    })

    if(!user) throw new ApiError(404, "User not found")
    
    const isValidPassword = await user.isCorrectPassword(password);

    if(!isValidPassword) throw new ApiError(401, "Password is incorrect")

    const token = await generateToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password")

    const cookieOptions = {
        httpOnly : true,
        secure : true,
        path : "/"
    }

    
    return res.code(200)
        .header(
            'Authorization', `Bearer ${token}`
        )
        .cookie("Token", token, cookieOptions)
        .send(
            new ApiResponse(200, {user : loggedInUser, Token : token}, "Logged in Successfully")
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    const cookieOptions = {
        httpOnly : true,
        secure : true,
        path : "/" 
    }

    return res
        .removeHeader('Authorization')
        .clearCookie("Token", cookieOptions)
        .code(200)
        .send(
            new ApiResponse(200, {}, "Logged out successfully")
        )

})

const getUser = asyncHandler(async (req, res) => {
    return res.code(200).send(
        new ApiResponse(200, req.user, "User fetched Successfully")
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    getUser
}