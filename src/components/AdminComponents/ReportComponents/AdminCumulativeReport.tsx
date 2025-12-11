import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type FilterType = "material" | "operator" | "user" | "machine" | "company";

interface FilterConfig {
    label: string;
    api: string;
    map: (item) => string;
}

/**
 * Map filter type -> dropdown source API + label
 * Adjust endpoints/field names here if your backend differs.
 */
const FILTER_CONFIG: Record<FilterType, FilterConfig> = {
    material: {
        label: "Material Type",
        api: "/api/get_material_type/",
        map: (item) => item.material_name,
    },
    operator: {
        label: "Operator",
        api: "/api/get_operator/",
        map: (item) => item.operator_name,
    },
    user: {
        label: "User",
        api: "/api/get_all_users/",
        map: (item) => item.username,
    },
    machine: {
        label: "Machine",
        api: "/api/get_machines/",
        map: (item) => item.machine,
    },
    company: {
        label: "Company",
        api: "/api/get_companies/",
        map: (item) => item.company_name,
    },
};

const ReportDashboard: React.FC = () => {
    const [filterType, setFilterType] = useState<FilterType>("material");
    const [dropdownValues, setDropdownValues] = useState<string[]>([]);
    const [selectedValue, setSelectedValue] = useState("");

    // New state for machine dropdown (when filterType is 'operator')
    const [machines, setMachines] = useState<string[]>([]);
    const [selectedMachine, setSelectedMachine] = useState("");

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState(null);

    const { toast } = useToast();
    const API_URL = import.meta.env.VITE_API_URL;

    /* ---------------------------------------------------------
       Load dropdown options when filterType changes
    --------------------------------------------------------- */
    useEffect(() => {
        const loadOptions = async () => {
            const cfg = FILTER_CONFIG[filterType];
            try {
                const res = await fetch(`${API_URL}${cfg.api}`);
                const data = await res.json();

                if (!Array.isArray(data)) {
                    setDropdownValues([]);
                    return;
                }

                const items = data.map((item) => cfg.map(item));
                setDropdownValues(items);
                setSelectedValue("");
            } catch (err) {
                console.error("Error fetching filter options:", err);
                toast({
                    title: "Error",
                    description: `Failed to load ${cfg.label} list.`,
                    variant: "destructive",
                });
                setDropdownValues([]);
            }
        };

        loadOptions();

        // If operator is selected, also fetch machines
        if (filterType === "operator") {
            const loadMachines = async () => {
                try {
                    const res = await fetch(`${API_URL}/api/get_machines/`);
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setMachines(data.map((m) => m.machine));
                    }
                } catch (err) {
                    console.error("Error fetching machines:", err);
                }
            };
            loadMachines();
        } else {
            setMachines([]);
            setSelectedMachine("");
        }
    }, [filterType, API_URL, toast]);

    /* ---------------------------------------------------------
       Call /api/report/
    --------------------------------------------------------- */
    const fetchReport = async () => {
        if (!startDate || !endDate || !selectedValue) {
            return toast({
                title: "Missing Fields",
                description: "Please select filter value and date range.",
                variant: "destructive",
            });
        }

        try {
            setLoading(true);

            const url =
                `${API_URL}/api/report/` +
                `?filter_type=${encodeURIComponent(filterType)}` +
                `&value=${encodeURIComponent(selectedValue)}` +
                `&start_date=${encodeURIComponent(startDate)}` +
                `&end_date=${encodeURIComponent(endDate)}` +
                (filterType === "operator" && selectedMachine ? `&machine=${encodeURIComponent(selectedMachine)}` : "");

            const response = await fetch(url);
            const data = await response.json();

            if (!response.ok) {
                toast({
                    title: "Error",
                    description: data.error || "Failed to load report.",
                    variant: "destructive",
                });
                setReport(null);
            } else {
                setReport(data);
            }
        } catch (err) {
            console.error("Report fetch error:", err);
            toast({
                title: "Error",
                description: "Backend error while fetching report.",
                variant: "destructive",
            });
            setReport(null);
        } finally {
            setLoading(false);
        }
    };

    /* ---------------------------------------------------------
       Render dropdown
    --------------------------------------------------------- */
    const renderFilterDropdown = () => {
        const cfg = FILTER_CONFIG[filterType];
        return (
            <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-600">{cfg.label}</span>
                <select
                    value={selectedValue}
                    onChange={(e) => setSelectedValue(e.target.value)}
                    className="border p-2 rounded-md"
                >
                    <option value="">Select {cfg.label}</option>
                    {dropdownValues.map((val) => (
                        <option key={val} value={val}>
                            {val}
                        </option>
                    ))}
                </select>
            </div>
        );
    };

    /* ---------------------------------------------------------
       Render metrics nicely
    --------------------------------------------------------- */
    const renderMetrics = () => {
        if (!report?.metrics) return null;

        const metrics = report.metrics;

        // Helper for table header
        const TableHeader = ({ cols }) => (
            <thead className="bg-gray-100">
                <tr>
                    {cols.map((c) => (
                        <th key={c} className="py-2 px-4 text-left font-semibold text-gray-700">
                            {c}
                        </th>
                    ))}
                </tr>
            </thead>
        );

        // Helper for table row
        const TableRow = ({ values }) => (
            <tr className="border-b hover:bg-gray-50">
                {values.map((v, idx) => (
                    <td key={idx} className="py-2 px-4 text-gray-900">
                        {v}
                    </td>
                ))}
            </tr>
        );

        // 1. MATERIAL REPORT
        if (filterType === "material") {
            return (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border rounded-md">
                        <TableHeader
                            cols={[
                                "Start Date",
                                "End Date",
                                "Material Type",
                                "Total Quantity",
                                "Total Weight",
                                "Total Piercing",
                                "Total Used Weight",
                                "Total Sheets",
                            ]}
                        />
                        <tbody>
                            <TableRow
                                values={[
                                    startDate,
                                    endDate,
                                    metrics.material_type,
                                    metrics.total_quantity,
                                    metrics.total_weight?.toFixed(2),
                                    metrics.total_piercing,
                                    metrics.total_used_weight?.toFixed(2),
                                    metrics.total_no_of_sheets,
                                ]}
                            />
                        </tbody>
                    </table>
                </div>
            );
        }

        // 2. OPERATOR REPORT
        if (filterType === "operator") {
            return (
                <div className="space-y-4">
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border rounded-md">
                            <TableHeader cols={["Start Date", "End Date", "Operator", "Machine", "Total Runtime"]} />
                            <tbody>
                                <TableRow
                                    values={[
                                        startDate,
                                        endDate,
                                        metrics.operator,
                                        metrics.machine_used,
                                        metrics.total_runtime?.toFixed(2),
                                    ]}
                                />
                            </tbody>
                        </table>
                    </div>

                    {/* {metrics.machines_breakdown && metrics.machines_breakdown.length > 0 && (
                        <div className="overflow-x-auto">
                            <h5 className="font-semibold mb-2">Machine Breakdown</h5>
                            <table className="min-w-full bg-white border rounded-md">
                                <TableHeader cols={["Machine", "Runtime", "Air"]} />
                                <tbody>
                                    {metrics.machines_breakdown.map((m, idx) => (
                                        <TableRow
                                            key={idx}
                                            values={[m.machine, m.runtime?.toFixed(2), m.air?.toFixed(2)]}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )} */}
                </div>
            );
        }

        // 3. USER REPORT
        if (filterType === "user") {
            return (
                <div className="space-y-4">
                    <div className="overflow-x-auto">
                        <h5 className="font-semibold mb-2">Programmer Metrics</h5>
                        <table className="min-w-full bg-white border rounded-md">
                            <TableHeader
                                cols={[
                                    "Start Date",
                                    "End Date",
                                    "Processed Quantity",
                                    "Used Weight",
                                    "No of Sheets",
                                    "Total Piercing",
                                ]}
                            />
                            <tbody>
                                <TableRow
                                    values={[
                                        startDate,
                                        endDate,
                                        metrics.programmer_metrics?.total_processed_quantity,
                                        metrics.programmer_metrics?.total_used_weight?.toFixed(2),
                                        metrics.programmer_metrics?.total_no_of_sheets,
                                        metrics.programmer_metrics?.total_piercing,
                                    ]}
                                />
                            </tbody>
                        </table>
                    </div>

                    <div className="overflow-x-auto">
                        <h5 className="font-semibold mb-2">QA Metrics</h5>
                        <table className="min-w-full bg-white border rounded-md">
                            <TableHeader cols={["Total Cycle Time", "Total Sheets QC"]} />
                            <tbody>
                                <TableRow
                                    values={[
                                        metrics.qa_metrics?.total_cycle_time?.toFixed(2),
                                        metrics.qa_metrics?.total_sheets_qc,
                                    ]}
                                />
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        // 4. MACHINE REPORT
        if (filterType === "machine") {
            return (
                <div className="space-y-4">
                    <div className="overflow-x-auto">
                        <h5 className="font-semibold mb-2">Summary</h5>
                        <table className="min-w-full bg-white border rounded-md">
                            <TableHeader cols={["Start Date", "End Date", "Machine", "Total Runtime", "Total Air", "Total Sheets QC"]} />
                            <tbody>
                                <TableRow
                                    values={[
                                        startDate,
                                        endDate,
                                        metrics.machine,
                                        metrics.total_machine_runtime?.toFixed(2),
                                        metrics.total_air?.toFixed(2),
                                        metrics.total_sheets_qc,
                                    ]}
                                />
                            </tbody>
                        </table>
                    </div>

                    {metrics.machines_breakdown && metrics.machines_breakdown.length > 0 && (
                        <div className="overflow-x-auto">
                            <h5 className="font-semibold mb-2">Breakdown</h5>
                            <table className="min-w-full bg-white border rounded-md">
                                <TableHeader cols={["Machine", "Runtime", "Air"]} />
                                <tbody>
                                    {metrics.machines_breakdown.map((m, idx) => (
                                        <TableRow
                                            key={idx}
                                            values={[m.machine, m.runtime?.toFixed(2), m.air?.toFixed(2)]}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            );
        }

        // 5. COMPANY REPORT
        if (filterType === "company") {
            return (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border rounded-md">
                        <TableHeader
                            cols={[
                                "Start Date",
                                "End Date",
                                "Company",
                                "Total Products",
                                "Total Quantity",
                                "Total Weight",
                                "Total Piercing",
                                "Total Used Weight",
                                "Total Sheets",
                            ]}
                        />
                        <tbody>
                            <TableRow
                                values={[
                                    startDate,
                                    endDate,
                                    metrics.company,
                                    metrics.total_products,
                                    metrics.total_quantity,
                                    metrics.total_weight?.toFixed(2),
                                    metrics.total_piercing,
                                    metrics.total_used_weight?.toFixed(2),
                                    metrics.total_no_of_sheets,
                                ]}
                            />
                        </tbody>
                    </table>
                </div>
            );
        }

        // Fallback
        return (
            <pre className="bg-gray-50 p-4 rounded-md text-xs sm:text-sm overflow-x-auto">
                {JSON.stringify(metrics, null, 2)}
            </pre>
        );
    };

    return (
        <div className="space-y-3 text-gray-800">

            {/* FILTERS */}
            <Card className="p-4 shadow-sm border">
                <div className={`grid grid-cols-1 md:grid-cols-5 gap-4 items-end ${filterType === "operator" ? "md:grid-cols-6" : ""}`}>
                    {/* Filter Type */}
                    <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-600">Filter By</span>
                        <select
                            value={filterType}
                            onChange={(e) => {
                                setFilterType(e.target.value as FilterType);
                                setSelectedMachine(""); // Reset machine on filter change
                            }}
                            className="border p-2 rounded-md"
                        >
                            <option value="material">Material Type</option>
                            <option value="operator">Operators</option>
                            <option value="user">Users</option>
                            <option value="machine">Machines</option>
                            <option value="company">Companies</option>
                        </select>
                    </div>

                    {/* Dynamic dropdown */}
                    {renderFilterDropdown()}

                    {/* Extra Machine Dropdown for Operator Filter */}
                    {filterType === "operator" && (
                        <div className="flex flex-col gap-1">
                            <span className="text-sm text-gray-600">Machine</span>
                            <select
                                value={selectedMachine}
                                onChange={(e) => setSelectedMachine(e.target.value)}
                                className="border p-2 rounded-md"
                            >
                                <option value="">Select Machine</option>
                                {machines.map((m) => (
                                    <option key={m} value={m}>
                                        {m}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Start Date */}
                    <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-600">Start Date</span>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>

                    {/* End Date */}
                    <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-600">End Date</span>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>

                    {/* Button */}
                    <Button
                        className="bg-blue-600 text-white"
                        onClick={fetchReport}
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="animate-spin h-4 w-4" />
                                Loading...
                            </span>
                        ) : (
                            "Get Report"
                        )}
                    </Button>
                </div>
            </Card>

            {/* REPORT OUTPUT */}
            {report && (
                <Card className="p-6 shadow-md border">
                    <h3 className="text-xl font-semibold mb-3">Summary</h3>
                    {renderMetrics()}
                </Card>
            )}
        </div>
    );
};

export default ReportDashboard;
