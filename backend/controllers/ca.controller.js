const CA = require('../models/ca.model.js');
const TaxFiling = require('../models/taxFiling.model.js');

// ==============================
// Find CAs
// ==============================
exports.findCAs = async (req, res) => {
  try {
    const {
      specialization,
      experience,
      location,
      maxFee,
      languages,
      rating,
      services
    } = req.query;

    let query = { isVerified: true };

    if (specialization && specialization !== 'All Specializations') {
      query.specialization = { $in: [specialization] };
    }

    if (experience) {
      query.yearsOfExperience = {
        $gte: parseInt(experience)
      };
    }

    if (location && location !== 'All Locations') {
      query.location = location;
    }

    if (maxFee) {
      query.consultationFee = {
        $lte: parseInt(maxFee)
      };
    }

    if (languages) {
      query.languages = {
        $in: Array.isArray(languages)
          ? languages
          : [languages]
      };
    }

    if (rating) {
      query.rating = {
        $gte: parseFloat(rating)
      };
    }

    if (services) {
      query.services = {
        $in: Array.isArray(services)
          ? services
          : [services]
      };
    }

    const cas = await CA.find(query)
      .select('-password -clients')
      .sort({
        rating: -1,
        reviews: -1
      });

    res.json(cas);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// ==============================
// Update Profile
// ==============================
exports.updateCAProfile = async (req, res) => {
  try {

    const updates = req.body;

    delete updates.password;

    const ca = await CA.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true }
    ).select('-password');

    if (!ca) {
      return res.status(404).json({
        message: 'CA not found'
      });
    }

    res.json(ca);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};

// ==============================
// Dashboard
// ==============================
exports.getCADashboard = async (req, res) => {
  try {

    const pendingReviews =
      await TaxFiling.countDocuments({
        status: "pending_review",
        "caReview.ca": req.userId
    });

    const approved =
      await TaxFiling.countDocuments({
        status: "approved",
        "caReview.ca": req.userId
    });

    const actionRequired =
      await TaxFiling.countDocuments({
        status: "action_required",
        "caReview.ca": req.userId
    });

    res.json({
      stats: {
        pendingReviews,
        approved,
        actionRequired
      }
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};

// ==============================
// Pending Reviews
// ==============================
exports.getPendingReviews = async (req, res) => {
  try {

    const filings = await TaxFiling
      .find({
        status: "pending_review",
        "caReview.ca": req.userId
        })
        .populate(
        "user",
        "firstName lastName email"
        )
        .sort({
        updatedAt: -1
        });

    res.json(filings);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });
  }
};