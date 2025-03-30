import { Report } from "../models/report.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadImage } from "../utils/selfieUtils.js";

const submitReport = asyncHandler(async (req, res) => {

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
        } else {
            // Handle regular fields
            fields[part.fieldname] = part.value;
        }

    }

    if (files.length === 0) {
        throw new ApiError(400, "please upload at least one image")
    }
    const imagesUrl = await Promise.all(
        files.map(async (image) => {
            try {
                const uploadedImage = await uploadImage(image.mimetype, image.data.toString('base64'));
                console.log("Uploaded image URL:", uploadedImage.url);

                if (!uploadedImage || !uploadedImage.url) {
                    throw new Error("Invalid image upload response");
                }
                return uploadedImage.url;
            } catch (error) {
                console.error("Error uploading image:", error);
                throw new ApiError(500, "Failed to upload one or more images");
            }
        })
    );

    const createdReport = await Report.create({
        user: req.user._id,
        images: imagesUrl,
        location: { type: 'Point', coordinates: { longitude: fields['longitude'], latitude: fields['latitude'] } },
        description: fields['description']
    })

    if (!createdReport) throw new ApiError(500, "error in submitting report")

    return res.code(200)
        .send(
            new ApiResponse(200, createdReport, "Report Submitted")
        )
}
)

const getAllReport = asyncHandler(async (req, res) => {
    if (req.user.role !== "ADMIN") {
        throw new ApiError(400, "Unauthorized request")
    }
    const allReports = await Report.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
                pipeline : [
                    {
                        $project : {
                            name : 1,
                            badgeNumber : 1,
                            assignedGroup : 1,
                        }
                    }
                ]
            }
        },{
            $addFields : {
                $first : '$owner'
            }
        }
    ])
    return res.code(200)
        .send(
            new ApiResponse(200, allAssignments, "All assignments fetched")
        )
})

export {
    submitReport
}