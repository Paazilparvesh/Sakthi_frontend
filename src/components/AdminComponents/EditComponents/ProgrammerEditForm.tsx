// import React, { useState } from "react";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { useEffect } from "react";
// import {
//     Dialog,
//     DialogContent,
//     DialogHeader,
//     DialogTitle,
//     DialogFooter,
// } from "@/components/ui/dialog";

// import { Material } from "@/types/inward.type";

// const API_URL = import.meta.env.VITE_API_URL;

// interface Props {
//     productId: number;
//     materials: Material[];
//     selectedMaterialId: number | null;
//     setSelectedMaterialId: (id: number | null) => void;
// }

// const ProgrammerEditForm: React.FC<Props> = ({
//     productId,
//     materials,
//     selectedMaterialId,
//     setSelectedMaterialId,
// }) => {
//     const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);
//     console.log(selectedMaterial);


//     useEffect(() => {
//         const pId = Number(productId);
//         const mId = Number(selectedMaterialId);


//         if (!pId || !mId || isNaN(pId) || isNaN(mId)) {

//             return;
//         }


//         const url = `${API_URL}/api/get_programer_Details/?product_id=${pId}&material_id=${mId}`;


//         const fetchProgrammerDetails = async () => {
//             try {
//                 const res = await fetch(url);

//                 if (!res.ok) {
//                     console.error("❌ SERVER ERROR:", await res.text());
//                     return;
//                 }

//                 const data = await res.json();
//                 console.log("📨 API DATA:", data);

//                 if (!Array.isArray(data) || data.length === 0) {

//                     return;
//                 }


//                 setFormData(data[0]);
//             } catch (err) {
//                 console.error("🚨 Fetch failed:", err);
//             }
//         };

//         fetchProgrammerDetails();
//     }, [productId, selectedMaterialId]);


//     const [formData, setFormData] = useState<any>({});
//     const [loading, setLoading] = useState(false);
//     const [confirmModal, setConfirmModal] = useState(false);
//     const [resultModal, setResultModal] = useState(false);
//     const [updateStatus, setUpdateStatus] = useState<"success" | "failed" | "idle">("idle");
//     const [attempts, setAttempts] = useState(0);

//     const updateField = (key: string, value: any) => {
//         setFormData((prev: any) => ({ ...prev, [key]: value }));
//     };

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//         const { name, value } = e.target;

//         setFormData((prev: any) => ({
//             ...prev,
//             [name]: value
//         }));
//     };


//     /* ---------------------------------------------------------
//      * API: Update Programmer Details
//      * --------------------------------------------------------- */
//     const handleUpdate = async () => {
//         if (!selectedMaterialId) return;

//         setLoading(true);

//         const payload = {
//             material_details: selectedMaterialId,
//             ...formData,
//         };

//         console.log("📤 PROGRAMMER UPDATE PAYLOAD:", payload);

//         try {
//             const res = await fetch(`
//                 ${API_URL}/api/update_programer_details/${productId}/`,
//                 {
//                     method: "PUT",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify(payload),
//                 }
//             );

//             if (res.ok) {
//                 setUpdateStatus("success");
//             } else {
//                 setUpdateStatus("failed");
//             }
//         } catch (err) {
//             console.error("PROGRAMMER UPDATE ERROR:", err);
//             setUpdateStatus("failed");
//         }

//         setLoading(false);
//         setResultModal(true);
//     };

//     /* ---------------------------------------------------------
//      * Programmer Fields (based on backend)
//      * --------------------------------------------------------- */
//     const programmerFields = [
//         "program_no",
//         "program_date",
//         "processed_quantity",
//         "balance_quantity",
//         "processed_width",
//         "processed_length",
//         "used_weight",
//         "number_of_sheets",
//         "cut_length_per_sheet",
//         "pierce_per_sheet",
//         "processed_mins_per_sheet",
//         "total_planned_hours",
//         "total_meters",
//         "total_piercing",
//         "total_used_weight",
//         "total_no_of_sheets",
//         "date",
//         "time",
//         "remarks",
//     ];

//     return (
//         <div className="space-y-6">
//             {/* Material Selection Table */}
//             <h3 className="text-lg font-semibold">Select Material</h3>

//             <table className="w-full border text-center">
//                 <thead className="bg-gray-100 text-gray-700">
//                     <tr>
//                         <th className="border px-2 py-1">S.No</th>
//                         <th className="border px-2 py-1">Type</th>
//                         <th className="border px-2 py-1">Grade</th>
//                         <th className="border px-2 py-1">Action</th>
//                     </tr>
//                 </thead>

