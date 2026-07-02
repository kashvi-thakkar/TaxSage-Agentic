const { graph } = require("../graphs/filing.graph");

const processFilingController = async (req, res) => {
  try {

    const result = await graph.invoke({
      filePath: req.file.path
    });

    res.json(result);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: error.message
    });

  }
};

module.exports = {
  processFilingController
};
