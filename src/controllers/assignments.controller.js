import mongoose, { isValidObjectId } from "mongoose";
import { Assignment } from "../models/assignment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import axios from "axios";
import { getFCMAccessToken } from "../utils/fcmAuth.js";

const createAssignment = asyncHandler(async (req, res) => {
    if (req.user.role !== "ADMIN") throw new ApiError(400, "Unauthorized Access")

    const { officerIds, startsAt, endsAt, location, duration } = req.body;

    if (
        !Array.isArray(officerIds) || !Array.isArray(location) || officerIds.length === 0 ||
        !startsAt || !endsAt || location.length === 0 || !duration
    ) {
        throw new ApiError(400, "All fields are required")
    }

    // Convert local time strings to Date objects and then to UTC
    const localStart = new Date(startsAt);
    const localEnd = new Date(endsAt);
    const utcStart = new Date(localStart.toISOString());
    const utcEnd = new Date(localEnd.toISOString());

    const assignment = await Assignment.create({
        officer: officerIds,
        startsAt: utcStart,
        endsAt: utcEnd,
        checkpoints: location,
        duration,
    })

    if (!assignment) throw new ApiError(500, "Unable to assign");

    // Get officers with FCM tokens
    const officers = await User.find({ 
        _id: { $in: officerIds },
        fcmToken: { $exists: true, $ne: null }
    });

    // Prepare notification promises
    const notificationPromises = officers.map(async (officer) => {
        try {
            // Format dates for display
            const startTime = localStart.toLocaleString("en-US", { timeZone: "IST" }    );
            const endTime = localEnd.toLocaleString("en-US", { timeZone: "IST" });

            // Get FCM access token (implementation shown below)
            const accessToken = await getFCMAccessToken();     
            console.log(officer.fcmToken)
            const response = await axios.post(
                `https://fcm.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/messages:send`,
                {
                    message: {
                        token: officer.fcmToken,
                        notification: {
                            title: 'New Patrol Assignment',
                            body: `You have a patrol from ${startTime} to ${endTime} at ${location.join(', ')}`
                        },
                        data: {
                            type: 'assignment',
                            assignmentId: assignment._id.toString(),
                            startsAt: utcStart.toISOString(),
                            latitude : `${assignment.checkpoints[0][0]}`,
                            longitude : `${assignment.checkpoints[0][1]}`,
                            endsAt: utcEnd.toISOString(),
                            action: 'FLUTTER_NOTIFICATION_CLICK'
                        },
                        android: {
                            priority: 'high',
                            // content_available: true
                        },
                        apns: {
                            headers: {
                                'apns-priority': '10'
                            }
                        }
                    }
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    timeout: 5000 // 5 second timeout
                }
            );
            
            return {
                success: true,
                officerId: officer._id,
                messageId: response.data.name
            };
        } catch (error) {
            console.error(`Failed to notify officer ${officer._id}:`, error);
            return {
                success: false,
                officerId: officer._id,
                error: error.message
            };
        }
    });

    // Execute all notifications in parallel
    const notificationResults = await Promise.all(notificationPromises);
    
    // Count successful notifications
    const successfulNotifications = notificationResults.filter(r => r.success).length;
    
    // Optionally log failed notifications
    const failedNotifications = notificationResults.filter(r => !r.success);
    if (failedNotifications.length > 0) {
        console.warn('Failed to notify some officers:', failedNotifications);
    }

    return res.status(200).send(
        new ApiResponse(200, {
            assignment,
            notifications: {
                total: officers.length,
                successful: successfulNotifications,
                failed: failedNotifications.length
            }
        }, "Assignment created successfully")
    );
});

// Helper function to get FCM access token

