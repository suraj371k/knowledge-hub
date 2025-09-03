import express from 'express'
import authenticate from '../middlewares/authenticate.js';
import { 
  getVersionHistory, 
  getVersion, 
  restoreVersion 
} from '../controllers/version.controller.js';

const router = express.Router()

// Get version history for a document
router.get('/history/:documentId', authenticate, getVersionHistory)

// Get a specific version
router.get('/:versionId', authenticate, getVersion)

// Restore a specific version
router.post('/restore/:versionId', authenticate, restoreVersion)

export default router;