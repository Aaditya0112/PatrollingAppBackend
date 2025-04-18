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

    if (!isValidObjectId(officerId)) {
        throw new ApiError(400, "Invalid Officer ID");
    }

    // Debug: Log the received query parameters
    console.log('Query params:', { officerId, page, limit, startTime, endTime });

    // Create the base match condition
    const matchCondition = {
        officer: new mongoose.Types.ObjectId(officerId)
    };

    // Handle time filtering
    if (startTime || endTime) {
        const timeCondition = {};
        
        if (startTime) {
            const startDate = new Date(startTime);
            console.log(startDate.toISOString());
            
            if (isNaN(startDate.getTime())) {
                throw new ApiError(400, "Invalid startTime format");
            }
            timeCondition.$gte = new Date(startDate.toISOString());
            console.log('Start date:', startDate);
        }

        if (endTime) {
            const endDate = new Date(endTime);
            if (isNaN(endDate.getTime())) {
                throw new ApiError(400, "Invalid endTime format");
            }
            timeCondition.$lt = new Date(endDate.toISOString());
            console.log('End date:', endDate);
        }

        matchCondition.createdAt = timeCondition;
    }

    console.log('Final match condition:', matchCondition);

    // TODO always have to provide local time in query

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
            $sort: { createdAt: -1 }
        }
    ];

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    };

    try {
        const searchResult = await LocationLog.aggregatePaginate(
            LocationLog.aggregate(aggregationPipeline),
            options
        );

        console.log('Search result count:', searchResult.totalDocs);

        return res.status(200).send(
            new ApiResponse(200, searchResult, "Location logs fetched successfully")
        );
    } catch (error) {
        console.error('Error in aggregation:', error);
        throw new ApiError(500, "Failed to fetch location logs");
    }
});


export {
    updateGPS,
    getLogs
}