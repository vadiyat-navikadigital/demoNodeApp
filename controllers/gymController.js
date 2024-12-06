const { Parser } = require("json2csv");
const Gym = require("../models/gymModel");
const moment = require("moment"); // To work with dates
const sendEmail = require("../utils/sendEmail"); // Importing the sendEmail utility

// Get all gyms or filter gyms with query parameters
exports.getAllGyms = async (req, res) => {
  try {
    const { gymName, contact, emailAddress, subscription, isExpiredSoon, website, plan, status, isExpired,
      limit = 10, // Default limit
      offset = 0, // Default offset
      sort = "createdAt:desc", // Default sort
    } = req.query;

    // Build the search query
    const query = {};

    if (gymName) query.gymName = new RegExp(gymName.trim().replace(/\s+/g, " "), "i");
    if (contact) query.contact = contact;
    if (emailAddress) query.emailAddress = emailAddress;
    if (subscription) query.subscription = subscription;
    if (isExpiredSoon) query.isExpiredSoon = isExpiredSoon === "true"; // Boolean check
    if (isExpired) query.isExpired = isExpired === "true"; // Boolean check
    if (status) query.status = status === "true";
    if (website) query.website = new RegExp(website.trim(), "i");
    if (plan) query.plan = plan;

    // Parse sorting
    const [sortField, sortOrder] = sort.split(":");
    const sortObj = { [sortField]: sortOrder === "desc" ? -1 : 1 };

    // Fetch records with pagination and sorting
    const gyms = await Gym.find(query)
      .sort(sortObj)
      .skip(Number(offset))
      .limit(Number(limit));

    // Get total count for pagination meta
    const totalRecords = await Gym.countDocuments(query);

    res.status(200).json({
      total: totalRecords,
      limit: Number(limit),
      offset: Number(offset),
      sort: sortObj,
      data: gyms,
    });
  } catch (error) {
    console.error("Error retrieving gyms:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Get a gym by uniqueId
exports.getGymById = async (req, res) => {
  try {
    console.log("inside getGymById");
    const gym = await Gym.findOne({ uniqueId: req.params.uniqueId });
    if (!gym) return res.status(404).json({ message: "Gym not found" });
    res.json(gym);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Create a new gym
exports.createGym = async (req, res) => {
  const GymOwner = require("../models/gymOwnerModel"); // Import GymOwner model

  try {
    const { address, expiresAt, contact, emailAddress, gymName, subscription, uniqueId, userId, website, status, amount } = req.body;
    const photo = req.file ? req.file.path : "";

    // Validate required fields
    if (!expiresAt || !address || !contact || !emailAddress || !gymName || !uniqueId || !userId || !amount) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Create a new Gym
    const newGym = new Gym({expiresAt, address, contact, emailAddress, gymName, photo, subscription, uniqueId, userId, website, status, amount });

    const savedGym = await newGym.save();

    // Check if a GymOwner already exists for this Gym (using gym._id)
    const existingGymOwner = await GymOwner.findOne({ ownerId: savedGym._id.toString() });
    if (existingGymOwner) {
      console.log("GymOwner already exists. Skipping GymOwner creation.");
      return res.status(201).json(savedGym);
    }

    // Seed GymOwner with the new Gym's _id as ownerId
    await GymOwner.create({
      ownerId: savedGym._id.toString(),
      MemberPackageRenewal: [],
      Members: [],
      Packages: [],
      DietPlans: [],
      ExercisePlans: [],
      ContactUs: [],
      GymStaff: [],
      Reviews: [],
    });

    console.log("GymOwner seeded successfully.");
    res.status(201).json(savedGym); // Return only the Gym information
  } catch (error) {
    console.error("Error creating gym and seeding GymOwner:", error.message);
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
    const currentDate = moment().format("YYYYMMDD"); // Current date in YYYYMMDD format
    const gyms = await Gym.find();

    gyms.forEach(async (gym) => {
      if (gym.expiresAt) {
        const expiresAt = moment(gym.expiresAt.toString(), "YYYYMMDD"); // Convert expiresAt to moment
        const daysLeft = expiresAt.diff(currentDate, "days"); // Calculate days left

        
        if (daysLeft <= 5 && daysLeft > 0 && !gym.isExpiredSoon) {
          gym.isExpiredSoon = true; // Mark as about to expire
          await gym.save();
          console.log(`Gym ${gym.gymName} is about to expire in ${daysLeft} days.`);
        }

        if (daysLeft <= 0 && !gym.isExpired) {
          gym.isExpired = true; // Mark as expired
          gym.isExpiredSoon = false; // No longer about to expire
          await gym.save();
          console.log(`Gym ${gym.gymName} has expired.`);
        }
      }
    });
  } catch (error) {
    console.error("Error checking gym expiration:", error);
  }
};

exports.notifyExpiringGyms = async () => {
  try {
    const currentDate = moment().format("YYYYMMDD"); // Get current date in YYYYMMDD format
    const gyms = await Gym.find();

    for (const gym of gyms) {
      if (gym.expiresAt) {
        const expiresAt = moment(gym.expiresAt.toString(), "YYYYMMDD"); // Parse expiresAt date
        const daysLeft = expiresAt.diff(currentDate, "days");

        // Notify gyms about to expire in 5 days
        if (daysLeft <= 5 && daysLeft > 0) {
          // Send notification email
          await sendEmail({
            email: gym.emailAddress,
            subject: "Your Gym Subscription Will Expire Soon",
            message: `Dear ${gym.gymName},\n\nYour gym subscription will expire on ${moment(gym.expiresAt.toString(), "YYYYMMDD").format("MMMM D, YYYY")}. Please renew it to avoid disruption.\n\nBest regards,\nYour Gym Management Team.`,
          });
          console.log(`Notification sent to ${gym.emailAddress} for ${gym.gymName}`);
        }
      }
    }
  } catch (error) {
    console.error("Error notifying gyms:", error);
  }
};

// Export gyms as CSV based on filters
exports.exportGymsToCsv = async (req, res) => {
  try {
    const { uniqueId, _id, userId, isExpired } = req.query; // Query parameters
    const { gymIds } = req.body; // Gym IDs passed in the request body

    // Build dynamic filter criteria
    const filter = {};

    // Include query parameters in the filter
    if (uniqueId) filter.uniqueId = uniqueId;
    if (_id) filter._id = _id;
    if (userId) filter.userId = userId;
    if (isExpired) filter.isExpired = isExpired==="true";

    // Include gym IDs from the request body in the filter
    if (gymIds && Array.isArray(gymIds)) {
      filter._id = { $in: gymIds }; // Combine gym IDs with other filters
    }

    // Fetch gyms based on filter
    const gyms = await Gym.find(filter);
    if (!gyms || gyms.length === 0) {
      return res.status(404).json({ message: "No gym records found for the specified criteria." });
    }

    // Define fields for the CSV
    const fields = [
      "_id",
      "uniqueId",
      "userId",
      "gymName",
      "address",
      "contact",
      "emailAddress",
      "website",
      "subscription",
      "plan",
      "isExpiredSoon",
      "isExpired",
      "amount",
      "expiresAt",
      "createdAt",
      "updatedAt",
    ];

    const opts = { fields };

    // Convert to CSV
    const parser = new Parser(opts);
    const csv = parser.parse(gyms);

    // Send the CSV file
    res.header("Content-Type", "text/csv");
    res.attachment("gyms.csv");
    return res.send(csv);
  } catch (error) {
    console.error("Error exporting gyms to CSV:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getGymsByExpiryDays = async (req, res) => {
  try {
    const { days } = req.query; // Number of days from today
    if (!days) {
      return res.status(400).json({ message: "Please provide the number of days as a query parameter." });
    }

    const targetDate = moment().add(Number(days), "days").format("YYYYMMDD"); // Calculate the target date
    const gyms = await Gym.find({ expiresAt: targetDate }); // Query gyms expiring on the target date

    if (!gyms || gyms.length === 0) {
      return res.status(404).json({ message: `No gyms expiring in ${days} days.` });
    }

    res.status(200).json({ 
      total: gyms.length,
      data: gyms,
    });
  } catch (error) {
    console.error("Error fetching gyms by expiry days:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.checkGymExpiryHandler = async (req, res) => {
  console.log("checkGymExpiryHandler");
  try {
    const { email } = req.body; // Extract email from request
    
    // Find the gym associated with this email
    const gym = await Gym.findOne({ emailAddress: email });

    if (gym && gym.isExpired) {
      return res.status(200).json({
        isExpired: true,
        message: "The gym subscription associated with this account has expired.",
      });
    }

    return res.status(200).json({ isExpired: false, message: "Gym subscription is active." });
  } catch (error) {
    console.error("Error checking gym expiry:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.checkGymExpiry = async (email) => {
  try {
    const gym = await Gym.findOne({ emailAddress: email });
    if (gym && gym.isExpired) {
      return {
        error: true,
        message: "Access denied. The gym subscription associated with this account has expired.",
      };
    }
    return { error: false };
  } catch (error) {
    console.error("Error checking gym expiry:", error);
    return { error: true, message: "Server error while checking gym expiry." };
  }
};
