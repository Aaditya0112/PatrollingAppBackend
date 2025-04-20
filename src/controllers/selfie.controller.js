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

    const { assignmentId } = req.params;

    const parts = req.parts();
    const fields = {};
    const files = [];

    for await (const part of parts) {
        if (part.type === 'file') {

            // Handle file parts
            files.push({
                fieldname: part.fieldname,
                filename: part.filename,
                data: await part.toBuffer(), // or use part.file for stream
                mimetype: part.mimetype
            });
        } 
    }

    // if (!selfiePath) throw new ApiError(400, "selfie is missing")
    // also the previous image must be deleted

    // ONE MODIFICATION  : also the selfie can immediately be deleted after getting verified
    const prevSelfie = await Selfie.find({ officer: req.user._id })
    if(prevSelfie != null){
        await deleteImage(prevSelfie?.imageUrl),
        await Selfie.deleteOne({ officer: req.user._id })
    }
    // console.log(files)


    try {
        const image = files[0]
        const uploadedImage = await uploadImage(image.mimetype, image.data.toString('base64'));
        console.log("Uploaded image URL:", uploadedImage.url);

        if (!uploadedImage || !uploadedImage.url) {
            throw new ApiError(500, "error in uploading the file")
        }

        const storedSelfie = await Selfie.create({
            officer: req.user._id,
            assignment: assignmentId,
            imageUrl: uploadedImage.url
        })
        if(!storedSelfie){
            throw new ApiError(500, "error in uploading image to admin")
        }

        return res.code(200)
            .send(200, storedSelfie, "Selfie Sent")
    } catch (error) {
        console.error("Error uploading image:", error);
        throw new ApiError(500, "Failed to upload one or more images");
    }

})

const getSelfies = asyncHandler(async (req, res) => {
    if (req.user.role !== "ADMIN") throw new ApiError(400, "Unauthorized request")

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
    if (req.user.role !== "ADMIN") throw new ApiError(400, "Unauthorized request")

    const { selfieId } = req.params

    const UpdatedVerificationStatus= await Selfie.findByIdAndUpdate(
        selfieId,
        {
            $set : {
                verified : true
            }
        },
        {
            new : true
        }
    )

    if(!UpdatedVerificationStatus) {
        throw new ApiError(400, "Unable to verify")
    }

    return res.code(201)
            .send(
                new ApiResponse(201, UpdatedVerificationStatus, "Verified")
            )
})

export {
    sendSelfie,
    getSelfies,
    verifySelfie
}