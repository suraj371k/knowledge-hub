import Activity from "../models/activity.model.js";

// Create activity when document is created, updated, or deleted
export const createActivity = async (action, documentId, userId) => {
  try {
    const activity = await Activity.create({
      action,
      document: documentId,
      user: userId,
    });

    return activity;
  } catch (error) {
    console.log("Error in create activity", error);
    throw error;
  }
};

// Get team activity feed (last 5 activities)
export const getTeamActivityFeed = async (req, res) => {
  try {
    const activities = await Activity.find()
      .populate("user", "name email")
      .populate("document", "title")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({ success: true, activities });
  } catch (error) {
    console.log("Error in get team activity feed", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Get activities for a specific user
export const getUserActivities = async (req, res) => {
  try {
    const { userId } = req.params;

    const activities = await Activity.find({ user: userId })
      .populate("document", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, activities });
  } catch (error) {
    console.log("Error in get user activities", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Get activities for a specific document
export const getDocumentActivities = async (req, res) => {
  try {
    const { documentId } = req.params;

    const activities = await Activity.find({ document: documentId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, activities });
  } catch (error) {
    console.log("Error in get document activities", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Get recent edited documents (last 5 edited docs)
export const getRecentEditedDocuments = async (req, res) => {
  try {
    const activities = await Activity.find({ action: "update" })
      .populate("user", "name email")
      .populate("document", "title summary tags")
      .sort({ createdAt: -1 })
      .limit(5);

    // Remove duplicates and get unique documents
    const uniqueDocs = activities.reduce((acc, activity) => {
      if (activity.document && !acc.find(doc => doc._id.toString() === activity.document._id.toString())) {
        acc.push({
          ...activity.document.toObject(),
          lastEditedBy: activity.user,
          lastEditedAt: activity.createdAt
        });
      }
      return acc;
    }, []);

    res.status(200).json({ success: true, documents: uniqueDocs });
  } catch (error) {
    console.log("Error in get recent edited documents", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
