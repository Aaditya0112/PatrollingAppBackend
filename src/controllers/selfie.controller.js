import { Selfie } from "../models/selfie.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const sendSelfie = asyncHandler(async (req, res) => {

    const selfiePath = req.file?.path

    if(!selfiePath) throw new ApiError(400, "selfie is missing")

    // const selfie = await 

})

const getSelfies = asyncHandler(async (req, res) => {
    if(req.user.role !== "ADMIN") throw new ApiError(400, "Unauthorized request")

    const { officerId, verified } = req.query

    let query = {};

    if (officerId) {
        query.officerId = officerId;
    }

    if (verified !== undefined) {
        query.verified = verified === 'true'; 
    }

    const selfies = await Selfie.aggregate([
        {
            $match: query
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