const Gym = require("../models/gymModel");
const moment = require("moment"); // To work with dates
const sendEmail = require("../utils/sendEmail"); // Importing the sendEmail utility

// Get all gyms
exports.getAllGyms = async (req, res) => {
  try {
    const gyms = await Gym.find();

    // Loop through all gyms and check the expiration status
    for (const gym of gyms) {
      if (gym.isExpiredSoon) {
        // Send email if the gym's subscription is about to expire
        await sendEmail({
          email: gym.emailAddress,
          subject: 'Your Gym Subscription Will Expire Soon',
          message: `Dear ${gym.gymName},\n\nYour gym subscription is about to expire soon on ${gym.expiresAt}. Please take action to renew your subscription.\n\nBest regards,\nYour Gym Management Team`,
        });
      }
    }

    res.json(gyms);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get a gym by uniqueId
exports.getGymById = async (req, res) => {
  try {
    const gym = await Gym.findOne({ uniqueId: req.params.uniqueId });
    if (!gym) return res.status(404).json({ message: "Gym not found" });

    // Check if the gym's subscription is about to expire and send an email
    if (gym.isExpiredSoon) {
      console.log("333333333333");
      await sendEmail({
        email: gym.emailAddress,
        subject: 'Your Gym Subscription Will Expire Soon',
        message: `Dear ${gym.gymName},\n\nYour gym subscription is about to expire soon on ${gym.expiresAt}. Please take action to renew your subscription.\n\nBest regards,\nYour Gym Management Team`,
      });
    }
    console.log("2222222222222222222");

    res.json(gym);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Create a new gym
exports.createGym = async (req, res) => {
  try {
    const { address, contact, emailAddress, gymName, subscription, uniqueId, userId, website } = req.body;
    const photo = req.file ? req.file.path : "";

    if (!address || !contact || !emailAddress || !gymName || !uniqueId || !userId) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    const newGym = new Gym({ address, contact, emailAddress, gymName, photo, subscription, uniqueId, userId, website });
    const savedGym = await newGym.save();
    res.status(201).json(savedGym);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update a gym by uniqueId
exports.updateGym = async (req, res) => {
  try {
    const updatedGym = await Gym.findOneAndUpdate(
      { uniqueId: req.params.uniqueId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedGym) return res.status(404).json({ message: "Gym not found" });
    res.json(updatedGym);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete a gym by uniqueId
exports.deleteGym = async (req, res) => {
  try {
    const gym = await Gym.findOneAndDelete({ uniqueId: req.params.uniqueId });

    if (!gym) return res.status(404).json({ message: "Gym not found" });
    res.json({ message: "Gym deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Function to check expiration and update status
exports.checkExpirationStatus = async () => {
  try {
    const currentDate = moment().format("YYYYMMDD"); // Get current date in YYYYMMDD format
    const gyms = await Gym.find();

    gyms.forEach(async (gym) => {
      if (gym.expiresAt) {
        const expiresAt = moment(gym.expiresAt.toString(), "YYYYMMDD"); // Convert expiresAt to moment
        const daysLeft = expiresAt.diff(currentDate, "days"); // Calculate days left

        // Check if the subscription is about to expire in 5 days
        if (daysLeft <= 5 && daysLeft > 0 && !gym.isExpiredSoon) {
          gym.isExpiredSoon = true; // Set isExpiredSoon to true if it's about to expire
          await gym.save(); // Save updated gym record
          console.log(`Gym ${gym.gymName} is about to expire in ${daysLeft} days.`);
        }

        // If expired, set isExpiredSoon to true
        if (daysLeft <= 0 && !gym.isExpiredSoon) {
          gym.isExpiredSoon = true;
          await gym.save();
          console.log(`Gym ${gym.gymName} has expired.`);
        }
      }
    });
  } catch (error) {
    console.error("Error checking gym expiration:", error);
  }
};
