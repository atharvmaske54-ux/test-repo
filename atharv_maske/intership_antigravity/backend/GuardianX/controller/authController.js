const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const Profile = require("../model/profile");

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address."
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long."
            });
        }

        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists with this email."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });

        const jwtSecret = process.env.JWT_SECRET || "default_jwt_secret";
        const token = jwt.sign({ id: user._id }, jwtSecret, {
            expiresIn: "1d"
        });

        user.token = token;
        await user.save();

        return res.status(201).json({
            success: true,
            message: "User registered successfully.",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                token
            }
        });
    } catch (error) {
        console.error("Register error:", error);
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "User already exists with this email."
            });
        }

        const message = error.message || "An error occurred while registering the user.";
        return res.status(500).json({
            success: false,
            message
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const jwtSecret = process.env.JWT_SECRET || "default_jwt_secret";
        const token = jwt.sign({ id: user._id }, jwtSecret, {
            expiresIn: "1d"
        });

        user.token = token;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Login successful.",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                token
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        const message = error.message || "An error occurred while logging in.";
        return res.status(500).json({
            success: false,
            message
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: "Unauthorized. User information is missing." });
        }

        const userId = req.user.id;

        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // also remove associated profile if present
        await Profile.findOneAndDelete({ $or: [{ userId }, { user: userId }] });

        return res.status(200).json({ success: true, message: "User and profile deleted successfully." });
    } catch (error) {
        console.error("Delete user error:", error);
        return res.status(500).json({ success: false, message: "An error occurred while deleting the user." });
    }
};

module.exports = {
    registerUser,
    loginUser,
    deleteUser
};
