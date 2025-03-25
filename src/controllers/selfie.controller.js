import { Selfie } from "../models/selfie.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteImage, uploadImage } from "../utils/selfieUtils.js";
import fs from "fs"


const sendSelfie = asyncHandler(async (req, res) => {

    // what i am thinking, in frontend user clicks button and image got stored in local storage
    // and then there will be a verify button which, on clicking, hits the endpoint with this function
    // and sends the image file in request

    const selfiePath = req.file?.path

    if(!selfiePath) throw new ApiError(400, "selfie is missing")

    // also the previous image must be deleted

    // ONE MODIFICATION  : also the selfie can immediately be deleted after getting verified
    const prevSelfie = await Selfie.find({ officer : req.user._id})
    const isDeleteSuccessful = await deleteImage(prevSelfie?.imageUrl)

    if(!isDeleteSuccessful) {
        fs.unlinkSync(selfiePath)
        throw new ApiError(500, "error while sending new selfie")
    }

    const selfie = await uploadImage(selfiePath);

    if(!selfie) throw new ApiError(500, "error in uploading the file")

    const storedSelfie = await Selfie.create({
        officer : req.user._id,
        imageUrl : selfie?.url
    })

    return res.code(200)
            .send(200, storedSelfie, "Selfie Sent")

})

const getSelfies = asyncHandler(async (req, res) => {
    if(req.user.role !== "ADMIN") throw new ApiError(400, "Unauthorized request")

    const { officerId, verified } = req.query

    let query = {};

    if (officerId) {
        query.officer = officerId;
    }

    if (verified !== undefined) {
        query.verified = verified === 'true'; 
    }

    const selfies = await Selfie.aggregate([
        {
            $match: query  // TODO doubt hai
        },
    ])

    return res.code(200)
            .send(
                new ApiResponse(
                    200, selfies, "selfies fetched"
                )
            )

})

const verifySelfie = asyncHandler(async (req, res) => {
    if(req.user.role !== "ADMIN") throw new ApiError(400, "Unauthorized request")

    const {selfieId} = req.params

    
})

export {
    sendSelfie,
    getSelfies,
    verifySelfie
}