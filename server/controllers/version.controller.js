import DocumentVersion from "../models/version.model.js";
import Document from "../models/document.model.js";

// Create a new version when document is updated
export const createVersion = async (documentId, oldData, editedBy) => {
  try {
    // Get the latest version number
    const latestVersion = await DocumentVersion.findOne({ documentId })
      .sort({ versionNumber: -1 })
      .select("versionNumber");

    const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    // Create new version
    const version = await DocumentVersion.create({
      documentId,
      versionNumber,
      title: oldData.title,
      content: oldData.content,
      summary: oldData.summary,
      tags: oldData.tags,
      editedBy,
    });

    return version;
  } catch (error) {
    console.log("Error in create version", error);
    throw error;
  }
};

// Get version history for a document
export const getVersionHistory = async (req, res) => {
  try {
    const { documentId } = req.params;

    const versions = await DocumentVersion.find({ documentId })
      .populate("editedBy", "name email")
      .sort({ versionNumber: -1 });

    res.status(200).json({ success: true, versions });
  } catch (error) {
    console.log("Error in get version history", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Restore a specific version
export const restoreVersion = async (req, res) => {
  try {
    const { versionId } = req.params;

    // Get the version to restore
    const version = await DocumentVersion.findById(versionId);
    if (!version) {
      return res
        .status(404)
        .json({ success: false, message: "Version not found" });
    }

    // Update the current document with version data
    const updatedDoc = await Document.findByIdAndUpdate(
      version.documentId,
      {
        title: version.title,
        content: version.content,
        summary: version.summary,
        tags: version.tags,
      },
      { new: true }
    ).populate("createdBy");

    res.status(200).json({ success: true, doc: updatedDoc });
  } catch (error) {
    console.log("Error in restore version", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Get a specific version
export const getVersion = async (req, res) => {
  try {
    const { versionId } = req.params;

    const version = await DocumentVersion.findById(versionId)
      .populate("editedBy", "name email");

    if (!version) {
      return res
        .status(404)
        .json({ success: false, message: "Version not found" });
    }

    res.status(200).json({ success: true, version });
  } catch (error) {
    console.log("Error in get version", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
