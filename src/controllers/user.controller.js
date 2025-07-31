import  { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { uploadFileOnCloud } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";




const registerUser = asyncHandler ( async (req, res) => {
    /*
    1. get user details from frontend
    2. validation - not empty
    3. check if user already exists: username, email
    4. check for images, check for avatar
    5. upload them to cloudinary, avatar is successful upload or not?
    6. create user object - create entry in database
    7. remove password and refresh token field from response
    8. check for user creation
    9. return response
    */
  
    const {fullName, username, email, password} = req.body;

    if (
        [fullName, username, email, password].some( (field) =>  field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = User.findOne({
        $or: [{ username },{ email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    // upload on cloudinary
    const avatar = await uploadFileOnCloud(avatarLocalPath)
    const coverImage = await uploadFileOnCloud(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "avatar file is required")
    }

    const user = await User.create({
        fullName, 
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username
    })

    const createdUser = User.findById({ user._id}).select("-password -refreshToken")

    if (!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    // send response 
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
})






export { registerUser }