//                 <tbody>
//                     {materials.map((m, i) => (
//                         <tr key={m.id} className="hover:bg-gray-50">
//                             <td className="border px-2 py-1">{i + 1}</td>
//                             <td className="border px-2 py-1">{m.mat_type}</td>
//                             <td className="border px-2 py-1">{m.mat_grade}</td>
//                             <td className="border px-2 py-1">
//                                 <Button
//                                     size="sm"
//                                     className={`${selectedMaterialId === m.id
//                                         ? "bg-green-600"
//                                         : "bg-blue-600"
//                                         }`}
//                                     onClick={() => setSelectedMaterialId(m.id)}
//                                 >
//                                     {selectedMaterialId === m.id ? "Selected" : "Edit"}
//                                 </Button>
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>

//             {/* Programmer Edit Form */}
//             {selectedMaterial && (
//                 <div className="mt-6 p-5 border rounded-lg bg-gray-50 shadow-sm">
//                     <h3 className="text-xl font-semibold mb-4">
//                         Programmer Details – {selectedMaterial.mat_type} ({selectedMaterial.mat_grade})
//                     </h3>

//                     {/* Form Fields */}
//                     {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                         {programmerFields.map((field) => (
//                             <div key={field} className="flex flex-col">
//                                 <label className="text-sm text-gray-600 capitalize">
//                                     {field.replace(/_/g, " ")}
//                                 </label>
//                                 <Input
//                                     placeholder={field.replace(/_/g, " ")}
//                                     value={formData[field] || ""}
//                                     onChange={(e) => updateField(field, e.target.value)}
//                                     className="bg-gray-50"
//                                 />
//                             </div>
//                         ))}
//                     </div> */}

//                     <div className='space-y-6'>
//                         <div className='grid md:grid-cols-3 gap-6'>
//                             {/* Material Dropdown */}
//                             <div className='flex flex-col space-y-1.5'>
//                                 <label className='text-sm font-medium text-gray-700'>
//                                     Select Material
//                                 </label>

//                                 <select
//                                     name="material_details"
//                                     value={selectedMaterialId ?? ""}   // current selected
//                                     onChange={(e) => {
//                                         const id = Number(e.target.value);
//                                         setSelectedMaterialId(id);     // updates parent selection
//                                         handleChange(e);               // updates formData.material_details
//                                     }}
//                                     className="border rounded-lg px-3 py-2 focus:ring-2 border-gray-300 focus:ring-blue-500"
//                                 >
//                                     <option value="">Select Material</option>

//                                     {materials.map((mat) => (
//                                         <option key={mat.id} value={mat.id}>
//                                             MT-{mat.mat_type} / G-{mat.mat_grade} / T-{mat.thick} / W-{mat.width} / L-{mat.length} / Qty-{mat.quantity}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>


//                             {['program_no', 'program_date'].map((key) => (
//                                 <div key={key} className='flex flex-col space-y-1.5'>
//                                     <label
//                                         htmlFor={key}
//                                         className='text-sm font-medium text-gray-700'
//                                     >
//                                         {key.replace(/_/g, " ").toUpperCase()}
//                                     </label>
//                                     <input
//                                         type={key === 'program_date' ? 'date' : 'text'}
//                                         name={key}
//                                         id={key}
//                                         value={formData[key]}
//                                         onChange={handleChange}
//                                         //   onBlur={handleBlur}
//                                         placeholder={key.replace(/_/g, " ").toUpperCase()}
//                                         className={`border rounded-lg px-3 py-2 focus:ring-2 focus:outline-none`}
//                                     />
//                                 </div>
//                             ))}
//                         </div>
//                     </div>

//                     <>
//                         <div className='w-full grid grid-cols-3 gap-6 '>
//                             {/* ================== QUANTITY ================== */}
//                             <div className='w-[55%] flex flex-col md:flex-row  items-center gap-6'>
//                                 {['processed_quantity', 'balance_quantity'].map((key) => (
//                                     <div key={key} className='w-full flex flex-col gap-1'>
//                                         <label className='text-sm font-medium text-gray-700'>
//                                             {key.replace(/_/g, " ").toUpperCase()}
//                                         </label>
//                                         <input
//                                             type='text'
//                                             name={key}
//                                             value={formData[key]}
//                                             // onChange={handleChange}
//                                             // onBlur={handleBlur}
//                                             readOnly={key === 'balance_quantity'}
//                                             className={`border rounded-lg px-3 py-1 max-w-[180px] focus:ring-2 ${key === 'balance_quantity'
//                                                 ? 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
//                                                 : 'border-gray-300 focus:ring-blue-500'
//                                                 }`}
//                                         />
//                                     </div>
//                                 ))}
//                             </div>

