import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ITRReviewPage() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [filing, setFiling] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const loadFiling = async () => {

      try {

        const response = await fetch(
          `http://localhost:5001/api/tax/filing/${id}`,
          {
            headers: {
              Authorization:
                `Bearer ${localStorage.getItem("token")}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          alert(data.message || "Failed to load filing");
          return;
        }

        setFiling(data);
        console.log("FULL FILING", data);
        console.log("INCOME", data.income);

      } catch (err) {

        console.error(err);

        alert("Failed to load filing");

      } finally {

        setLoading(false);

      }

    };

    loadFiling();

  }, [id]);

  const downloadJson = async () => {

    try {

      const response = await fetch(
        `http://localhost:5001/api/tax/${id}/download-json`,
        {
        method: "GET",
          headers: {
            Authorization:
              `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      const data = await response.json();

      const blob = new Blob(
        [
          JSON.stringify(
            data,
            null,
            2
          )
        ],
        {
          type: "application/json"
        }
      );

      const url =
        URL.createObjectURL(blob);

      const a =
        document.createElement("a");

      a.href = url;

      a.download =
        `ITR-${id}.json`;

      document.body.appendChild(a);

      a.click();

      document.body.removeChild(a);

      URL.revokeObjectURL(url);

      alert(
        "ITR JSON downloaded successfully. Filing completed."
      );

      navigate("/dashboard");

    } catch (err) {

      console.error(err);

      alert(
        "Failed to download JSON"
      );

    }

  };

  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading filing...
      </div>
    );

  }

  if (!filing) {

    return (
      <div className="min-h-screen flex items-center justify-center">
        Filing not found
      </div>
    );

  }

  return (

    <div className="min-h-screen bg-[#f8fafc] p-8">

      <div className="max-w-6xl mx-auto">

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-[#293241]">
            Review Filing
          </h1>

          <p className="text-[#3d5a80] mt-2">
            Review all information before downloading
            your ITR JSON file.
          </p>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="bg-white rounded-xl border border-[#98c1d9] p-6">

            <h2 className="text-xl font-semibold text-[#293241] mb-4">
              Personal Information
            </h2>

            <div className="space-y-3">

              <div>
                <span className="font-medium">
                  Name:
                </span>{" "}
                {filing.personalInfo?.firstName}{" "}
                {filing.personalInfo?.lastName}
              </div>

              <div>
                <span className="font-medium">
                  PAN:
                </span>{" "}
                {filing.personalInfo?.pan}
              </div>

              <div>
                <span className="font-medium">
                  Address:
                </span>{" "}
                {filing.personalInfo?.address?.street}
              </div>

            </div>

          </div>

          <div className="bg-white rounded-xl shadow-sm border border-[#98c1d9] p-6">
            <h2 className="text-2xl font-bold text-[#293241] mb-6">
                Income Details
            </h2>

            <div className="bg-white rounded-xl shadow-sm border border-[#98c1d9] p-6">
                <h2 className="text-2xl font-bold text-[#293241] mb-6">
                    Income Details
                </h2>

                <div className="space-y-4">

                    <div className="flex justify-between">
                    <span>Gross Salary</span>
                    <span>
                        ₹{(
                        filing.income?.salary?.total || 0
                        ).toLocaleString("en-IN")}
                    </span>
                    </div>

                    <div className="flex justify-between">
                    <span>Taxable Income</span>
                    <span>
                        ₹{(
                        filing.income?.salary?.taxableIncome || 0
                        ).toLocaleString("en-IN")}
                    </span>
                    </div>

                    <div className="flex justify-between">
                    <span>Standard Deduction</span>
                    <span>
                        ₹{(
                        filing.income?.salary?.standardDeduction || 0
                        ).toLocaleString("en-IN")}
                    </span>
                    </div>

                    <div className="flex justify-between">
                    <span>HRA Exemption</span>
                    <span>
                        ₹{(
                        filing.income?.salary?.hraExemption || 0
                        ).toLocaleString("en-IN")}
                    </span>
                    </div>

                    <div className="flex justify-between">
                    <span>Total Deductions</span>
                    <span>
                        ₹{(
                        filing.deductions?.total || 0
                        ).toLocaleString("en-IN")}
                    </span>
                    </div>

                    <div className="flex justify-between">
                    <span>TDS Paid</span>
                    <span>
                        ₹{(
                        filing.taxPaid?.tds || 0
                        ).toLocaleString("en-IN")}
                    </span>
                    </div>

                </div>
                </div>
        </div>

          <div className="bg-white rounded-xl border border-[#98c1d9] p-6">

            <h2 className="text-xl font-semibold text-[#293241] mb-4">
              Deductions
            </h2>

            <div className="space-y-3">

              <div>
                80C: ₹
                {filing.deductions?.section80C?.toLocaleString(
                  "en-IN"
                ) || 0}
              </div>

              <div>
                80D: ₹
                {filing.deductions?.section80D?.toLocaleString(
                  "en-IN"
                ) || 0}
              </div>

              <div>
                80G: ₹
                {filing.deductions?.section80G?.toLocaleString(
                  "en-IN"
                ) || 0}
              </div>

            </div>

          </div>

          <div className="bg-white rounded-xl border border-[#98c1d9] p-6">

            <h2 className="text-xl font-semibold text-[#293241] mb-4">
              CA Review
            </h2>

            <div className="space-y-3">

              <div>
                Status:
                <span className="ml-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                  Approved
                </span>
              </div>

              <div>
                Comments:
              </div>

              <div className="bg-[#f8fafc] p-3 rounded-lg border border-[#98c1d9]">

            {Array.isArray(filing.caReview?.comments) &&
            filing.caReview.comments.length > 0 ? (

                filing.caReview.comments.map((commentObj) => (

                <div
                    key={commentObj._id}
                    className="mb-3 pb-3 border-b border-gray-200 last:border-b-0"
                >

                    <div className="font-semibold text-[#293241]">
                    {commentObj.section}
                    </div>

                    <div className="text-[#3d5a80]">
                    {commentObj.comment}
                    </div>

                </div>

                ))

            ) : (

                <div>No comments provided</div>

            )}

            </div>

            </div>

          </div>

        </div>

        <div className="mt-8 flex justify-end">

          <button
            onClick={downloadJson}
            className="px-6 py-3 bg-[#3d5a80] text-white rounded-lg hover:bg-[#293241] transition-colors"
          >
            Download ITR JSON
          </button>

        </div>

      </div>

    </div>

  );

}