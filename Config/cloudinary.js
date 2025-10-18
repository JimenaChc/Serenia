import { v2 as cloudinary} from "cloudinary";

cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dyxi3knlx",
  api_key: process.env.CLOUDINARY_API_KEY || "182283995548372",
  api_secret: process.env.CLOUDINARY_API_SECRET || "EV9ManaXtA3Q05ainZFCNQqlWFc",
});

export default cloudinary;