//                             {/* ================== WEIGHT ================== */}
//                             <div className='w-[55%] flex flex-col md:flex-row items-center  gap-6'>
//                                 {['used_weight', 'total_used_weight'].map((key) => (
//                                     <div key={key} className='w-full flex flex-col gap-1'>
//                                         <label className='text-sm font-medium text-gray-700'>
//                                             {key.replace(/_/g, " ").toUpperCase()}
//                                         </label>
//                                         <input
//                                             type='text'
//                                             name={key}
//                                             value={formData[key]}
//                                             // onChange={handleChange}
//                                             // onBlur={handleBlur}
//                                             readOnly={key === 'total_used_weight'}
//                                             className={`border rounded-lg px-3 py-1 max-w-[180px] focus:ring-2 ${key === 'total_used_weight'
//                                                 ? 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
//                                                 : 'border-gray-300 focus:ring-blue-500'
//                                                 }`}
//                                         />
//                                     </div>
//                                 ))}
//                             </div>

//                             {/* ================== SHEETS ================== */}
//                             <div className='w-[55%] flex flex-col md:flex-row items-center gap-6'>
//                                 {['number_of_sheets', 'total_no_of_sheets'].map((key) => (
//                                     <div key={key} className='w-full flex flex-col gap-1'>
//                                         <label className='text-sm font-medium text-gray-700'>
//                                             {key.replace(/_/g, " ").toUpperCase()}
//                                         </label>
//                                         <input
//                                             type='text'
//                                             name={key}
//                                             value={formData[key]}
//                                             // onChange={handleChange}
//                                             // onBlur={handleBlur}
//                                             readOnly={key === 'total_no_of_sheets'}
//                                             className={`border rounded-lg px-3 py-1 max-w-[180px] focus:ring-2 ${key === 'total_no_of_sheets'
//                                                 ? 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed'
//                                                 : 'border-gray-300 focus:ring-blue-500'
//                                                 }`}
//                                         />
//                                     </div>
//                                 ))}
//                             </div>

//                             <div className='w-[45%] flex flex-col md:flex-row items-center gap-6'>
//                                 {/* Processed Width */}
//                                 <div className='w-full flex flex-col gap-1'>
//                                     <label className='text-sm font-medium text-gray-700'>
//                                         Processed Width
//                                     </label>
//                                     <input
//                                         type='text'
//                                         name='processed_width'
//                                         value={formData.processed_width}
//                                         //   onChange={handleChange}
//                                         //   onBlur={handleBlur}
//                                         className={`border rounded-lg px-3 py-1 max-w-[180px] border-gray-300
//                             `}
//                                     />
//                                 </div>

//                                 {/* Remaining Width */}
//                                 <div className='w-full flex flex-col gap-1'>
//                                     <label className='text-sm font-medium text-gray-700'>
//                                         Remaining Width
//                                     </label>
//                                     <input
//                                         type='text'
//                                         readOnly
//                                         value={formData.width}
//                                         className='border bg-gray-100 text-gray-600 rounded-lg px-3 py-1 max-w-[180px] cursor-not-allowed'
//                                     />
//                                 </div>
//                             </div>

//                             {/* ================== PROCESSED LENGTH + REMAIN LENGTH ================== */}
//                             <div className='w-[45%] flex flex-col md:flex-row items-center gap-6'>
//                                 {/* Processed Length */}
//                                 <div className='w-full flex flex-col gap-1'>
//                                     <label className='text-sm font-medium text-gray-700'>
//                                         Processed Length
//                                     </label>
//                                     <input
//                                         type='text'
//                                         name='processed_length'
//                                         value={formData.processed_length}
//                                         //   onChange={handleChange}
//                                         //   onBlur={handleBlur}
//                                         className={`border rounded-lg px-3 py-1 max-w-[180px] focus:ring-2
//                             `}
//                                     />
//                                 </div>

//                                 {/* Remaining Length */}
//                                 <div className='w-full flex flex-col gap-1'>
//                                     <label className='text-sm font-medium text-gray-700'>
//                                         Remaining Length
//                                     </label>
//                                     <input
//                                         type='text'
//                                         readOnly
//                                         value={formData.length}
//                                         className='border bg-gray-100 text-gray-600 rounded-lg px-3 py-1 max-w-[180px] cursor-not-allowed'
//                                     />
//                                 </div>
//                             </div>
//                         </div>

