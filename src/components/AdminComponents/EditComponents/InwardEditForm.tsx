import { Input } from "@/components/ui/input";
import React, { useState, useEffect, useCallback } from "react";
import { ProductType, Material } from "@/types/inward.type";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

const API_URL = import.meta.env.VITE_API_URL;

interface DensityType {
    material_name: string;
    density_value: number;
}

interface Props {
    form: ProductType;
    updateForm: (partial: Partial<ProductType>) => void;
}

const InwardEditForm: React.FC<Props> = ({ form, updateForm }) => {
    const [loading, setLoading] = useState(false);
    const [materialList, setMaterialList] = useState<DensityType[]>([]);

    const [confirmModal, setConfirmModal] = useState(false); // open before updating
    const [resultModal, setResultModal] = useState(false); // success/fail modal
    const [updated, setUpdated] = useState<"success" | "failed" | "idle">("idle");
    const [attempts, setAttempts] = useState(0);

    /* -------------------------------------------------------------
     * Fetch Material Densities (same logic as InwardTable)
     * ------------------------------------------------------------- */
    const loadDensityData = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/get_material_type/`);
            const data = await res.json();
            setMaterialList(data);
        } catch (err) {
            console.error("Density fetch failed:", err);
        }
    }, []);

    useEffect(() => {
        loadDensityData();
    }, [loadDensityData]);

    const MATERIAL_DENSITIES = materialList.reduce((acc, item) => {
        acc[item.material_name] = item.density_value;
        return acc;
    }, {} as Record<string, number>);

    const MATERIAL_TYPES = materialList.map((d) => d.material_name);

    /* -------------------------------------------------------------
     * Auto Calculation for Unit Weight, Total Weight & Stock Due
     * ------------------------------------------------------------- */
    const recalcWeights = (mat: Material): Material => {
        const { thick, width, length, density, quantity } = mat;

        const volume =
            Number(thick) && Number(width) && Number(length)
                ? Number(thick) * Number(width) * Number(length)
                : 0;

        const unitWeight =
            volume > 0 && Number(density) > 0
                ? parseFloat((volume * Number(density)).toFixed(3))
                : "";

        const totalWeight =
            Number(quantity) > 0 && Number(unitWeight) > 0
                ? parseFloat((Number(quantity) * Number(unitWeight)).toFixed(3))
                : "";

        let stock_due = "";
        if (Number(totalWeight) > 0 && Number(totalWeight) < 50) stock_due = "1";
        else if (Number(totalWeight) >= 50 && Number(totalWeight) < 200) stock_due = "3";
        else if (Number(totalWeight) >= 200) stock_due = "5";

        return { ...mat, unit_weight: unitWeight, total_weight: totalWeight, stock_due };
    };

    /* -------------------------------------------------------------
     * Update material with validation + recalculation
     * ------------------------------------------------------------- */
    const updateMaterial = (index: number, patch: Partial<Material>) => {
        const newMaterials = [...form.materials];
        let updated = { ...newMaterials[index], ...patch };

        // Auto-assign density when mat_type changes
        if (patch.mat_type) {
            updated.density = MATERIAL_DENSITIES[patch.mat_type] ?? "";
        }

        // If any weight-related field changes → recalc
        if (
            ["thick", "width", "length", "density", "quantity", "mat_type"].some((f) =>
                Object.keys(patch).includes(f)
            )
        ) {
            updated = recalcWeights(updated);
        }

        newMaterials[index] = updated;
        updateForm({ materials: newMaterials });
    };

    /* -------------------------------------------------------------
     * Update Product API Call
     * ------------------------------------------------------------- */
    const handleInwardUpdate = async () => {
        setLoading(true);

        console.log("📦 SENDING FINAL CLEAN FORM:", form);

        const cleanedForm = {
            product_id: form.product_id,
            // ----------------------------
            // Product-level fields
            // ----------------------------
            serial_number: form.serial_number,
            inward_slip_number: form.inward_slip_number,
            date: form.date,
            worker_no: form.worker_no,
            company_name: form.company_name,
            customer_name: form.customer_name,
            customer_dc_no: form.customer_dc_no,
            contact_no: form.contact_no,
            color: form.color,

            programer_status: form.programer_status ?? "pending",
            qa_status: form.qa_status ?? "pending",
            outward_status: form.outward_status ?? "pending",

            created_by: form.created_by, // username string

            // ----------------------------
            // Materials (loop)
            // ----------------------------
            materials: form.materials.map((m) => ({
                id: m.id,
                mat_type: m.mat_type,
                mat_grade: m.mat_grade,

                thick: Number(m.thick) || 0,
                width: Number(m.width) || 0,
                length: Number(m.length) || 0,
                density: Number(m.density) || 0,
                unit_weight: Number(m.unit_weight) || 0,
                quantity: Number(m.quantity) || 0,
                total_weight: Number(m.total_weight) || 0,

                bay: m.bay || "",
                stock_due: m.stock_due || "",
                remarks: m.remarks || "",

                programer_status: m.programer_status ?? "pending",
                qa_status: m.qa_status ?? "pending",
                acc_status: m.acc_status ?? "pending",
            })),
        };


        try {
            const res = await fetch(`${API_URL}/api/update_product_details/${form.product_id}/`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(cleanedForm),
            });

            if (res.ok) {
                setUpdated("success");   // <-- IMPORTANT
                setResultModal(true);
            } else {
                setUpdated("failed");    // <-- IMPORTANT
                setResultModal(true);
            }
        } catch (err) {
            console.error("UPDATE FAILED:", err);
            setUpdated("failed");        // <-- IMPORTANT
            setResultModal(true);
        }

        setLoading(false);
    };

    /* -------------------------------------------------------------
     * UI
     * ------------------------------------------------------------- */
    return (
        <div className="bg-white w-full transition-all">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b">
                <h2 className="text-2xl font-semibold text-gray-800">Edit Inward Product Details</h2>

                <Button
                    className="bg-green-600 text-white"
                    onClick={() => setConfirmModal(true)}
                    disabled={loading}
                >
                    {loading ? "Updating..." : "Update Inward"}
                </Button>
            </div>

            {/* Product Info Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6 p-4">

                {/* Serial Number (READONLY) */}
                <div className="flex flex-col">
                    <label className="text-gray-600 text-sm mb-1">Serial No.</label>
                    <Input
                        className="bg-gray-100 border border-gray-300 shadow-sm cursor-not-allowed"
                        value={form.serial_number ?? ""}
                        readOnly
                    />
                </div>

                {/* Inward Slip No (ONLY NUMBERS) */}
                <div className="flex flex-col">
                    <label className="text-gray-600 text-sm mb-1">Inward Slip No.</label>
                    <Input
                        className="bg-gray-50 border border-gray-300 shadow-sm"
                        value={form.inward_slip_number ?? ""}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (!/^\d*$/.test(val)) return; // allow only digits
                            updateForm({ inward_slip_number: val });
                        }}
                    />
                </div>

                {/* Date FIELD (CHOOSE DATE) */}
                <div className="flex flex-col">
                    <label className="text-gray-600 text-sm mb-1">Date</label>
                    <Input
                        type="date"
                        className="bg-gray-50 border border-gray-300 shadow-sm"
                        value={form.date ?? ""}
                        onChange={(e) => updateForm({ date: e.target.value })}
                    />
                </div>

                {/* Work Order No */}
                <div className="flex flex-col">
                    <label className="text-gray-600 text-sm mb-1">Work Order No.</label>
                    <Input
                        className="bg-gray-50 border border-gray-300 shadow-sm"
                        value={form.worker_no ?? ""}
                        onChange={(e) => updateForm({ worker_no: e.target.value })}
                    />
                </div>

                {/* Company Name */}
                <div className="flex flex-col">
                    <label className="text-gray-600 text-sm mb-1">Company Name</label>
                    <Input
                        className="bg-gray-50 border border-gray-300 shadow-sm"
                        value={form.company_name ?? ""}
                        onChange={(e) => updateForm({ company_name: e.target.value })}
                    />
                </div>

                {/* Customer Name */}
                <div className="flex flex-col">
                    <label className="text-gray-600 text-sm mb-1">Customer Name</label>
                    <Input
                        className="bg-gray-50 border border-gray-300 shadow-sm"
                        value={form.customer_name ?? ""}
                        onChange={(e) => updateForm({ customer_name: e.target.value })}
                    />
                </div>

                {/* Customer DC No */}
                <div className="flex flex-col">
                    <label className="text-gray-600 text-sm mb-1">Customer Document No.</label>
                    <Input
                        className="bg-gray-50 border border-gray-300 shadow-sm"
                        value={form.customer_dc_no ?? ""}
                        onChange={(e) => updateForm({ customer_dc_no: e.target.value })}
                    />
                </div>

                {/* Mobile No (ONLY NUMBERS) */}
                <div className="flex flex-col">
                    <label className="text-gray-600 text-sm mb-1">Mobile No.</label>
                    <Input
                        className="bg-gray-50 border border-gray-300 shadow-sm"
                        value={form.contact_no ?? ""}
                        maxLength={10}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (!/^\d*$/.test(val)) return;
                            updateForm({ contact_no: val });
                        }}
                    />
                </div>

                {/* COLOR – RADIO BUTTONS */}
                <div className="flex flex-col">
                    <label className="text-gray-600 text-sm mb-1">Color</label>

                    <div className="flex items-center gap-4 mt-1">
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="color"
                                value="yellow"
                                checked={form.color === "yellow"}
                                onChange={(e) => updateForm({ color: e.target.value })}
                            />
                            <span>Yellow</span>
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="color"
                                value="Quotation"
                                checked={form.color === "Quotation"}
                                onChange={(e) => updateForm({ color: e.target.value })}
                            />
                            <span>Quotation</span>
                        </label>
                    </div>
                </div>

            </div>


            {/* Material Editing */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-3 border-b">
                Edit Product Materials
            </h2>

            <div className="overflow-x-auto rounded-xl border border-gray-300">
                <table className="w-full border-collapse text-center text-sm">
                    <thead className="bg-gray-100 text-gray-700 font-semibold">
                        <tr>
                            <th className="border px-2 py-1 w-[2%]">S.No</th>
                            <th className="border px-2 py-1 w-[5%]">Bay</th>
                            <th className="border px-2 py-1 w-[5%]">TEC</th>
                            <th className="border px-2 py-1 w-[5%]">Grade</th>
                            <th className="border px-2 py-1 w-[5%]">Thick</th>
                            <th className="border px-2 py-1 w-[5%]">Width</th>
                            <th className="border px-2 py-1 w-[5%]">Length</th>
                            <th className="border px-2 py-1 w-[8%]">Density</th>
                            <th className="border px-2 py-1 w-[5%]">Unit Wt.</th>
                            <th className="border px-2 py-1 w-[5%]">Qty</th>
                            <th className="border px-2 py-1 w-[5%]">Total Wt.</th>
                            <th className="border px-2 py-1 w-[5%]">Stock Due</th>
                            <th className="border px-2 py-1 w-[10%]">Remarks</th>
                        </tr>
                    </thead>

                    <tbody>
                        {form.materials.map((mat, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                <td className="border px-2">{index + 1}</td>

                                {/* BAY */}
                                <td className="border">
                                    <input
                                        value={mat.bay ?? ""}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (!/^\d*$/.test(val)) return;
                                            updateMaterial(index, { bay: val });
                                        }}
                                        className="w-full text-center px-2 py-3"
                                    />
                                </td>

                                {/* TEC Dropdown */}
                                <td className="border">
                                    <select
                                        value={mat.mat_type ?? ""}
                                        onChange={(e) =>
                                            updateMaterial(index, { mat_type: e.target.value })
                                        }
                                        className="w-full px-2 py-3"
                                    >
                                        <option value="">Select</option>
                                        {MATERIAL_TYPES.map((t) => (
                                            <option key={t}>{t}</option>
                                        ))}
                                    </select>
                                </td>

                                {/* Grade */}
                                <td className="border">
                                    <input
                                        value={mat.mat_grade ?? ""}
                                        className="w-full text-center py-3"
                                        onChange={(e) =>
                                            updateMaterial(index, { mat_grade: e.target.value })
                                        }
                                    />
                                </td>

                                {/* Thick */}
                                <td className="border">
                                    <input
                                        value={mat.thick ?? ""}
                                        className="w-full text-center py-3"
                                        onChange={(e) =>
                                            updateMaterial(index, { thick: e.target.value })
                                        }
                                    />
                                </td>

                                {/* Width */}
                                <td className="border">
                                    <input
                                        value={mat.width ?? ""}
                                        className="w-full text-center py-3"
                                        onChange={(e) =>
                                            updateMaterial(index, { width: e.target.value })
                                        }
                                    />
                                </td>

                                {/* Length */}
                                <td className="border">
                                    <input
                                        value={mat.length ?? ""}
                                        className="w-full text-center py-3"
                                        onChange={(e) =>
                                            updateMaterial(index, { length: e.target.value })
                                        }
                                    />
                                </td>

                                {/* Density */}
                                <td className="border">
                                    <input
                                        readOnly
                                        className="w-full text-center py-3 bg-gray-100"
                                        value={mat.density ?? ""}
                                    />
                                </td>

                                {/* Thick */}
                                <td className="border">
                                    <input
                                        readOnly
                                        className="w-full text-center py-3 bg-gray-100"
                                        value={mat.unit_weight ?? ""}
                                    />
                                </td>

                                {/* Quantity */}
                                <td className="border">
                                    <input
                                        value={mat.quantity ?? ""}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (!/^\d*\.?\d*$/.test(val)) return;
                                            updateMaterial(index, { quantity: val });
                                        }}
                                        className="w-full text-center py-3"

                                    />
                                </td>

                                {/* Total Weight */}
                                <td className="border">
                                    <input
                                        readOnly
                                        className="w-full text-center py-3 bg-gray-100"
                                        value={mat.total_weight ?? ""}
                                    />
                                </td>

                                {/* Stock Due */}
                                <td className="border">
                                    <input
                                        value={mat.stock_due ?? ""}
                                        onChange={(e) => {
                                            if (!/^\d*$/.test(e.target.value)) return;
                                            updateMaterial(index, { stock_due: e.target.value });
                                        }}
                                        className="w-full text-center px-2 py-3"
                                    />
                                </td>

                                {/* Remarks */}
                                <td className="">
                                    <input
                                        value={mat.remarks ?? ""}
                                        onChange={(e) =>
                                            updateMaterial(index, { remarks: e.target.value })
                                        }
                                        className="w-full px-2 py-3"
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ---------------------------- CONFIRMATION MODAL ---------------------------- */}
            <Dialog open={confirmModal} onOpenChange={setConfirmModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirm Update</DialogTitle>
                    </DialogHeader>

                    <p className="text-gray-700">
                        Are you sure you want to update this Inward Product?
                    </p>

                    <DialogFooter className="flex justify-end gap-3 mt-4">
                        <Button variant="outline" onClick={() => setConfirmModal(false)}>
                            Cancel
                        </Button>

                        <Button
                            className="bg-green-600 text-white"
                            onClick={() => {
                                setConfirmModal(false);
                                handleInwardUpdate();
                            }}
                        >
                            Yes, Update
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ---------------------------- RESULT MODAL ---------------------------- */}
            <Dialog open={resultModal} onOpenChange={setResultModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {updated === "success" ? "Update Successful" : "Update Failed"}
                        </DialogTitle>
                    </DialogHeader>

                    {updated === "success" ? (
                        <p className="text-green-700 font-medium">
                            ✔ The product was updated successfully.
                        </p>
                    ) : (
                        <p className="text-red-700 font-medium">
                            ❌ Update failed after 3 attempts.
                            Please try again later or contact support.
                        </p>
                    )}

                    <DialogFooter>
                        <Button onClick={() => setResultModal(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default InwardEditForm;
