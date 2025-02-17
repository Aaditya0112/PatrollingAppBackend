import { asyncHandler } from "../utils/asyncHandler.js";

const getOfficersNearBy = asyncHandler(async (req, res) => {
    const {lat, long, radius} = req.query;

    
})
const getAssignments = asyncHandler(async (req, res) => {
    const {isActive} = req.query
})