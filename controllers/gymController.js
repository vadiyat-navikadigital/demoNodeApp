const { Parser } = require("json2csv");
const Gym = require("../models/gymModel");
const moment = require("moment"); // To work with dates
const sendEmail = require("../utils/sendEmail"); // Importing the sendEmail utility

// Get all gyms or filter gyms with query parameters
exports.getAllGyms = async (req, res) => {
  try {
    const { gymName, contact, emailAddress, subscription, isExpiredSoon, website, plan, status,
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
    const gym = await Gym.findOne({ uniqueId: req.params.uniqueId });
    if (!gym) return res.status(404).json({ message: "Gym not found" });
    res.json(gym);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Create a new gym
// exports.createGym = async (req, res) => {
//   try {
//     const { address, contact, emailAddress, gymName, subscription, uniqueId, userId, website, status } = req.body;
//     const photo = req.file ? req.file.path : "";

//     if (!address || !contact || !emailAddress || !gymName || !uniqueId || !userId) {
//       return res.status(400).json({ message: "All required fields must be provided" });
//     }

//     const newGym = new Gym({ address, contact, emailAddress, gymName, photo, subscription, uniqueId, userId, website, status });
//     const savedGym = await newGym.save();
//     res.status(201).json(savedGym);
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };
exports.createGym = async (req, res) => {
  const GymOwner = require("../models/gymOwnerModel"); // Import GymOwner model

  try {
    const { address, contact, emailAddress, gymName, subscription, uniqueId, userId, website, status } = req.body;
    const photo = req.file ? req.file.path : "";

    // Validate required fields
    if (!address || !contact || !emailAddress || !gymName || !uniqueId || !userId) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Create a new Gym
    const newGym = new Gym({ address, contact, emailAddress, gymName, photo, subscription, uniqueId, userId, website, status });


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
    const { uniqueId, _id, userId } = req.query;

    // Build dynamic filter criteria
    const filter = {};
    if (uniqueId) filter.uniqueId = uniqueId;
    if (_id) filter._id = _id;
    if (userId) filter.userId = userId;

    // Fetch gyms based on filter
    const gyms = await Gym.find(filter);
    if (!gyms || gyms.length === 0) {
      return res.status(404).json({ message: "No gym records found for the specified criteria." });
    }

    // Define fields for the CSV
    const fields = [
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
      "status",
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
