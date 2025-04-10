import { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { CrimeArea } from "../models/crimeArea.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addCrimeArea = asyncHandler(async (req, res) => {
    if(req.user.role !== "ADMIN") throw new ApiError(400, "Unauthorized request")

    const {name, description, areaType, long, lat, crimeRate} = req.body // TODO test area field

    if(
        [name, description, areaType, long, lat].some((field) => field.trim() === "")
    ) {
        throw new ApiError(400, "All Fields are required")
    }

    const area = await CrimeArea.create({
        name,
        description,
        area : {type : areaType, coordinates :{longitude : long, latitude : lat}},
        crimeRate
    })

    if(!area) throw new ApiError(500, "unable to add area")

    return res.code(201)
            .send(
                new ApiResponse(201, area, "Area Added Successfully")
            )
})

const getAllCrimeAreas = asyncHandler(async (req, res) =>{
    // TODO can use aggregate paginate

    const allAreas =  await CrimeArea.find();

    return res.code(200)
            .send(
                new ApiResponse(200, allAreas, "All areas fetched")
            )
})

const getCrimeArea = asyncHandler(async (req, res) => {
    const {areaId} = req.params
    if(!isValidObjectId(areaId)) throw new ApiError(400, "invalid area id")

    const area = await CrimeArea.findById(areaId)
    if(!area) throw new ApiError(404, "area not found")

    return res.code(200)
            .send(
                new ApiResponse(200, area, "area fetched")
            )
    
    
})

const updateAreaDetails = asyncHandler (async (req, res) =>{
    if(req.user.role !== "ADMIN") throw new ApiError(400, "Unauthorized request")

    const {areaId} = req.params
    if(!isValidObjectId(areaId)) throw new ApiError(400, "invalid area id")

    const area = await CrimeArea.findById(areaId)
    if(!area) throw new ApiError(404, "area not found")

    const {description, crimeRate} = req.body // TODO discuss the req.body

    if(!description) throw new ApiError(400, "All fields are Required")

    const updatedArea = await CrimeArea.findByIdAndUpdate(
        areaId,
        {
            description,
            crimeRate
        }, 
        {
            new : true
        }
    )

    return res.code(200)
            .send(
                new ApiResponse(200, updatedArea, "Area details updated")
            )


})

const deleteArea = asyncHandler(async (req, res) => {
    if(req.user.role !== "ADMIN") throw new ApiError(400, "Unauthorized request")

    const {areaId} = req.params
    if(!isValidObjectId(areaId)) throw new ApiError(400, "invalid area id")

    const area = await CrimeArea.findById(areaId)
    if(!area) throw new ApiError(404, "area not found")

    await CrimeArea.findByIdAndDelete(areaId)

    return res.code(200)
            .send(
                new ApiResponse(204, {}, "Area deleted")
            )

})

export{
    addCrimeArea,
    getAllCrimeAreas,
    getCrimeArea,
    updateAreaDetails,
    deleteArea
}

