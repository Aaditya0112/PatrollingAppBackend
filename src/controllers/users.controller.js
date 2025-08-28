import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { isValidObjectId } from "mongoose";

const getUsers = asyncHandler(async (req, res) => {
    if(req.user.role !== "ADMIN") throw new ApiError("400", "Unauthorized access")
    
    const users = await User.aggregate([
        {
            $match : {
                role : "GENERAL"
            }
        }, {
            $project:{
                password : 0,
                fcmToken : 0
            }
        }
    ])
    
    return res.code(200)
            .send(
                new ApiResponse(200, users, "List of Users fetched successfully")
            )
})

const getUserDetails = asyncHandler( async (req, res) => {
    const {userId} = req.params;
    if(!isValidObjectId(userId)) throw new ApiError(400, "invalid user id")
            
    if(req.user._id.toString() === userId) {
            return res.code(200)
            .send(
                new ApiResponse(200, req.user, "User found")
            )
    }

    if(req.user.role === "ADMIN") {
        const foundUser  = await User.findById(userId).select("-password")
        return res.code(200)
                .send(
                    new ApiResponse(200, foundUser, "User found")
                )
    }

    

    throw new ApiError(400, "Unauthorized access to user details")



})

const updateUserDetails = asyncHandler(async (req, res) => {
    // each user updates it details on  his own and no extra previlage to admin given
    
    const {userId} = req.params;
    if(!isValidObjectId(userId)) throw new ApiError(400, "invalid user id")

    const {name, phoneNumber } = req.body;

    if(!name && !phoneNumber) throw new ApiError(400, "All fields are required")

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set :{
                name,
                phoneNumber
            }
        },
        {
            new : true
        }
    ).select("-password")

    return res.code(200)
            .send(
                new ApiResponse(200, user, "User details updated")
            )
})

const changePassword = asyncHandler(async (req, res) => {

    const {oldPassword, newPassword} = req.body;

    //keep a check on frontend for the fields not to be empty
    const user = await User.findById(req.user?._id)

    if(!user) throw new ApiError(404, "User not found")

    const isOldPasswordCorrect = await user?.isCorrectPassword(oldPassword)

    if(!isOldPasswordCorrect) throw new ApiError(400, "Incorrect old password")

    user.password = newPassword;
    await user.save({validateBeforeSave : false})

    return res.code(200)
            .send(
                new ApiResponse(200, {}, "Password updated successfully")
            )
    
})

const deleteUser = asyncHandler(async (req, res) => {

    const {userId} = req.params;
    if(!isValidObjectId(userId)) throw new ApiError(400, "invalid user id")

    if(req.user.role !== "ADMIN") throw new ApiError(400, "Unauthorized request")
    
    const user = await User.findById(userId)

    if(!user) throw new ApiError(400, "User not Found")
    
    await User.findByIdAndDelete(userId)

    return res.code(204)
            .send(
                new ApiResponse(204, {}, "User deleted Successfully")
            )
})

const otpBasedPasswordChange = asyncHandler(async (req, res) => {
    const {otpStatus, userId, newPassword} = req.body
    
    if (!isValidObjectId(userId)) throw new ApiError(400, "invalid user id")

    if(!otpStatus) throw new ApiError(401, "Unauthorized access to Password Change")


    //keep a check on frontend for the fields not to be empty
    const user = await User.findById(userId)

    if(!user) throw new ApiError(404, "User not found")

    user.password = newPassword;
    await user.save({validateBeforeSave : false})

    return res.code(200)
            .send(
                new ApiResponse(200, {}, "Password updated successfully")
            )
})

export{
    getUsers,
    getUserDetails,
    updateUserDetails,
    changePassword,
    deleteUser,
    otpBasedPasswordChange
}