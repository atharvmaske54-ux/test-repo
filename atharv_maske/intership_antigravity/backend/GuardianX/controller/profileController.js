const Profile = require("../model/profile");
const User = require("../model/user");

const validateProfileInput = (body) => {
    const requiredFields = ["name", "rollNumber", "class", "department", "teacher", "phoneNumber"];
    for (const field of requiredFields) {
        if (!body[field] || typeof body[field] !== "string" || body[field].trim() === "") {
            return `Field '${field}' is required and must be a non-empty string.`;
        }
    }
    return null;
};

const createProfile = async (req, res) => {
    try {
        console.log('createProfile called', { user: req.user, body: req.body });
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. User information is missing."
            });
        }

        const validationError = validateProfileInput(req.body);
        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Authenticated user not found."
            });
        }

        const profileData = {
            name: req.body.name.trim(),
            rollNumber: req.body.rollNumber.trim(),
            class: req.body.class.trim(),
            department: req.body.department.trim(),
            teacher: req.body.teacher.trim(),
            phoneNumber: req.body.phoneNumber.trim(),
            userId: req.user.id,
            user: req.user.id
        };

        let profile = await Profile.findOne({ $or: [{ userId: req.user.id }, { user: req.user.id }] });
        if (profile) {
            profile.set(profileData);
            await profile.save();
            return res.status(200).json({
                success: true,
                message: "Profile updated successfully.",
                data: profile
            });
        }

        profile = await Profile.create(profileData);
        return res.status(201).json({
            success: true,
            message: "Profile created successfully.",
            data: profile
        });
    } catch (error) {
        const msg = error && error.message ? error.message : String(error);
        const stack = error && error.stack ? error.stack : 'no-stack';
        console.error("Profile create error:", msg, stack);
        try {
            const fs = require('fs');
            if (!fs.existsSync('logs')) fs.mkdirSync('logs');
            fs.appendFileSync('logs/profile_errors.log', `${new Date().toISOString()} - ${msg}\n${stack}\n\n`);
        } catch (fsErr) {
            console.error('Failed to write error log:', fsErr);
        }
        return res.status(500).json({
            success: false,
            message: "An error occurred while saving the profile."
        });
    }
};

const getProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. User information is missing."
            });
        }

        const profile = await Profile.findOne({ userId: req.user.id });
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found for the authenticated user."
            });
        }

        return res.status(200).json({
            success: true,
            data: profile
        });
    } catch (error) {
        console.error("Get profile error:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching the profile."
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. User information is missing."
            });
        }

        const allowedFields = ["name", "rollNumber", "class", "department", "teacher", "phoneNumber"];
        const updateData = {};

        for (const field of allowedFields) {
            if (field in req.body) {
                if (typeof req.body[field] !== "string" || req.body[field].trim() === "") {
                    return res.status(400).json({
                        success: false,
                        message: `Field '${field}' must be a non-empty string when provided.`
                    });
                }
                updateData[field] = req.body[field].trim();
            }
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid profile fields provided to update."
            });
        }

        const profile = await Profile.findOneAndUpdate(
            { $or: [{ userId: req.user.id }, { user: req.user.id }] },
            { $set: updateData },
            { new: true }
        );

        if (!profile) {
            return res.status(404).json({
                success: false,
                message: "Profile not found for the authenticated user."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            data: profile
        });
    } catch (error) {
        console.error("Update profile error:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while updating the profile."
        });
    }
};

const deleteProfile = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: "Unauthorized. User information is missing." });
        }

        const profile = await Profile.findOneAndDelete({ $or: [{ userId: req.user.id }, { user: req.user.id }] });

        if (!profile) {
            return res.status(404).json({ success: false, message: "Profile not found for the authenticated user." });
        }

        return res.status(200).json({ success: true, message: "Profile deleted successfully." });
    } catch (error) {
        console.error('Delete profile error:', error && error.stack ? error.stack : error);
        return res.status(500).json({ success: false, message: "An error occurred while deleting the profile." });
    }
};

module.exports = {
    createProfile,
    getProfile,
    updateProfile,
    deleteProfile
};
