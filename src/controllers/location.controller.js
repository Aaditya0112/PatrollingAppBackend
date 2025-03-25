import mongoose, { isValidObjectId } from "mongoose";
import { LocationLog } from "../models/locationLog.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const updateGPS = asyncHandler(async (req, res) => {
    const {latitude, longitude} = req.body;

    const locationUpdated = await LocationLog.create({
        officer : req.user._id,
        location : {type : "Point", coordinates : [longitude, latitude]}
    })

    const createdLocationLog = await LocationLog.findById(locationUpdated._id)
    if(!createdLocationLog) throw new ApiError(500, "unable to update location on server")

    return res.code(200)
            .send(
                new ApiResponse(200, createdLocationLog, "location updated successfully" )
            )
})

const getLogs = asyncHandler(async (req, res) => {
    const {officerId, page = 1, limit =10} = req.query; // startsAt and EndsAt ke baare mein baad mein sochte hai

    if(!isValidObjectId(officerId)) throw new ApiError(400, "invalid Officer id")
    
    const logs = await LocationLog.aggregate([
        {
            $match:{
                officer: new mongoose.Types.ObjectId(officerId)
            }
        },{
            $lookup:{
                from : "users",
                localField : "officer",
                foreignField : "_id",
                as: "officer",
                pipeline : [
                    {
                        $project:{
                            name : 1,
                            badgeNumber : 1,
                            phoneNumber : 1
                        }
                    }
                ]
            }
        }
    ])

    const searchResult = await LocationLog.aggregatePaginate(logs, {page, limit})

    return res.code(200)
            .send(
                new ApiResponse(200, searchResult, "List fetched successfully")
            )
})

export {
    updateGPS,
    getLogs
}