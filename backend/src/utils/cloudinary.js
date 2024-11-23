import { v2 as cloudinary } from "cloudinary"
import { Readable } from "stream";


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (fileBuffer, resourceType = "auto") => {
    try {
        if (!fileBuffer) return null;

        // Create a readable stream from the file buffer
        const bufferStream = new Readable();
        bufferStream.push(fileBuffer);  // Push the file buffer into the stream
        bufferStream.push(null);  // Indicating the end of the stream

        // Return a Promise to handle the async upload
        return new Promise((resolve, reject) => {
            bufferStream.pipe(
                cloudinary.uploader.upload_stream(
                    {
                        resource_type: resourceType,
                    },
                    (error, result) => {
                        if (error) {
                            console.error("Error uploading to Cloudinary:", error);
                            reject(error); 
                        } else {
                            console.log("File uploaded to Cloudinary:", result.secure_url);
                            resolve(result); 
                        }
                    }
                )
            );
        });
    } catch (error) {
        console.error("Error in uploadOnCloudinary:", error);
        return null;
    }
};

export { uploadOnCloudinary };