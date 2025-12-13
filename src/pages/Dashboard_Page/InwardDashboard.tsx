import React, { useEffect, useState, useCallback } from "react";
// UI
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
// Components
import InwardForm from "@/components/InwardComponents/InwardForm";
import MaterialTable from "@/components/InwardComponents/InwardTable";
import InspectionDetails from "@/components/InwardComponents/InwardSummary";
import { StepProgressBar } from "@/components/ReusableComponents/StepProgressBar";
// Types
import { ProductType } from "@/types/inward.type";
// Utils
import { fetchJSON } from "@/utils/api";
import { validateAllFields } from "@/utils/inwardValidation";
import { validateAllMaterials } from "@/utils/materialValidation";



const InwardDashboard: React.FC = () => {
  const [step, setStep] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [nextSerial, setNextSerial] = useState("0001");

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});


  const API_URL = import.meta.env.VITE_API_URL;
  const steps = ["Add Product", "Material Details", "Summary"];

  const getTodayDate = (): string => new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState<ProductType>({
    serial_number: nextSerial,
    date: getTodayDate(),
    inward_slip_number: "",
    color: "",
    worker_no: "",
    company_name: "",
    customer_name: "",
    customer_dc_no: "",
    contact_no: "",
    materials: [
      {
        mat_type: "",
        mat_grade: "",
        bay: "",
        thick: "",
        width: "",
        length: "",
        density: "",
        unit_weight: "",
        quantity: "",
        total_weight: "",
        stock_due: "",
        remarks: "",
      },
    ],
  });


  // 🔹 Fetch total products and calculate next serial
  const getTotalProducts = useCallback(async () => {
    try {
      const data = await fetchJSON<{ "Total Product": number }>(
        `${API_URL}/api/total_product/`
      );
      const count = data["Total Product"] ?? 0;
      setTotalProducts(count);
      setNextSerial((count + 1).toString().padStart(4, "0"));
    } catch (error) {
      console.error("❌ Error fetching total products:", error);
    }
  }, [API_URL])

  useEffect(() => {
    getTotalProducts();
  }, [getTotalProducts]);

  // ✅ Sync serial number when nextSerial updates
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      serial_number: nextSerial,
    }));
  }, [nextSerial]);

  // 🔹 Step Navigation Handlers
  const handleNext = () => {
    if (step === 1) {
      const errors = validateAllFields(formData);
      setFormErrors(errors);

      if (Object.keys(errors).length > 0) {
        toast({
          title: "Invalid Input",
          description: "Please correct highlighted fields before proceeding.",
          variant: "destructive",
        });
        return;
      }
    }

    if (step === 2) {
      const materialErrors = validateAllMaterials(formData.materials);

      if (Object.keys(materialErrors).length > 0) {
        toast({
          title: "Invalid Material Rows",
          description: "Please Fill all the Material Input.",
          variant: "destructive",
        });
        return;
      }
    }

    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => step > 1 && setStep((prev) => prev - 1);

  // Reset Form
  const resetForm = () => {
    setStep(1);
    setFormData({
      serial_number: nextSerial,
      inward_slip_number: "",
      color: "",
      date: getTodayDate(),
      worker_no: "",
      company_name: "",
      customer_dc_no: "",
      customer_name: "",
      contact_no: "",
      materials: [
        {
          mat_type: "",
          mat_grade: "",
          bay: "",
          thick: "",
          width: "",
          length: "",
          unit_weight: "",
          density: "",
          quantity: "",
          total_weight: "",
          stock_due: "",
          remarks: "",
        },
      ],
    });
    setShowModal(false);
  };

  // Add Full Product
  const handleConfirm = async () => {
    if (isSubmitting) return; // Prevent double-click submissions
    setIsSubmitting(true); // Disable button + start loading  

    const stored = localStorage.getItem("user");
    const parsedUser = stored ? JSON.parse(stored) : null;
    const created_by = parsedUser?.username || "Unknown";

    try {
      // ✅ Combine Product + Materials into a single payload
      const combinedPayload = {
        serial_number: formData.serial_number,
        date: formData.date,
        inward_slip_number: formData.inward_slip_number,
        color: formData.color,
        worker_no: formData.worker_no,
        company_name: formData.company_name,
        customer_name: formData.customer_name,
        customer_dc_no: formData.customer_dc_no,
        contact_no: formData.contact_no,
        created_by: created_by,
        materials: formData.materials.map((mat) => ({
          mat_type: mat.mat_type,
          mat_grade: mat.mat_grade,
          bay: mat.bay,
          thick: mat.thick,
          width: mat.width,
          length: mat.length,
          density: mat.density,
          unit_weight: mat.unit_weight,
          quantity: mat.quantity,
          total_weight: mat.total_weight,
          stock_due: mat.stock_due,
          remarks: mat.remarks,
        })),
      };

      // ✅ Single API Call
      const response = await fetchJSON(`${API_URL}/api/add_full_product/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(combinedPayload),
      });

      toast({
        title: "Form Submitted Successfully!",
        description: "Product and materials saved Succesfully.",
      });

      resetForm();
      await getTotalProducts();
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "An error occurred while saving data.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false); // Re-enable button after completion
    }
  };

  return (
    <div className="flex flex-col items-center justify-center  px-4 sm:px-6 lg:px-8">
      <div className="w-full">

        <div className="flex justify-between items-center w-full">
          {/* Title */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-center text-gray-800 leading-tight w-[50%] -mt-4">
            Material Inward Report
          </h1>

          {/* Step Progress */}
          <StepProgressBar
            steps={steps}
            currentStep={step}
          />

        </div>

        {/* Step Components */}
        <div className="w-full">
          {step === 1 && <InwardForm formData={formData} setFormData={setFormData} setFormErrors={setFormErrors} formErrors={formErrors} />}
          {step === 2 && <MaterialTable formData={formData} setFormData={setFormData} />}
          {step === 3 && <InspectionDetails formData={formData} setFormData={setFormData} />}
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 my-8 ">
          {step > 1 && (
            <Button
              variant="outline"
              className="border-gray-400 text-gray-700 px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg rounded-xl hover:bg-gray-100 hover:text-gray-700 w-full sm:w-auto"
              onClick={handleBack}
            >
              Back
            </Button>
          )}

          {step < 3 && (
            <Button
              className="bg-blue-900 text-white px-6 sm:px-8 text-base sm:text-lg rounded-xl hover:bg-blue-800 w-full sm:w-auto"
              onClick={handleNext}
            >
              {step === 1 ? "Add Product" : "Next"}
            </Button>
          )}

          {step === 3 && (
            <Button
              className="bg-green-700 text-white px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg rounded-xl hover:bg-green-800 w-full sm:w-auto"
              onClick={() => setShowModal(true)}
            >
              Confirm
            </Button>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full text-center">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Confirm Submission</h2>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Please check your inputs carefully. Once submitted, changes cannot be made.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                className="bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 w-full sm:w-auto"
                onClick={handleConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
              <Button
                variant="outline"
                className="px-6 py-2 rounded-lg text-gray-700 hover:text-gray-700 hover:bg-gray-100 w-full sm:w-auto"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>

  );
};

export default InwardDashboard;
