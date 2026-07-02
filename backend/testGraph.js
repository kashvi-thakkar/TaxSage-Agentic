require("dotenv").config();

const {
  graph
} = require("./graphs/filing.graph");

async function run() {

  const result =
    await graph.invoke({

      filePath:
        "./uploads/1655725194_sampleform16.pdf"

    });

  console.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );

}

run();