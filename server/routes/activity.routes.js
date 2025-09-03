import express from 'express'
import authenticate from '../middlewares/authenticate.js';
import { 
  getTeamActivityFeed, 
  getUserActivities, 
  getDocumentActivities, 
  getRecentEditedDocuments 
} from '../controllers/activity.controller.js';

const router = express.Router()

// Get team activity feed (last 5 activities)
router.get('/team-feed', authenticate, getTeamActivityFeed)

// Get activities for a specific user
router.get('/user/:userId', authenticate, getUserActivities)

// Get activities for a specific document
router.get('/document/:documentId', authenticate, getDocumentActivities)

// Get recent edited documents (last 5 edited docs)
router.get('/recent-edits', authenticate, getRecentEditedDocuments)

export default router;