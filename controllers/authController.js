const crypto = require('crypto');
const AuthUser = require('../models/authModel');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
    const { name, email, password, mobileNumber } = req.body;

    try {
        const user = new AuthUser({ name, email, password, mobileNumber });
        await user.save();

        res.status(201).json({ message: 'AuthUser registered successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await AuthUser.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '4h' });
        res.status(200).json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await AuthUser.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'AuthUser not found' });
        }

        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        const resetURL = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;
        const message = `Forgot your password? Reset it here: ${resetURL}\nIf you didn't request this, please ignore this email.`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Your password reset token (valid for 10 minutes)',
                message,
            });

            res.status(200).json({ message: 'Password reset link sent to email!' });
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save({ validateBeforeSave: false });

            return res.status(500).json({ message: 'Error sending email, try again later.' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    console.log("1111111111111111111");
    const { token } = req.params;
    const { password } = req.body;

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await AuthUser.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: 'Password reset successful!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
