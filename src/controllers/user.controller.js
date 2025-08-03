import  { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { uploadFileOnCloud } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";





const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ValiditeBeforeSave: false})

        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}


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

    const existedUser = await User.findOne({
        $or: [{ username },{ email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    
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

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    // send response 
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
})


const loginUser = asyncHandler(async (req, res) => {
    /*
    1. req body -> data
    2. username or email check in database
    3. find the user
    4. password check 
    5. access and refresh token 
    6. send cookie
    7. response for success message
    */

    const { email, username, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    // Find user by username or email, including password explicitly
    const user = await User.findOne({
        $or: [{ username }, { email }]
    }).select("+password");

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

    // Fetch user again without password or refreshToken
    const loggedUser = await User.findById(user._id).select("-password -refreshToken").lean();

    // Cookie options
    const options = {
        httpOnly: true,
        secure: true, // set to false for localhost during development if needed
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedUser,
                    accessToken,
                    refreshToken
                },
                "User logged in successfully"
            )
        );
});


// Logout features

const logoutUser = asyncHandler(async (req, res) => {
    if (!req.user || !req.user._id) {
        throw new ApiError(400, "User not authenticated");
    }

    // Clear refresh token from DB (optional, depends on your logic)
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: ""
            }
        },
        {
            new: true
        }
    );

    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "Strict"
    };

    return res
        .status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});







export { registerUser, loginUser , logoutUser}