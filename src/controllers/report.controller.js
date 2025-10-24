import { Assignment } from "../models/assignment.model.js";
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
        location: [ fields['latitude'], fields['longitude'] ],
        description: fields['description'],
        type : fields["type"],
    })

    if (!createdReport) throw new ApiError(500, "error in submitting report")

    return res.code(200)
        .send(
            new ApiResponse(200, createdReport, "Report Submitted")
        )
}
)

const getAllReport = asyncHandler(async (req, res) => {
    if (req.user.role === "GENERAL") {
        const allReports = await Report.aggregate([
            {
                $match: {
                    officer: new mongoose.Types.ObjectId(req.user._id),
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user",
                    pipeline: [
                        {
                            $project: {
                                name: 1,
                                badgeNumber: 1,
                                assignedGroup: 1,
                            }
                        }
                    ]
                }
            }, {
                $addFields: {
                    user: {
                        $first: "$user"
                    }
                }
            }
        ])
        return res.code(200)
            .send(
                new ApiResponse(200, allReports, "All reports fetched")
            )
    }
    if (req.user.role === "ADMIN") {
        const allReports = await Report.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user",
                    pipeline: [
                        {
                            $project: {
                                name: 1,
                                badgeNumber: 1,
                                assignedGroup: 1,
                            }
                        }
                    ]
                }
            }, {
                $addFields: {
                    user: {
                        $first: "$user"
                    }
                }
            }
        ])
        
        return res.code(200)
            .send(
                new ApiResponse(200, allReports, "All reports fetched")
            )
    }

    throw new ApiError(400, "Unauthorized Access")

})

const updateStatus = asyncHandler(async (req, res) => {
    const { reportId } = req.params

    if (req.user.role !== "ADMIN") {
        throw new ApiError(400, "Unauthorized Access")
    }

    const updatedReport = await Report.findByIdAndUpdate(
        reportId,
        {
            $set: {
                isReviewed: true,
            }
        },
        {
            new: true
        }
    )

    return res.code(201)
        .send(
            new ApiResponse(201, updatedReport, "report Reviewed")
        )
})

const downloadReport = asyncHandler(async (req, res) => {

    if (req.user.role !== "ADMIN") {
        throw new ApiError(400, "Unauthorized download attempt")
    }

    const { startTime, endTime } = req.query;

    const localStart = new Date(startTime);
    const localEnd = new Date(endTime);
    const utcStart = localStart.toISOString();
    const utcEnd = localEnd.toISOString();

    const matchCondition = {};

    if (utcStart || utcEnd) {
        const timeCondition = {};
        
        if (utcStart) {
            const startDate = new Date(utcStart);
            console.log(startDate.toISOString());
            
            if (isNaN(startDate.getTime())) {
                throw new ApiError(400, "Invalid startTime format");
            }
            timeCondition.$gte = new Date(startDate.toISOString());
            console.log('Start date:', startDate);
        }

        if (utcEnd) {
            const endDate = new Date(utcEnd);
            if (isNaN(endDate.getTime())) {
                throw new ApiError(400, "Invalid endTime format");
            }
            timeCondition.$lt = new Date(endDate.toISOString());
            console.log('End date:', endDate);
        }

        matchCondition.createdAt = timeCondition;
    }


    const aggregationPipeline = [
        {
            $match: matchCondition
        },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
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
        },{
                $addFields: {
                    user: {
                        $first: "$user"
                    }
                }
            },
        {
            $project : {
                _id : 1,
                user : 1,
                type : 1,
                description : 1,
                isReviewed : 1,
                createdAt : 1,
                updatedAt :1
            }
        }
    ];

    try {
        const fetchedReportData = await Report.aggregate(aggregationPipeline);
        // const fetchedAssignmentData = await Assignment.aggregate(aggregationPipeline);

        return res.code(200).
                send(
                    new ApiResponse(200, {assignments : "",reports : fetchedReportData}, "report Downloaded Successfully")
                )
    } catch (error) {
        throw new ApiError(500, "Unable to fetch data history")
    }
})

const deleteReports =  asyncHandler(async (req, res) => {

    const {reportIds} = req.body;

    if (req.user.role !== "ADMIN") {
        throw new ApiError(400, "Unauthorized Access")
    }

    await Report.deleteMany({_id: {$in: reportIds}})

    return res.code(204)
        .send(
            new ApiResponse(200, null, "All reports deleted")
        )
})
export {
    submitReport,
    getAllReport,
    updateStatus,
    downloadReport,
    deleteReports
}