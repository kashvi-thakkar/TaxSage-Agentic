const express = require('express');
const router = express.Router();
const TaxFiling = require('../models/taxFiling.model.js');
const auth = require('../middleware/auth.js');
const upload = require("../middleware/upload.middleware");

// Import controller functions directly
const {saveTaxFiling, getTaxFiling, inviteCA, getFilingForReview, submitCAReview, parseForm16Controller,
    reviewFilingController, markComplete} = require('../controllers/tax.controller.js');

const {processFilingController} = require("../controllers/langgraph.controller");

router.post(
  "/process-filing",
  upload.single("form16"),
  processFilingController
);

// ------------------------------------------------------------------
// @route   POST /api/tax/start-filing
// @desc    Start a new tax filing
// @access  Private
// ------------------------------------------------------------------
router.post('/start-filing', auth, async (req, res) => {
    try {
        const { itrFormType } = req.body;
        const year = new Date().getFullYear();
        const assessmentYear = `${year}-${year + 1}`;

        const existingFiling = await TaxFiling.findOne({ user: req.userId, assessmentYear });
        if (existingFiling) {
            return res.status(400).json({ message: 'Filing for this year already exists' });
        }

        const taxFiling = new TaxFiling({
            user: req.userId,
            itrFormType: itrFormType || 'ITR-1',
            assessmentYear
        });

        await taxFiling.save();
        res.status(201).json(taxFiling);
    } catch (error) {
        console.error('Error creating filing:', error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

// ------------------------------------------------------------------
// @route   GET /api/tax/my-filings
// @desc    Get user's tax filings
// @access  Private
// ------------------------------------------------------------------
router.get('/my-filings', auth, async (req, res) => {
    try {
        const filings = await TaxFiling.find({ user: req.userId }).sort({ createdAt: -1 });
        res.json(filings);
    } catch (error) {
        console.error('Error fetching filings:', error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
});

// ------------------------------------------------------------------
// @route   PUT /api/tax/update-filing/:id
// @desc    Update tax filing data
// @access  Private
// ------------------------------------------------------------------
router.put('/update-filing/:id', auth, async (req, res) => {
    try {
        const filing = await TaxFiling.findOne({ _id: req.params.id, user: req.userId });
        if (!filing) {
            return res.status(404).json({ message: 'Filing not found' });
        }

        const updatedFiling = await TaxFiling.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.json(updatedFiling);
    } catch (error) {
        console.error('Error updating filing:', error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
        console.error("UPDATE FILING ERROR:", error);
    }
});

// ------------------------------------------------------------------
// @route   PUT /api/tax/filing
// @desc    Save tax filing data
// @access  Private
// ------------------------------------------------------------------
router.put('/filing', auth, saveTaxFiling);

// ------------------------------------------------------------------
// @route   GET /api/tax/filing
// @desc    Get tax filing data
// @access  Private
// ------------------------------------------------------------------
// FIXED: Make sure this returns proper JSON even when no filing exists
router.get('/filing', auth, async (req, res) => {
    try {
        console.log('GET /api/tax/filing - User ID:', req.userId);
        
        // Get the current assessment year
        const year = new Date().getFullYear();
        const assessmentYear = `${year}-${year + 1}`;
        
        // Find the filing for this user
        const filing = await TaxFiling.findOne({ 
            user: req.userId, 
            assessmentYear 
        }).sort({ createdAt: -1 });
        
        // Always return JSON, even if no filing exists
        if (!filing) {
            console.log('No filing found for user:', req.userId);
            return res.json({ 
                filing: null, 
                message: 'No tax filing found for this assessment year' 
            });
        }
        
        console.log('Found filing:', filing._id);
        res.json({ filing });
        
    } catch (error) {
        console.error('Error in GET /api/tax/filing:', error);
        // Always return JSON error, not HTML
        res.status(500).json({ 
            error: 'Server Error', 
            message: error.message 
        });
    }
});

// ------------------------------------------------------------------
// @route   POST /api/tax/:id/invite-ca
// @desc    Invite a CA to review a filing (user)
// @access  Private
// ------------------------------------------------------------------
router.post('/:id/invite-ca', auth, inviteCA);

// ------------------------------------------------------------------
// @route   GET /api/tax/review/:id
// @desc    Get filing details for CA review
// @access  Private (CA)
// ------------------------------------------------------------------
router.get('/review/:id', auth, getFilingForReview);

// ------------------------------------------------------------------
// @route   POST /api/tax/review/:id
// @desc    CA submits review (comments and action)
// @access  Private (CA)
// ------------------------------------------------------------------
router.post('/review/:id', auth, submitCAReview);

// ------------------------------------------------------------------
// @route   POST /api/tax/parse-form16
// @desc    Parse Form-16 PDF and extract data
// @access  Private
// ------------------------------------------------------------------
router.post('/parse-form16', auth, upload.single('form16'), parseForm16Controller);

// ------------------------------------------------------------------
// @route   POST /api/tax/review-filing
// @desc    Generate AI review for a completed filing before submission
// @access  Private
// ------------------------------------------------------------------
router.post('/review-filing', auth, reviewFilingController);

// ------------------------------------------------------------------
// @route   GET /api/tax/test-route
// @desc    Test route to verify API is working
// @access  Public (for testing)
// ------------------------------------------------------------------
router.get('/test-route', (req, res) => {
    res.json({
        success: true,
        message: "Tax route is working properly"
    });
});

// ------------------------------------------------------------------
// @route   POST /api/tax/save-itr-json
// @desc    Save ITR JSON data
// @access  Private
// ------------------------------------------------------------------
router.post('/save-itr-json', auth, async (req, res) => {
    try {
        const { filingId, itrJSON, encryptedData } = req.body;
        
        // Find and update the filing
        const filing = await TaxFiling.findOne({ 
            _id: filingId, 
            user: req.userId 
        });
        
        if (!filing) {
            return res.status(404).json({ error: 'Filing not found' });
        }
        
        // Save the ITR data
        filing.itrData = {
            json: itrJSON,
            encrypted: encryptedData,
            updatedAt: new Date()
        };
        
        await filing.save();
        
        res.json({ 
            success: true, 
            message: 'ITR JSON saved successfully' 
        });
        
    } catch (error) {
        console.error('Error saving ITR JSON:', error);
        res.status(500).json({ error: error.message });
    }
});

// ------------------------------------------------------------------
// @route   POST /api/tax/efiling/authenticate
// @desc    Authenticate with Income Tax Portal
// @access  Private
// ------------------------------------------------------------------
router.post('/efiling/authenticate', auth, async (req, res) => {
    try {
        const { pan, password } = req.body;
        
        // This is a mock response - implement actual authentication
        res.json({ 
            success: true, 
            sessionToken: 'mock_session_token_' + Date.now(),
            message: 'Authentication successful (mock)'
        });
        
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ------------------------------------------------------------------
// @route   POST /api/tax/efiling/submit
// @desc    Submit ITR to Income Tax Portal
// @access  Private
// ------------------------------------------------------------------
router.post('/efiling/submit', auth, async (req, res) => {
    try {
        const { itrJSON, pan, assessmentYear, returnType, filingId } = req.body;
        
        // Mock successful submission
        const acknowledgmentNumber = 'ACK' + Date.now();
        
        res.json({ 
            status: 'success',
            acknowledgmentNumber: acknowledgmentNumber,
            acknowledgmentDate: new Date().toISOString(),
            itrv: 'ITR-V_' + acknowledgmentNumber,
            message: 'ITR submitted successfully (mock)'
        });
        
    } catch (error) {
        console.error('Submission error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ------------------------------------------------------------------
// @route   PUT /api/tax/filing/update-acknowledgment
// @desc    Update filing with acknowledgment details
// @access  Private
// ------------------------------------------------------------------
router.put('/filing/update-acknowledgment', auth, async (req, res) => {
    try {
        const { filingId, acknowledgmentNumber, acknowledgmentDate, itrv, status, submissionTimestamp } = req.body;
        
        const filing = await TaxFiling.findOneAndUpdate(
            { _id: filingId, user: req.userId },
            { 
                acknowledgmentNumber,
                acknowledgmentDate,
                itrv,
                status,
                submissionTimestamp,
                'efiling.status': 'submitted'
            },
            { new: true }
        );
        
        if (!filing) {
            return res.status(404).json({ error: 'Filing not found' });
        }
        
        res.json({ success: true, filing });
        
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ------------------------------------------------------------------
// @route   POST /api/tax/efiling/e-verify
// @desc    E-verify the filed ITR
// @access  Private
// ------------------------------------------------------------------
router.post('/efiling/e-verify', auth, async (req, res) => {
    try {
        const { acknowledgmentNumber, verificationType, pan } = req.body;
        
        res.json({ 
            status: 'success',
            message: 'E-verification initiated successfully (mock)'
        });
        
    } catch (error) {
        console.error('E-verification error:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id/download-json', auth, async (req, res) => {

  try {

    const filing =
      await TaxFiling.findOne({
        _id: req.params.id,
        user: req.userId
      });

    if (!filing) {
      return res.status(404).json({
        message: "Filing not found"
      });
    }

    const itrJson = {

      assessmentYear:
        filing.assessmentYear,

      personalInfo:
        filing.personalInfo,

      income:
        filing.income,

      deductions:
        filing.deductions,

      taxCalculation:
        filing.taxCalculation,

      taxPaid:
        filing.taxPaid
    };

    filing.status =
      "completed";

    await filing.save();

    res.json(itrJson);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: err.message
    });

  }

});

router.get('/filing/:id', auth, async (req, res) => {

  try {

    const filing =
      await TaxFiling.findOne({
        _id: req.params.id,
        user: req.userId
      });

    if (!filing) {
      return res.status(404).json({
        message: "Filing not found"
      });
    }

    res.json(filing);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: err.message
    });

  }

});

router.put('/:id/mark-complete', auth, async (req, res) => {

  try {

    const filing = await TaxFiling.findOne({
        _id: req.params.id,
        user: req.userId
      });

    if (!filing) {
      return res.status(404).json({
        message: "Filing not found"
      });
    }

    filing.status = "completed";

    await filing.save();

    res.json({
      success: true
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: err.message
    });

  }

});

module.exports = router;