//                         <div className='w-full grid grid-cols-3 gap-6 mt-5 '>
//                             {/* ===== BOX 1 : CUT LENGTH + TOTAL METERS ===== */}
//                             <div className='w-[45%] flex flex-col md:flex-row items-center gap-6'>
//                                 {/* Cut Length */}
//                                 <div className='w-full flex flex-col gap-1'>
//                                     <label className='text-sm font-medium text-gray-700'>
//                                         Cut Length
//                                     </label>
//                                     <input
//                                         type='text'
//                                         name='cut_length_per_sheet'
//                                         value={formData.cut_length_per_sheet}
//                                         //   onChange={handleChange}
//                                         //   onBlur={handleBlur}
//                                         className={`border rounded-lg px-3 py-1 max-w-[180px] focus:ring-2`}
//                                     />
//                                 </div>

//                                 {/* Total Meters */}
//                                 <div className='w-full flex flex-col gap-1'>
//                                     <label className='text-sm font-medium text-gray-700'>
//                                         Total Meters
//                                     </label>
//                                     <input
//                                         type='text'
//                                         readOnly
//                                         value={formData.total_meters}
//                                         className='border bg-gray-100 text-gray-600 rounded-lg px-3 py-1 max-w-[180px] cursor-not-allowed'
//                                     />
//                                 </div>
//                             </div>

//                             {/* ===== BOX 2 : PIERCE + TOTAL PIERCING ===== */}
//                             <div className='w-[45%] flex flex-col md:flex-row items-center gap-6'>
//                                 {/* Pierce */}
//                                 <div className='w-full flex flex-col gap-1'>
//                                     <label className='text-sm font-medium text-gray-700'>
//                                         Piercing
//                                     </label>
//                                     <input
//                                         type='text'
//                                         name='pierce_per_sheet'
//                                         value={formData.pierce_per_sheet}
//                                         //   onChange={handleChange}
//                                         //   onBlur={handleBlur}
//                                         className={`border rounded-lg px-3 py-1 max-w-[180px] focus:ring-2 `}
//                                     />
//                                 </div>

//                                 {/* Total Piercing */}
//                                 <div className='w-full flex flex-col gap-1'>
//                                     <label className='text-sm font-medium text-gray-700'>
//                                         Total Piercing
//                                     </label>
//                                     <input
//                                         type='text'
//                                         readOnly
//                                         value={formData.total_piercing}
//                                         className='border bg-gray-100 text-gray-600 rounded-lg px-3 py-1 max-w-[180px] cursor-not-allowed'
//                                     />
//                                 </div>
//                             </div>

//                             {/* ===== BOX 3 : MINUTES + TOTAL HOURS ===== */}
//                             <div className='w-[45%] flex flex-col md:flex-row items-center gap-6'>
//                                 {/* Minutes */}
//                                 <div className='w-full flex flex-col gap-1'>
//                                     <label className='text-sm font-medium text-gray-700'>
//                                         Minutes
//                                     </label>
//                                     <input
//                                         type='text'
//                                         name='processed_mins_per_sheet'
//                                         value={formData.processed_mins_per_sheet}
//                                         //   onChange={handleChange}
//                                         //   onBlur={handleBlur}
//                                         className={`border rounded-lg px-3 py-1 max-w-[180px] focus:ring-2`}
//                                     />
//                                 </div>

//                                 {/* Total Hours */}
//                                 <div className='w-full flex flex-col gap-1'>
//                                     <label className='text-sm font-medium text-gray-700'>
//                                         Total Hours
//                                     </label>
//                                     <input
//                                         type='text'
//                                         readOnly
//                                         value={formData.total_planned_hours}
//                                         className='border bg-gray-100 text-gray-600 rounded-lg px-3 py-1 max-w-[180px] cursor-not-allowed'
//                                     />
//                                 </div>
//                             </div>
//                         </div>

//                         <div className=' w-1/3 '>
//                             <h4 className='text-md font-semibold text-gray-700'>Remarks</h4>
//                             <input
//                                 type='text'
//                                 name='remarks'
//                                 value={formData.remarks}
//                                 //   onChange={handleChange}
//                                 className={`border-2 rounded-lg shadow-sm px-3 py-1 w-[calc(100%-70px)] focus:ring-2`}
//                             />
//                         </div>
//                     </>

