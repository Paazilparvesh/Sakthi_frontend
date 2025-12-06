import React from "react";
import { Eye } from "lucide-react";
import { ProgramerTableProps } from "@/types/qa.type";

const ProgramerList: React.FC<ProgramerTableProps> = ({ data, onView }) => {
    return (
        <div className="overflow-x-auto w-full">
            {/* Desktop Table */}
            <table className="w-full border-collapse text-sm sm:text-base">
                <thead>
                    <tr className="border-b bg-slate-100 text-center">
                        <th className="px-2 py-2 border w-[7%]">S. No.</th>
			<th className="px-2 py-2 border w-[7%]">Slip No.</th>
                        <th className="px-2 py-2 border w-[12%]">Date</th>
                        <th className="px-2 py-2 border w-[18%]">Company Name</th>
                        <th className="px-2 py-2 border w-[18%]">Customer Name</th>
                        <th className="px-2 py-2 border w-[8%]">Color</th>
                        <th className="px-2 py-2 border w-[10%]">Mobile</th>
                        <th className="px-2 py-2 border w-[10%]">Created By</th>
                        <th className="px-2 py-2 border w-[6%]">Status</th>
                        <th className="px-2 py-2 border w-[6%]">Action</th>
                    </tr>
                </thead>

                <tbody>
                    {data.map((item, index) => (
                        <tr
                            key={index}
                            className="hover:bg-slate-50 even:bg-gray-50 odd:bg-white transition-all border text-center text-sm"
                        >
                            <td className="px-4 py-3 border font-medium">{item.serial_number}</td>
			    <td className="px-4 py-3 border font-medium">{item.inward_slip_number}</td>
                            <td className="px-4 py-3 border">{item.date}</td>
                            <td className="px-4 py-3 border text-left">{item.company_name}</td>
                            <td className="px-4 py-3 border text-left">{item.customer_name}</td>
                            <td className={`px-4 py-3 border`}>
                                <span className={`px-4 py-1 border text-sm text-center rounded-full shadow-sm  ${item.color === "yellow" ? " bg-yellow-100" : "bg-white"} `}>
                                    {item.color}</span></td>
                            <td className="px-4 py-3 border">{item.contact_no}</td>
                            <td className="px-4 py-3 border">{item.created_by}</td>
                            <td className="px-4 py-3 border">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${item.programer_status?.toLowerCase() === "completed"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-yellow-100 text-yellow-700"
                                        }`}
                                >
                                    {item.programer_status}
                                </span>
                            </td>
                            <td className="px-4 py-3 border">
                                <button
                                    className="bg-blue-800 text-white px-3 py-1 rounded-lg hover:bg-blue-700 flex items-center gap-1 mx-auto"
                                    onClick={() => onView(item)}
                                >
                                    <Eye className="h-4 w-4" /> View
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProgramerList;
