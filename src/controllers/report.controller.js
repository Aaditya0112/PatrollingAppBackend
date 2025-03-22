import { Report } from "../models/report.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadImage } from "../utils/selfieUtils.js";

const submitReport = asyncHandler(async (req, res) => {
    const {location, description} = req.body

    const imagesPath = req.files?.images

    const imagesUrl = []

    if(imagesPath.length === 0){
        throw new ApiError(400, "please upload at least one image")
    }

    imagesPath.map(async (image) => {
        const uploadedImage = await uploadImage(image.path)
        if(!uploadImage) throw new ApiError(500, "error in uploading the file")
        imagesUrl.push(uploadedImage)
    })

    const createdReport = await Report.create({
        user : req.user._id,
        images : imagesUrl,
        location,
        description
    })

    if(!createdReport) throw new ApiError(500, "error in submitting report")

    return res.code(200)
            .send(
                new ApiResponse(200, createdReport, "Report Submitted")
            )
})

export {
    submitReport
}