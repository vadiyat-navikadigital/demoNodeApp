const { Parser } = require("json2csv");
const Query = require("../models/Query");
// Create a new query
exports.createQuery = async (req, res) => {
  try {
    const { clientId, clientName, email, queryText } = req.body;

    // Validation
    if (!clientId || !clientName || !email || !queryText) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const query = new Query({ clientId, clientName, email, queryText });
    await query.save();
    res.status(201).json(query);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all queries
exports.getAllQueries = async (req, res) => {
  try {
    const queries = await Query.find();
    res.status(200).json(queries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific queries by clientId or status
exports.getQueriesByStatusORClientId = async (req, res) => {
  try {
    const { clientId, status } = req.query;
    const query = {};
    if (clientId) query.clientId = clientId;
    if (status) query.status = status;
    const queries = await Query.find(query);
    res.status(200).json(queries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get a specific query by ID
exports.getQueryById = async (req, res) => {
  try {
    const query = await Query.findById(req.params.id);
    if (!query) return res.status(404).json({ error: "Query not found" });
    res.status(200).json(query);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a comment to a query
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const query = await Query.findById(req.params.id);
    if (!query) return res.status(404).json({ error: "Query not found" });

    query.comments.push({ text });
    await query.save();
    res.status(201).json(query);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update query status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const query = await Query.findById(req.params.id);
    if (!query) return res.status(404).json({ error: "Query not found" });
    query.status = status;
    await query.save();
    res.status(200).json(query);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a query by ID
exports.deleteQuery = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the query exists
    const query = await Query.findById(id);
    if (!query) {
      return res.status(404).json({ error: "Query not found" });
    }

    // Delete the query
    await Query.findByIdAndDelete(id);
    res.status(200).json({ message: "Query deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Export data as CSV with optional clientId and _id
exports.exportCsv = async (req, res) => {
  try {
    const { clientId, id } = req.query;

    // Construct the filter object based on provided parameters
    const filter = {};
    if (clientId) filter.clientId = clientId;
    if (id) filter._id = id;

    // Fetch the data based on the filter
    const queries = await Query.find(filter);
    if (!queries || queries.length === 0) {
      return res.status(404).json({ error: "No data found for the provided parameters." });
    }

    // Convert to CSV
    const fields = ["_id", "clientId", "clientName", "email", "queryText", "status", "createdAt"];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(queries);

    // Set response headers for file download
    const filename = clientId
      ? `queries_client_${clientId}.csv`
      : id
      ? `query_${id}.csv`
      : `queries_all.csv`; // Default filename if no filters are applied
    res.header("Content-Type", "text/csv");
    res.attachment(filename);
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
