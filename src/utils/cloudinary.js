import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';
import logger from "./logger.js";
 

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadFileOnCloud = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
            folder: "yt-clone/users-profile"
        })
        // file has been uploaded successfully
        // console.log(response.url)
        logger.info(response.url)
        fs.unlinkSync(localFilePath)
        return response;        
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temoporary file the upload operation got failed
        return null;
    }
}

export { uploadFileOnCloud };