//                     {/* Update Button */}
//                     <Button
//                         className="mt-6 bg-green-600 text-white"
//                         onClick={() => setConfirmModal(true)}
//                         disabled={loading}
//                     >
//                         {loading ? "Updating..." : "Update Programmer"}
//                     </Button>
//                 </div>
//             )
//             }

//             {/* ---------------------------------------------------------
//         CONFIRMATION MODAL
//       --------------------------------------------------------- */}
//             <Dialog open={confirmModal} onOpenChange={setConfirmModal}>
//                 <DialogContent className="max-w-md">
//                     <DialogHeader>
//                         <DialogTitle>Confirm Update</DialogTitle>
//                     </DialogHeader>

//                     <p className="text-gray-700">
//                         Are you sure you want to update programmer details?
//                     </p>

//                     <DialogFooter className="flex justify-end gap-3 mt-4">
//                         <Button variant="outline" onClick={() => setConfirmModal(false)}>
//                             Cancel
//                         </Button>
//                         <Button
//                             className="bg-green-600 text-white"
//                             onClick={() => {
//                                 setConfirmModal(false);
//                                 handleUpdate();
//                             }}
//                         >
//                             Yes, Update
//                         </Button>
//                     </DialogFooter>
//                 </DialogContent>
//             </Dialog>

//             {/* ---------------------------------------------------------
//         RESULT MODAL
//       --------------------------------------------------------- */}
//             <Dialog open={resultModal} onOpenChange={setResultModal}>
//                 <DialogContent className="max-w-md">
//                     <DialogHeader>
//                         <DialogTitle>
//                             {updateStatus === "success"
//                                 ? "Update Successful"
//                                 : "Update Failed"}
//                         </DialogTitle>
//                     </DialogHeader>

//                     {updateStatus === "success" ? (
//                         <p className="text-green-700 font-medium">
//                             ✔ Programmer details updated successfully.
//                         </p>
//                     ) : (
//                         <p className="text-red-700 font-medium">
//                             ❌ Update failed. Please try again or contact support.
//                         </p>
//                     )}

//                     <DialogFooter>
//                         <Button onClick={() => setResultModal(false)}>Close</Button>
//                     </DialogFooter>
//                 </DialogContent>
//             </Dialog>
//         </div >
//     );
// };

// export default ProgrammerEditForm;




import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

import { Material } from "@/types/inward.type";

const API_URL = import.meta.env.VITE_API_URL;

interface Props {
    productId: number;
    materials: Material[];
    selectedMaterialId: number | null;
    setSelectedMaterialId: (id: number | null) => void;
}

