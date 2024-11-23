import multer from "multer";

const storage = multer.memoryStorage(); //using memory storage to store in buffer

// File filter for profile photo (only images allowed)
const imageFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);  // Accept the file
    } else {
      cb(new Error("Invalid file type. Only images are allowed."), false);  // Reject the file
    }
  };
  
  // File filter for chat media (images and videos allowed)
  const mediaFilter = (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg", "image/png", "image/gif", "video/mp4", "video/avi", "video/mov"
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);  // Accept the file
    } else {
      cb(new Error("Invalid file type. Only images and videos are allowed."), false);  // Reject the file
    }
  };
  
  // Middleware for uploading a single image (for profile photo)
  const uploadProfilePhoto = multer({
    storage: storage,
    fileFilter: imageFilter,
  }).single("image");  // "image" is the key for profile photo
  
  // Middleware for uploading image or video (for chat messages or other media)
  const uploadMedia = multer({
    storage: storage,
    fileFilter: mediaFilter,
  }).fields([
    { name: "image", maxCount: 1 },  // Allow one image file
    { name: "video", maxCount: 1 },  // Allow one video file
  ]);
  
  export { uploadProfilePhoto, uploadMedia };