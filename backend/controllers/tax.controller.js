const TaxFiling = require('../models/taxFiling.model.js');
const User = require('../models/user.model.js');
const CA = require('../models/ca.model.js');
const {
  parseForm16
} = require("../services/form16.service");
const form16Service =
  require("../services/form16.service");
const { reviewFiling } = require("../services/filingReview.service");

console.log(form16Service);

// ------------------------------------------------------------------
// Save tax filing data
// ------------------------------------------------------------------
const saveTaxFiling = async (req, res) => {
    try {
        const { filingData } = req.body;

        const taxFiling = await TaxFiling.findOneAndUpdate(
            { user: req.userId },
            { $set: filingData },
            { new: true }
        );

        if (!taxFiling) {
            return res.status(404).json({ message: 'Tax filing not found' });
        }

        res.json(taxFiling);
    } catch (error) {
        console.error('Error saving tax filing:', error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};



// ------------------------------------------------------------------
// Get tax filing data
// ------------------------------------------------------------------
const getTaxFiling = async (req, res) => {
    try {
        const taxFiling = await TaxFiling.findOne({ user: req.userId });

        if (!taxFiling) {
            return res.status(404).json({ message: 'Tax filing not found' });
        }

        res.json(taxFiling);
    } catch (error) {
        console.error('Error getting tax filing:', error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

const parseForm16Controller =
  async (req, res) => {

    try {

      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded"
        });
      }

    console.log("TYPE:", typeof parseForm16);
    console.log("VALUE:", parseForm16);

      const extracted =
        await parseForm16(
          req.file.path
        );

      res.json(extracted);

    } catch (error) {

      console.error(
        "Form16 Parse Error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to parse Form16"
      });
    }
};

// ------------------------------------------------------------------
// Invite a CA to review a filing (User action)
// ------------------------------------------------------------------
const inviteCA = async (req, res) => {
    try {
        const filingId = req.params.id;
        const { caId } = req.body;

        // Validate ObjectId formats
        const objectIdPattern = /^[0-9a-fA-F]{24}$/;
        if (!objectIdPattern.test(filingId)) {
            return res.status(400).json({ message: 'Invalid filing ID format' });
        }
        if (caId && !objectIdPattern.test(caId)) {
            return res.status(400).json({ message: 'Invalid CA ID format' });
        }

        const filing = await TaxFiling.findById(filingId);
        if (!filing) return res.status(404).json({ message: 'Filing not found' });
        console.log("FILING USER =", filing.user.toString());
        console.log("REQ USERID =", String(req.userId));

        if (filing.user.toString() !== String(req.userId)) {
            return res.status(403).json({
                message: 'Not authorized'
            });
        }

        // Prevent re-invite or completed filings
        if (filing.status === 'completed') {
            return res.status(400).json({ message: 'Cannot invite CA for completed filing' });
        }
        if (filing.caReview?.status === 'in_review') {
            return res.status(400).json({ message: 'Filing is already under review' });
        }

        // Auto assign all reviews to Kanishka

        const defaultCA = await CA.findOne({
        email: "kanishkasiiyal@gmail.com"
        });

        if (!defaultCA) {
        return res.status(404).json({
            message: "Default CA account not found"
        });
        }

        filing.caReview = filing.caReview || {};

        filing.caReview.ca = defaultCA._id;

        filing.caReview.status = "in_review";

        await CA.findByIdAndUpdate(
        defaultCA._id,
        {
            $addToSet: {
            clients: filing.user
            }
        }
        );

        filing.status = 'pending_review';
        await filing.save();

        res.json({ message: 'CA invited successfully', filing });
    } catch (error) {
        console.error('Error inviting CA:', error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// ------------------------------------------------------------------
// CA fetches a filing for review
// ------------------------------------------------------------------
const getFilingForReview = async (req, res) => {
    try {
        const filingId = req.params.id;
        const caId = req.userId;

        if (!filingId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: 'Invalid filing ID format' });
        }

        const filing = await TaxFiling.findById(filingId)
            .populate('user', '-password -taxFilings')
            .populate('caReview.ca', '-password');

        if (!filing) return res.status(404).json({ message: 'Filing not found' });

        if (filing.caReview?.ca && filing.caReview.ca._id.toString() !== caId) {
            return res.status(403).json({ message: 'Not authorized to view this filing' });
        }

        res.json(filing);
    } catch (error) {
        console.error('Error getting filing for review:', error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

// ------------------------------------------------------------------
// CA submits review (comments/actions)
// ------------------------------------------------------------------
const submitCAReview = async (req, res) => {
    try {
        const filingId = req.params.id;
        const caId = req.userId;
        const { comments, action } = req.body;

        const objectIdPattern = /^[0-9a-fA-F]{24}$/;
        if (!objectIdPattern.test(filingId)) {
            return res.status(400).json({ message: 'Invalid filing ID format' });
        }

        if (!['approve', 'request_changes', 'save'].includes(action)) {
            return res.status(400).json({
                message: 'Invalid action. Must be approve, request_changes, or save',
            });
        }

        if (
            action !== 'save' &&
            (!comments ||
                (Array.isArray(comments)
                    ? comments.length === 0
                    : !comments.toString().trim()))
        ) {
            return res.status(400).json({ message: 'Comments are required for this action' });
        }

        const filing = await TaxFiling.findById(filingId);
        if (!filing) return res.status(404).json({ message: 'Filing not found' });

        if (filing.caReview?.ca && filing.caReview.ca.toString() !== caId) {
            return res.status(403).json({ message: 'Not authorized to review this filing' });
        }

        filing.caReview = filing.caReview || { comments: [] };
        filing.caReview.ca = caId;

        // Add new comments
        if (Array.isArray(comments)) {
            comments.forEach(c => {
                if (c.section && c.comment?.trim()) {
                    filing.caReview.comments.push({
                        section: c.section,
                        comment: c.comment.trim(),
                    });
                }
            });
        } else if (typeof comments === 'string' && comments.trim()) {
            filing.caReview.comments.push({
                section: 'general',
                comment: comments.trim(),
            });
        }

        filing.caReview.reviewedAt = new Date();
        filing.status =
            action === 'approve'
                ? 'approved'
                : action === 'request_changes'
                ? 'action_required'
                : 'pending_review';

        await filing.save();
        res.json({ message: 'Review submitted successfully', filing });
    } catch (error) {
        console.error('Error submitting CA review:', error);
        res.status(500).json({ message: `Server Error: ${error.message}` });
    }
};

const markComplete = async (req, res) => {

  try {

    const filing =
      await TaxFiling.findById(
        req.params.id
      );

    if (!filing) {
      return res.status(404).json({
        message: "Filing not found"
      });
    }

    filing.status = "completed";

    await filing.save();

    res.json({
      success: true,
      message: "Filing completed",
      status: filing.status
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: err.message
    });

  }

};

const reviewFilingController = async (req, res) => {
  try {
    const {
      income,
      deductions,
      taxPaid,
      taxRegime,
      personalInfo
    } = req.body;

    const review = await reviewFiling({
      income,
      deductions,
      taxPaid,
      taxRegime,
      personalInfo
    });

    res.json(review);
  } catch (error) {
    console.error('AI Review Error:', error);
    res.status(500).json({
      message: error.message || 'Failed to generate AI filing review'
    });
  }
};

// ------------------------------------------------------------------
// Export all functions properly
// ------------------------------------------------------------------
module.exports = {
    saveTaxFiling,
    getTaxFiling,
    inviteCA,
    getFilingForReview,
    submitCAReview,
    parseForm16Controller,
    reviewFilingController,
    markComplete
};
