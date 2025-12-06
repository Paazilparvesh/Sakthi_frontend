import { InwardProps } from "@/types/inward.type";

const InwardSummary: React.FC<InwardProps> = ({ formData }) => {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 w-full max-w-8xl mx-auto transition-all">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h2 className="text-2xl font-semibold text-gray-800">Inward Product Details</h2>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-2 p-4">
                {[
                    { label: "Serial No.", value: formData.serial_number },
                    { label: "Inward Slip No.", value: formData.inward_slip_number },
                    { label: "Date", value: formData.date },
                    { label: "Work Order No.", value: formData.worker_no },
                    { label: "Company Name", value: formData.company_name },
                    { label: "Customer Name", value: formData.customer_name },
                    { label: "Customer Document No.", value: formData.customer_dc_no },
                    { label: "Mobile No.", value: formData.contact_no },
                    { label: "Color", value: formData.color },
                ].map(({ label, value }) => (
                    <div key={label} className="flex flex-col">
                        <label className="text-gray-600 text-sm font-medium mb-1">{label}</label>
                        <div className="w-full border border-gray-300 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-800 shadow-sm">
                            {value || "—"}
                        </div>
                    </div>
                ))}
            </div>

            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h2 className="text-2xl font-semibold text-gray-800">Product Materials Details</h2>
            </div>

            {/* Material Table */}
            <div className="mt-4 overflow-x-auto rounded-xl border border-gray-300">
                <table className="w-full border-collapse text-center text-sm sm:text-base rounded-xl overflow-hidden">
                    <thead className="bg-gray-100 text-gray-700 font-semibold">
                        <tr>
                            <th className="border px-2 py-2">S.No</th>
                            <th className="border px-2 py-2">Bay No.</th>
                            <th className="border px-2 py-2">TEC</th>
                            <th className="border px-2 py-2">Grade</th>
                            <th className="border px-2 py-2">Dimensions (Thick × Width × Length × Density)</th>
                            <th className="border px-2 py-2">Unit Weight</th>
                            <th className="border px-2 py-2">Quantity</th>
                            <th className="border px-2 py-2">Total Weight</th>
                            <th className="border px-2 py-2">Stock Due</th>
                            <th className="border px-2 py-2">Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {formData.materials?.length > 0 ? (
                            formData.materials.map((mat, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="border px-2 py-2 font-medium">{index + 1}</td>
                                    <td className="border px-2 py-2 text-gray-800">
                                        {mat.bay || "—"}
                                    </td>
                                    <td className="border px-2 py-2 text-gray-800">
                                        {mat.mat_type || "—"}
                                    </td>

                                    <td className="border px-2 py-2 text-gray-800">
                                        {mat.mat_grade || "—"}
                                    </td>

                                    <td className="border px-2 py-2 text-gray-800">
                                        {mat.thick || 0} × {mat.width || 0} ×{" "}
                                        {mat.length || 0} × {mat.density || 0}
                                    </td>

                                    <td className="border px-2 py-2 text-gray-700">
                                        {mat.unit_weight || "—"}
                                    </td>

                                    <td className="border px-2 py-2 text-gray-700">
                                        {mat.quantity || 0}
                                    </td>

                                    <td className="border px-2 py-2 text-gray-700">
                                        {mat.total_weight || "—"}
                                    </td>

                                    <td className="border px-2 py-2 text-gray-700">
                                        {mat.stock_due || "—"}
                                    </td>

                                    <td className="border px-2 py-2 text-gray-700">
                                        {mat.remarks || "—"}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="py-4 text-gray-500 italic">
                                    No material details added yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InwardSummary;
