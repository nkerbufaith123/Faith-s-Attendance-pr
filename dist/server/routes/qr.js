import express from 'express';
import { generateQr, verifyQr } from '../controllers/qrController.js';

const router = express.Router();

router.post('/qr/generate', generateQr);
router.post('/qr/verify', verifyQr);

export default router;
