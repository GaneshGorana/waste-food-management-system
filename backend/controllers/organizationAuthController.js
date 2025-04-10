import Organization from "../models/organization.js";
import bcrypt from 'bcryptjs'
import { setUser } from "../jwt/userAuthJWT.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"

export const organizationRegister = async (req, res) => {
    if (!req.body) {
        return ApiError(res, 400, "Please provide organization details", "warning")
    }
    try {
        const existsOrganization = await Organization.findOne({ email: req.body?.email });
        if (existsOrganization) {
            return ApiError(res, 400, "Email already registered", "info");
        }
        const org = await Organization.create(req.body);
        if (!org) {
            return ApiError(res, 400, "Error in organization registration", "error")
        }
        return ApiResponse(res, 201, "Organization Registered successfully", null, "success")
    } catch (err) {
        console.log("registration process error organization :", err);
        return ApiError(res, 400, "Error in registration of organization", "error")
    }
};

export const organizationLogin = async (req, res) => {
    if (!req.body) {
        return ApiError(res, 400, "Please provide login details", "warning")
    }
    const { email, password } = req.body;
    try {
        const org = await Organization.findOne({ email });
        if (!org) {
            return ApiError(res, 400, "Organization not found", "info")
        }
        const isMatch = await bcrypt.compare(password, org.password);
        if (!isMatch) {
            return ApiError(res, 400, "Invalid credentials", "warning")
        }
        const token = setUser(user);
        if (token.error) {
            return ApiError(res, 500, token.error)
        }
        res.cookie('token', token, { httpOnly: true, sameSite: 'strict' });
        return ApiResponse(res, 200, "Logged in successfully", null, "success")
    } catch (err) {
        console.log("login process error :");
        return ApiError(res, 400, "Error in organization login", "error")
    }
};