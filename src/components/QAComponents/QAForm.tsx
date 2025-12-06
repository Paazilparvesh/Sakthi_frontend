import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Material } from "@/types/inward.type";
import { QAData } from "@/types/qa.type";

interface QAFormProps {
  productId: number;
  companyName: string;
  materials: Material[];
  program: QAData[];
  onBack: () => void;
  onSubmitSuccess?: () => void;
}

interface QAFormData {
  material_details: string;
  processed_date: string;
  shift: string;
  no_of_sheets: string;
  cycletime_per_sheet: string;
  total_cycle_time: number;
  total_cycle_time_formatted: string,
  created_by_qa?: string;
  created_by_acc?: string;
}

interface Operator {
  id: number;
  operator_name: string;
}

const QAForm: React.FC<QAFormProps> = ({
  productId,
  companyName,
  materials,
  program,
  onBack,
  onSubmitSuccess,
}) => {
  const { toast } = useToast();
  const [operators, setOperators] = useState<string[]>([]);
  const [loadingOperators, setLoadingOperators] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const allowOnlyNumbers = (value: string) => /^(\d+(\.\d*)?|\.\d+)?$/.test(value);

  const API_URL = import.meta.env.VITE_API_URL;
  const stored = localStorage.getItem("user");
  const parsedUser = stored ? JSON.parse(stored) : null;
  const user_name = parsedUser?.username;


  const [machines, setMachines] = useState<{ id: number; machine: string }[]>([]);

  // Store selected machines + times
  const [machineTimes, setMachineTimes] = useState<
    {
      machine: string;
      date: string;
      start: string;
      end: string;
      runtime: string;
      air?: string;
      operator: string;
    }[]
  >([]);




  const [formData, setFormData] = useState<QAFormData>({
    material_details: "",
    processed_date: new Date().toISOString().split("T")[0],
    shift: "",
    no_of_sheets: "",
    cycletime_per_sheet: "",
    total_cycle_time: 0,
    total_cycle_time_formatted: "",
  });


  const programmedMaterialIds = useMemo(() => {
    const set = new Set<number>();
    program.forEach((p: QAData) => {
      if (p.material_details) {
        set.add(
          typeof p.material_details === "object"
            ? p.material_details
            : p.material_details
        );
      }
    });
    return set;
  }, [program]);

  // Auto-select material if only one QA-pending material exists
  useEffect(() => {
    const eligibleMats = materials
      .filter((m) => programmedMaterialIds.has(m.id)) // programmed
      .filter((m) => m.qa_status === "pending");      // pending for QA

    if (eligibleMats.length === 1) {
      const single = eligibleMats[0];

      setFormData((prev) => ({
        ...prev,
        material_details: single.id.toString(),
      }));

      // Clear any error for material
      setFormErrors((prev) => ({ ...prev, material_details: "" }));
    }
  }, [materials, programmedMaterialIds]);



  // Called when user checks/unchecks a machine
  const toggleMachine = (machine: string, checked: boolean) => {
    const requiresAir = ["maha", "blaze", "merit"].includes(
      machine.toLowerCase().trim()
    );

    if (checked) {
      setMachineTimes((prev) => [
        ...prev,
        {
          machine,
          date: "",
          start: "",
          end: "",
          runtime: "",
          air: requiresAir ? "" : undefined,
          operator: "",
        },
      ]);
    } else {
      setMachineTimes((prev) => prev.filter((m) => m.machine !== machine));
    }
  };


  const updateMachineField = (
    machine: string,
    field: "start" | "end" | "date",
    value: string
  ) => {
    setMachineTimes((prev) =>
      prev.map((m) => {
        if (m.machine !== machine) return m;

        const updated = { ...m, [field]: value };

        // Auto calculate runtime
        if (updated.start && updated.end) {
          const start = new Date(`2000-01-01T${updated.start}`);
          const end = new Date(`2000-01-01T${updated.end}`);

          let diff = (end.getTime() - start.getTime()) / 60000; // minutes

          if (diff < 0) diff += 24 * 60; // handle midnight crossing

          const hours = Math.floor(diff / 60);
          const mins = diff % 60;
          updated.runtime = `${hours.toString().padStart(2, "0")}:${mins
            .toString()
            .padStart(2, "0")}`;
        }

        return updated;
      })
    );
  };

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const res = await fetch(`${API_URL}/api/get_machines/`);
        const data = await res.json();

        if (!res.ok) throw new Error("Failed to load machines");
        setMachines(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Unable to load machines.",
          variant: "destructive",
        });
      }
    };

    fetchMachines();
  }, [API_URL, toast]);


  /* ------------  FETCH OPERATORS  ---------------*/
  useEffect(() => {
    const fetchOps = async () => {
      try {
        setLoadingOperators(true);
        const res = await fetch(`${API_URL}/api/get_operator/`);
        const data = await res.json();

        if (!res.ok) throw new Error("Failed to load operators");

        setOperators(data.map((op: Operator) => op.operator_name));
      } catch (err) {
        toast({
          title: "Error",
          description: "Unable to load operator list.",
          variant: "destructive",
        });
      } finally {
        setLoadingOperators(false);
      }
    };

    fetchOps();
  }, [API_URL, toast]);

  /* -----------  INPUT HANDLER  ------------------*/
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {

    const { name, value } = e.target;

    // 🔹 Numeric fields (auto-block invalid input)
    const numericFields = [
      "no_of_sheets",
      "cycletime_per_sheet",
    ];

    if (numericFields.includes(name)) {
      if (!allowOnlyNumbers(value)) return; // ❌ block invalid
    }

    const updated = { ...formData, [name]: value };


    if (["no_of_sheets", "cycletime_per_sheet"].includes(name)) {
      const sheets = Number(name === "no_of_sheets" ? value : formData.no_of_sheets);
      const cycle = Number(name === "cycletime_per_sheet" ? value : formData.cycletime_per_sheet);

      const total = sheets > 0 && cycle > 0 ? sheets * cycle : 0;

      updated.total_cycle_time = total;
      updated.total_cycle_time_formatted = formatToHoursMinutes(total);
    }


    setFormData(updated);
    validateField(name, value);
  };

  const updateAirField = (machine: string, value: string) => {
    setMachineTimes((prev) =>
      prev.map((m) => (m.machine === machine ? { ...m, air: value } : m))
    );
  };

  const updateOperatorField = (machine: string, value: string) => {
    setMachineTimes((prev) =>
      prev.map((m) => (m.machine === machine ? { ...m, operator: value } : m))
    );
  };



  /* -----------  VALIDATION  --------------------*/
  const validateField = (name: string, value: string) => {
    let error = "";

    if (!value.trim()) {
      error = "This field is required.";
    } else if (
      ["no_of_sheets", "cycletime_per_sheet"].includes(name) &&
      (isNaN(Number(value)) || Number(value) <= 0)
    ) {
      error = "Must be a positive number.";
    }

    setFormErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  };

  const validateForm = () => {
    const requiredFields: (keyof QAFormData)[] = [
      "material_details",
      "processed_date",
      "shift",
      "no_of_sheets",
      "cycletime_per_sheet",
    ];

    let hasError = false;
    const newErr: Record<string, string> = {};

    if (machineTimes.length === 0) {
      toast({
        title: "Missing Machine Details",
        description: "Please select at least one machine and enter runtime details.",
        variant: "destructive",
      });
      return false;
    }

    for (const mt of machineTimes) {
      if (!mt.date || !mt.start || !mt.end || !mt.runtime) {
        toast({
          title: "Incomplete Machine Runtime",
          description: `Please enter date, start, and end time for machine ${mt.machine}.`,
          variant: "destructive",
        });
        return false;
      }
    }


    requiredFields.forEach((field) => {
      const err = validateField(field, String(formData[field]));
      if (err) hasError = true;
      newErr[field] = err;
    });

    setFormErrors(newErr);
    return !hasError;
  };

  /* -----------  SUBMIT  ---------------*/
  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Create converted machine times list
    const convertedMachineTimes = machineTimes.map((mt) => ({
      machine: mt.machine,
      date: mt.date,
      start: mt.start,
      end: mt.end,
      runtime: mt.runtime,      // HH:MM auto-calculated
    }));


    const payload = {
      product_details: productId,
      ...formData,
      no_of_sheets: Number(formData.no_of_sheets),
      cycletime_per_sheet: Number(formData.cycletime_per_sheet),
      machines_used: machineTimes.map((mt) => ({
        machine: mt.machine,
        date: mt.date,
        start: mt.start,
        end: mt.end,
        runtime: mt.runtime,
        air: mt.air ?? null, // include AIR if available
        operator: mt.operator,
      })),
      created_by: user_name,
    };

    try {
      const res = await fetch(`${API_URL}/api/add_qa_details/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      toast({
        title: "Success",
        description: "QA details saved successfully.",
      });

      onSubmitSuccess?.();
      onBack();
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to save QA data.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  };

  /* --------------  UI  -----------------*/
  const formatToHoursMinutes = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };



  return (
    <div className="bg-white p-6 rounded-xl shadow-md">

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (validateForm()) setShowConfirm(true);
        }}
        className="space-y-4"
      >

        {/* ---------------- ROW 1 (2 fields) ---------------- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Material */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Material</label>
            <select
              name="material_details"
              value={formData.material_details}
              onChange={handleChange}
              className={`border rounded-lg px-3 py-2 ${formErrors.material_details ? "border-red-500" : "border-gray-300"
                }`}
            >
              <option value="">Select Material</option>
              {materials
                .filter((m) => programmedMaterialIds.has(m.id))   // ONLY programmed materials
                .filter((m) => m.qa_status === "pending")
                .map((mat) => (
                  <option key={mat.id} value={mat.id}>
                    MT- {mat.mat_type} / G- {mat.mat_grade} / T-{' '}
                    {mat.thick}mm / W- {mat.width} / L- {mat.length} /
                    Qty- {mat.quantity}
                  </option>
                ))}
            </select>
            {formErrors.material_details && (
              <p className="text-red-500 text-xs">{formErrors.material_details}</p>
            )}
          </div>

          {/* Processed Date */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Processed Date</label>
            <input
              type="date"
              name="processed_date"
              value={formData.processed_date}
              onChange={handleChange}
              className={`border rounded-lg px-3 py-2 ${formErrors.processed_date ? "border-red-500" : "border-gray-300"
                }`}
            />
            {formErrors.processed_date && (
              <p className="text-red-500 text-xs">{formErrors.processed_date}</p>
            )}
          </div>

          {/* Shift */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Shift</label>
            <select
              name="shift"
              value={formData.shift}
              onChange={handleChange}
              className={`border rounded-lg px-3 py-2 ${formErrors.shift ? "border-red-500" : "border-gray-300"
                }`}
            >
              <option value="">Select Shift</option>
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
            </select>
            {formErrors.shift && <p className="text-red-500 text-xs">{formErrors.shift}</p>}
          </div>

        </div>

        {/* ---------------- ROW 2 (3 fields) ---------------- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* No of Sheets */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-gray-700">No. of Sheets</label>
            <input
              type="text"
              name="no_of_sheets"
              value={formData.no_of_sheets}
              onChange={handleChange}
              placeholder="Enter Processed Sheets"
              className={`border rounded-lg px-3 py-2 ${formErrors.no_of_sheets ? "border-red-500" : "border-gray-300"
                }`}
            />
            {formErrors.no_of_sheets && (
              <p className="text-red-500 text-xs">{formErrors.no_of_sheets}</p>
            )}
          </div>

          {/* Cycle Time Per Sheet */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Cycle Time Per Sheet (mins)</label>
            <input
              type="text"
              name="cycletime_per_sheet"
              value={formData.cycletime_per_sheet}
              onChange={handleChange}
              placeholder="Enter Cycle Time Per Sheet"
              className={`border rounded-lg px-3 py-2 ${formErrors.cycletime_per_sheet ? "border-red-500" : "border-gray-300"
                }`}
            />
            {formErrors.cycletime_per_sheet && (
              <p className="text-red-500 text-xs">{formErrors.cycletime_per_sheet}</p>
            )}
          </div>

          {/* Total Cycle Time */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Total Cycle Time (HH:MM)</label>
            <input
              type="text"
              value={formData.total_cycle_time_formatted}
              readOnly
              className="border border-gray-200 bg-gray-100 rounded-lg px-3 py-2"
            />
          </div>

        </div>

        {/* MACHINE SELECTION (CHECKBOX LIST) */}
        <div className="flex flex-col space-y-2 mt-4">
          <label className="text-sm font-medium text-gray-700">Machines Used</label>

          <div className="grid grid-cols-1 md:grid-cols-9 gap-3">
            {machines.map((m) => {
              const isChecked = machineTimes.some((mt) => mt.machine === m.machine);

              return (
                <div key={m.id} className="flex items-center gap-3 border p-3 rounded-lg">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => toggleMachine(m.machine, e.target.checked)}
                    className="h-4 w-4"
                  />

                  <span className="font-medium">{m.machine}</span>
                </div>
              );
            })}
          </div>

          {/* Time Inputs for selected machines */}
          {machineTimes.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse text-sm sm:text-base">
                <thead className="">
                  <tr className="border-b bg-slate-100 text-center">
                    <th className="py-1 px-2 border w-[5%]">Machine</th>
                    <th className="py-1 px-2 border w-[5%]">Date</th>
                    <th className="py-1 px-2 border w-[5%]">Start Time</th>
                    <th className="py-1 px-2 border w-[5%]">End Time</th>
                    <th className="py-1 px-2 border w-[10%]">Runtime (HH:MM)</th>
                    <th className="py-1 px-2 border w-[15%]">Operator</th>
                    <th className="py-1 px-2 border w-[10%]">Air</th>
                  </tr>
                </thead>
                <tbody>
                  {machineTimes.map((mt) => {
                    const requiresAir = ["maha", "blaze", "merit"].includes(
                      mt.machine.toLowerCase().trim()
                    );

                    return (
                      <tr
                        key={mt.machine}
                        className="hover:bg-slate-50 even:bg-gray-50 odd:bg-white transition-all border text-center text-sm"
                      >
                        {/* MACHINE */}
                        <td className="py-1 px-4 font-medium text-gray-700">{mt.machine}</td>

                        {/* DATE */}
                        <td className="border">
                          <input
                            type="date"
                            value={mt.date}
                            onChange={(e) =>
                              updateMachineField(mt.machine, "date", e.target.value)
                            }
                            className="px-3 py-2 w-full"
                          />
                        </td>

                        {/* START */}
                        <td className="border">
                          <input
                            type="time"
                            value={mt.start}
                            onChange={(e) =>
                              updateMachineField(mt.machine, "start", e.target.value)
                            }
                            className="px-3 py-2 w-full"
                          />
                        </td>

                        {/* END */}
                        <td className="border">
                          <input
                            type="time"
                            value={mt.end}
                            onChange={(e) =>
                              updateMachineField(mt.machine, "end", e.target.value)
                            }
                            className="px-3 py-2 w-full"
                          />
                        </td>

                        {/* RUNTIME */}
                        <td className="border bg-gray-100">
                          <input
                            type="text"
                            value={mt.runtime}
                            readOnly
                            className="bg-transparent text-gray-700 text-center py-1 w-full"
                          />
                        </td>

                        {/* OPERATOR */}
                        <td className="border">
                          <select
                            name="operator_name"
                            value={mt.operator}
                            onChange={(e) => updateOperatorField(mt.machine, e.target.value)}
                            className="px-3 py-2 w-full"
                          >
                            <option value="">Select Operator</option>
                            {loadingOperators ? (
                              <option>Loading…</option>
                            ) : (
                              operators.map((op, i) => <option key={i}>{op}</option>)
                            )}
                          </select>
                        </td>

                        {/* AIR COLUMN — ONLY FOR SPECIFIC MACHINES */}
                        <td className="border">
                          {requiresAir ? (
                            <select
                              value={mt.air || ""}
                              onChange={(e) => updateAirField(mt.machine, e.target.value)}
                              className="px-3 py-2 w-full"
                            >
                              <option value="">Select Air</option>
                              <option value="Nitrogen">Nitrogen</option>
                              <option value="Oxygen">Oxygen</option>
                            </select>
                          ) : (
                            <span className="text-gray-400 text-xs italic">N/A</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>
          )}


        </div>



        {/* BUTTONS */}
        <div className="flex gap-4 justify-center mt-8">
          <Button type="button" onClick={onBack} className="bg-gray-300 hover:bg-gray-200 text-black">
            Cancel
          </Button>
          <Button type="submit" className="bg-blue-700 text-white">
            Submit QA
          </Button>
        </div>
      </form>


      {/* CONFIRMATION DIALOG */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Submission</DialogTitle>
          </DialogHeader>

          <p className="mt-2 text-gray-600">
            Are you sure you want to submit QA details for <b>{companyName}</b>?
          </p>

          <DialogFooter className="mt-5">
            <Button variant="outline" onClick={() => setShowConfirm(false)} className="bg-gray-300 hover:bg-gray-200 hover:text-black">
              Cancel
            </Button>
            <Button className="bg-blue-700 text-white" onClick={handleSubmit}>
              {isSubmitting ? "Submitting..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QAForm;