const getAllAssignments = asyncHandler(async (req, res) => {

    if (req.user.role === "ADMIN") {
        const allAssignments = await Assignment.aggregate([
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
                                assignedGroup: 1,
                                phoneNumber: 1
                            }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "selfies",
                    localField: "_id",
                    foreignField: "assignment",
                    as: "imageData",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "officer",
                                foreignField: "_id",
                                as: "officer",
                                pipeline: [
                                    {
                                        $project: {
                                            "_id": 1,
                                            "name": 1
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $addFields: {
                                officer: {
                                    $first: "$officer"
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                officer: 1,
                                imageUrl: 1,
                                verified: 1,
                                imgLat: 1,
                                imgLon: 1,
                                createdAt: 1,
                            }
                        }
                    ]
                }
            },
        ])

        //TODO errors aa sakte hai isActive ke regarding as it is virtual field
        // thodi problems ho sakti hai active and inactive ko leke

        return res.code(200)
            .send(
                new ApiResponse(200, allAssignments, "All assignments fetched")
            )
    }

    if (req.user.role === "GENERAL") {
        const userAllAssignments = await Assignment.aggregate([
            {
                $match: {
                    officer: new mongoose.Types.ObjectId(req.user._id),
                }
            },
            // {
            //     $lookup : {
            //         from : "crimeareas",
            //         localField : "area",
            //         foreignField : "_id",
            //         as : "area"
            //     }
            // },
            // {
            //     $addFields: {
            //         area : {$first : "$area"}
            //     }
            // }
        ])

        return res.code(200)
            .send(
                new ApiResponse(200, userAllAssignments, "user-respective assignments fetched")
            )
    }

})

const getAssignment = asyncHandler(async (req, res) => {
    const { assignmentId } = req.params;

    if (!isValidObjectId(assignmentId)) throw new ApiError(400, "invalid assignment id")

    const foundAssignment = await Assignment.findById(assignmentId)

    if (!foundAssignment) throw new ApiError(404, "Assignment not found")

    if (req.user.role === "ADMIN") {

        return res.code(200)
            .send(
                new ApiResponse(200, foundAssignment, "Assignment found")
            )
    }

    if (req.user.role === "GENERAL" && foundAssignment.officer === req.user._id) {

        return res.code(200)
            .send(
                new ApiResponse(200, foundAssignment, "User found")
            )
    }

    throw new ApiError(400, "Unauthorized access to assignment")



})

const updateAssignment = asyncHandler(async (req, res) => {
    const { assignmentId } = req.params;
    if (!isValidObjectId(assignmentId)) throw new ApiError(400, "invalid assignment id")

    if (req.user.role !== "ADMIN") throw new ApiError(400, "Unauthorized Access")

    // what i thought : there will be an update button, on clicking that button 
    // navigate to a new page with a form with the same officerId and also one button to change officer
    // on clicking that button, will open a list of officers and further same process as creating assignment
    // same for crime Area selection

    const { endsAt, location } = req.body

    if (!endsAt && !location) throw new ApiError(400, "All fields are required")

    const updatedAssignment = await Assignment.findByIdAndUpdate(
        assignmentId,
        {
            $set: {
                endsAt,
                location
            }
        },
        {
            new: true
        }
    )


    //also we can track the history of particular assignment

    return res.code(200)
        .send(
            new ApiResponse(200, updatedAssignment, "Assignment updated successfully")
        )
})

const deleteAssignment = asyncHandler(async (req, res) => {
    const { assignmentId } = req.params;
    if (!isValidObjectId(assignmentId)) throw new ApiError(400, "invalid assignment id")

    if (req.user.role !== "ADMIN") throw new ApiError(400, "Unauthorized Access")

    const assignmentFound = await Assignment.findById(assignmentId)

    if (!assignmentFound) throw new ApiError(404, "Assignment not found")

    await Assignment.findByIdAndDelete(assignmentId)

    return res.code(204)
        .send(
            new ApiResponse(204, {}, "Assignment deleted successfully")
        )
})

const checkImageVerification = asyncHandler(async (req, res) => {

})
export {
    createAssignment,
    getAllAssignments,
    getAssignment,
    updateAssignment,
    deleteAssignment
}