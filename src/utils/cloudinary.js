import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';
import logger from "./logger";
 

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadFileOnCloud = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        // upload the file on cloudinary
        const response = cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        })
        // file has been uploaded successfully
        logger.info("file is uploaded on cloudinary ", (response).url)
        return response;        
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temoporary file the upload operation got failed
        return null;
    }
}

export { uploadFileOnCloud };