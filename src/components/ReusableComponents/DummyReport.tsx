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
        map: (item) => item.material_name, // from material_typeSerializer
    },
    operator: {
        label: "Operator",
        api: "/api/get_operator/",
        map: (item) => item.operator_name,
    },
    user: {
        label: "User",
        api: "/api/get_all_users/", // <-- adjust if you use /api/get_all_users/
        map: (item) => item.username,
    },
    machine: {
        label: "Machine",
        api: "/api/get_machines/",
        map: (item) => item.machine_name,
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
                `&end_date=${encodeURIComponent(endDate)}`;

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

        // For now just pretty-print; you can later branch by filterType
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
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    {/* Filter Type */}
                    <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-600">Filter By</span>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as FilterType)}
                            className="border p-2 rounded-md"
                        >
                            <option value="material">Material Type</option>
                            <option value="operator">Operators (QA)</option>
                            <option value="user">Users</option>
                            <option value="machine">Machines</option>
                            <option value="company">Companies</option>
                        </select>
                    </div>

                    {/* Dynamic dropdown */}
                    {renderFilterDropdown()}

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

                    <div className="space-y-1 text-sm">
                        <p>
                            <b>Filter Type:</b> {report.filter_type}
                        </p>
                        <p>
                            <b>Value:</b> {report.filter_value}
                        </p>
                        <p>
                            <b>Date Range:</b> {report.date_range}
                        </p>
                    </div>

                    <h4 className="mt-4 mb-2 font-semibold">Metrics</h4>
                    {renderMetrics()}
                </Card>
            )}
        </div>
    );
};

export default ReportDashboard;
