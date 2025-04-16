import mongoose, { isValidObjectId } from "mongoose";
import { LocationLog } from "../models/locationLog.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const updateGPS = asyncHandler(async (req, res) => {
    const {latitude, longitude} = req.body;

    const locationUpdated = await LocationLog.create({
        officer : req.user._id,
        location : [latitude, longitude],
    })

    const createdLocationLog = await LocationLog.findById(locationUpdated._id)
    if(!createdLocationLog) throw new ApiError(500, "unable to update location on server")

    return res.code(200)
            .send(
                new ApiResponse(200, createdLocationLog, "location updated successfully" )
            )
})

const getLogs = asyncHandler(async (req, res) => {
    const { officerId, page = 1, limit = 10, startTime, endTime } = req.query;

    if (!isValidObjectId(officerId)) throw new ApiError(400, "invalid Officer id");

    // Create the base match condition
    const matchCondition = {
        officer: new mongoose.Types.ObjectId(officerId)
    };

    // Add time range conditions if provided
    if (startTime || endTime) {
        matchCondition.createdAt = {};
        if (startTime) matchCondition.createdAt.$gte = new Date(startTime);
        if (endTime) matchCondition.createdAt.$lte = new Date(endTime);
    }

    const aggregationPipeline = [
        {
            $match: matchCondition
        },
        {
            $lookup: {
                from: "users",
                localField: "officer",
                foreignField: "_id",
                as: "officer",
                pipeline: [
                    {
                        $project: {
                            name: 1,
                            badgeNumber: 1,
                            phoneNumber: 1
                        }
                    }
                ]
            }
        },
        {
            $sort: { createdAt: -1 } // Optional: sort by newest first
        }
    ];

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };

    const searchResult = await LocationLog.aggregatePaginate(
        LocationLog.aggregate(aggregationPipeline),
        options
    );

    return res.status(200)
        .send(
            new ApiResponse(200, searchResult, "List fetched successfully")
        );
});

export {
    updateGPS,
    getLogs
}