const ProgrammerEditForm: React.FC<Props> = ({
    productId,
    materials,
    selectedMaterialId,
    setSelectedMaterialId,
}) => {

    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [confirmModal, setConfirmModal] = useState(false);
    const [resultModal, setResultModal] = useState(false);
    const [updateStatus, setUpdateStatus] = useState<"success" | "failed" | "idle">("idle");

    /* ---------------------------------------------
        HANDLE DROPDOWN MATERIAL CHANGE
    --------------------------------------------- */
    const handleMaterialChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = Number(e.target.value);
        setSelectedMaterialId(id);
        setFormData({});
    };

    useEffect(() => {
    if (materials.length === 1 && !selectedMaterialId) {
        setSelectedMaterialId(materials[0].id);  // auto-select
    }
}, [materials, selectedMaterialId]);

    /* ---------------------------------------------
        LOAD PROGRAMMER DETAILS WHEN MATERIAL CHANGES
    --------------------------------------------- */
    useEffect(() => {
        if (!selectedMaterialId) return;

        const url = `${API_URL}/api/get_programer_Details/?product_id=${productId}&material_id=${selectedMaterialId}`;

        const fetchDetails = async () => {
            try {
                const res = await fetch(url);
                if (!res.ok) {
                    console.error("FETCH ERROR:", await res.text());
                    return;
                }

                const data = await res.json();
                if (!Array.isArray(data) || data.length === 0) return;

                setFormData(data[0]);
            } catch (err) {
                console.error("FETCH FAILED:", err);
            }
        };

        fetchDetails();
    }, [selectedMaterialId, productId]);

    /* ---------------------------------------------
        FORM FIELD CHANGE HANDLER
    --------------------------------------------- */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prev: any) => ({
            ...prev,
            [name]: value,
        }));
    };

    /* ---------------------------------------------
        UPDATE PROGRAMMER DETAILS
    --------------------------------------------- */
    const handleUpdate = async () => {
        if (!selectedMaterialId) return;

        setLoading(true);

        const payload = {
            material_details: selectedMaterialId,
            ...formData,
        };

        console.log("📤 PAYLOAD:", payload);

        try {
            const res = await fetch(
                `${API_URL}/api/update_programer_details/${productId}/`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            setUpdateStatus(res.ok ? "success" : "failed");
        } catch (err) {
            console.error("UPDATE ERROR:", err);
            setUpdateStatus("failed");
        }

        setLoading(false);
        setResultModal(true);
    };

    /* ---------------------------------------------
        PROGRAMMER FIELDS
    --------------------------------------------- */
    const fields = [
        "program_no",
        "program_date",
        "processed_quantity",
        "balance_quantity",
        "processed_width",
        "processed_length",
        "used_weight",
        "total_used_weight",
        "number_of_sheets",
        "total_no_of_sheets",
        "cut_length_per_sheet",
        "total_meters",
        "pierce_per_sheet",
        "total_piercing",
        "processed_mins_per_sheet",
        "total_planned_hours",



        "remarks",
    ];

    const label = (key: string) => key.replace(/_/g, " ").toUpperCase();

    return (
        <div className="space-y-6">

            {/* ----------------- MATERIAL DROPDOWN ----------------- */}
            <div className="flex flex-col space-y-1.5 w-full md:w-1/3">
                <label className="text-sm font-medium text-gray-700">
                    Select Material
                </label>
                <select
                    value={selectedMaterialId ?? ""}
                    onChange={handleMaterialChange}
                    className="border rounded-lg px-3 py-2 focus:ring-2 border-gray-300 focus:ring-blue-500"
                >
                    <option value="">Select Material</option>

                    {materials.map((mat) => (
                        <option key={mat.id} value={mat.id}>
                            MT-{mat.mat_type} / G-{mat.mat_grade} / T-{mat.thick} / W-{mat.width} / L-{mat.length} / Qty-{mat.quantity}
                        </option>
                    ))}
                </select>
            </div>

            {/* ----------------- SHOW FIELDS ONLY AFTER MATERIAL SELECTED ----------------- */}
            {selectedMaterialId && (
                <div className="mt-4 p-5 border rounded-xl bg-gray-50 shadow-sm space-y-6">
                    <h3 className="text-xl font-semibold">
                        Programmer Details
                    </h3>

                    {/* ----------------- FORM FIELDS ----------------- */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {fields.map((key) => (
                            <div key={key} className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-gray-700">
                                    {label(key)}
                                </label>

                                <input
                                    type={key.includes("date") ? "date" : "text"}
                                    name={key}
                                    value={formData[key] || ""}
                                    onChange={handleChange}
                                    readOnly={key.startsWith("total_") || key === "balance_quantity"}
                                    className={`border rounded-lg px-3 py-2 focus:ring-2 ${key.startsWith("total_") ||
                                            key === "balance_quantity"
                                            ? "bg-gray-100 cursor-not-allowed border-gray-200"
                                            : "border-gray-300 focus:ring-blue-500"
                                        }`}
                                />
                            </div>
                        ))}
                    </div>

                    {/* ----------------- UPDATE BUTTON ----------------- */}
                    <Button
                        className="mt-4 bg-green-600 text-white"
                        onClick={() => setConfirmModal(true)}
                        disabled={loading}
                    >
                        {loading ? "Updating..." : "Update Programmer"}
                    </Button>
                </div>
            )}

            {/* ----------------- CONFIRM MODAL ----------------- */}
            <Dialog open={confirmModal} onOpenChange={setConfirmModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Update</DialogTitle>
                    </DialogHeader>

                    <p className="text-gray-700">
                        Are you sure you want to update programmer details?
                    </p>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-green-600"
                            onClick={() => {
                                setConfirmModal(false);
                                handleUpdate();
                            }}
                        >
                            Yes, Update
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ----------------- RESULT MODAL ----------------- */}
            <Dialog open={resultModal} onOpenChange={setResultModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {updateStatus === "success"
                                ? "Update Successful"
                                : "Update Failed"}
                        </DialogTitle>
                    </DialogHeader>

                    <p
                        className={`font-medium ${updateStatus === "success"
                                ? "text-green-700"
                                : "text-red-700"
                            }`}
                    >
                        {updateStatus === "success"
                            ? "✔ Programmer details updated successfully."
                            : "❌ Update failed. Please try again."}
                    </p>

                    <DialogFooter>
                        <Button onClick={() => setResultModal(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProgrammerEditForm;
