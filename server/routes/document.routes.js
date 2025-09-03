import express from 'express'
import authenticate from '../middlewares/authenticate.js';
import { createDocument, deleteDocument, getAllDocuments, getDocumentById, searchDocument, semanticSearch, updateDocument, answerQuestion } from '../controllers/document.controller.js';

const router = express.Router()

router.post('/create' , authenticate , createDocument)

router.get('/all' , authenticate , getAllDocuments)

router.get('/search', authenticate, searchDocument);

router.post('/semantic-search', authenticate, semanticSearch);

router.post('/answer-question', authenticate, answerQuestion);

router.get('/:id' , authenticate , getDocumentById)

router.put('/update/:id' , authenticate , updateDocument)

router.delete('/delete/:id' , authenticate , deleteDocument)

export default router;