import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadSelfie = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        //upload on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type : "auto"
        })
        

        fs.unlinkSync(localFilePath)
    
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath) // removal of locally saved file as upload operation got failed
        return null;
    }
}

const extractPublicIdFromURL = (url) =>{
    return url.split("/").pop().split(".")[0]
}

const deleteSelfie = async(fileURL, fileType = {resource_type :"image"}) => {
    const filePublicId = extractPublicIdFromURL(fileURL)
    await cloudinary.uploader.destroy(filePublicId, fileType)
}

export {uploadSelfie, deleteSelfie}