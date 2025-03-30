import mongoose, { isValidObjectId } from "mongoose";
import { Assignment } from "../models/assignment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createAssignment = asyncHandler(async (req, res) => {
    if (req.user.role !== "ADMIN") throw new ApiError(400, "Unauthorized Access")

    const { officerIds, startsAt, endsAt, location } = req.body;

    //officerId field will get filled automatically  by selecting officer from list and will be non-editable
    //admin have to fill only startsAt, endsAt and location

    if (
        !Array.isArray(officerIds) || officerIds.length === 0 || 
        !startsAt || !endsAt || !location
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const assignment = await Assignment.create({
        officer: officerIds,
        startsAt : new Date(startsAt),
        endsAt : new Date(endsAt),
        area : location,
    })

    if (!assignment) throw new ApiError(500, "Unable to assign")

    return res.code(200)
        .send(
            new ApiResponse(200, assignment, "Assignment done successfully")
        )
})

const getAllAssignments = asyncHandler(async (req, res) => {
    
    if (req.user.role === "ADMIN") {
        const allAssignments = await Assignment.aggregate([
            {
                $lookup : {
                    from : "crimeareas",
                    localField : "area",
                    foreignField : "_id",
                    as : "area",
                }
            },
        ]) // array

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
            {
                $lookup : {
                    from : "crimeareas",
                    localField : "area",
                    foreignField : "_id",
                    as : "area"
                }
            }
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

    if(!foundAssignment) throw new ApiError(404, "Assignment not found")

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

export {
    createAssignment,
    getAllAssignments,
    getAssignment,
    updateAssignment,
    deleteAssignment
}