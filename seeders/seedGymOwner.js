require('dotenv').config(); // Load environment variables
const GymOwner = require('../models/gymOwnerModel'); // Adjust the relative path
const connectDB = require('../config/db'); // Adjust the relative path

const seedData = async () => {
  try {
    await connectDB(); // Connect to the database

    // Check if the GymOwner already exists by `ownerId`
    const existingGymOwner = await GymOwner.findOne({ ownerId: "0ZlFXscYURYbtw2AJ6NQ2bSw1eR2" });
    if (existingGymOwner) {
      console.log("GymOwner already exists. Skipping seed.");
      process.exit();
    }

    // Create a new GymOwner document
    const gymOwner = await GymOwner.create({
      ownerId: "0ZlFXscYURYbtw2AJ6NQ2bSw1eR2",
      MemberPackageRenewal: [],
      Members: [],
      Packages: [],
      DietPlans: [],
      ExercisePlans: [],
      ContactUs: [],
      GymStaff: [],
      Reviews: [],
    });

    console.log("GymOwner seeded successfully:", gymOwner);
    process.exit();
  } catch (error) {
    console.error("Error seeding GymOwner:", error.message);
    process.exit(1);
  }
};

seedData();
