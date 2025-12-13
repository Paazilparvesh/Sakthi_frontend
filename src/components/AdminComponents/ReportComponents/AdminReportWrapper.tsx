import { Card } from '@/components/ui/card';
import { useState } from 'react';

import SheetReport from "@/components/AdminComponents/ReportComponents/AdminSheetsReports.tsx"
import CumulativeReport from "@/components/AdminComponents/ReportComponents/AdminCumulativeReport.tsx"

const AdminEditPage = () => {
    const [activeTab, setActiveTab] = useState('sheet');

    const renderTab = () => {
        switch (activeTab) {
            case 'sheet':
                return <SheetReport />;

            case 'cumulative': {
                return (
                    <CumulativeReport />
                );
            }
            default:
                return null;
        }
    };

    return (
        <Card className='border-none'>
            {/* Tabs */}
            <div className='flex justify-between gap-3 border-b pb-3 mb-4'>
                <h2 className="text-2xl font-semibold">Production Report Dashboard</h2>
                <div className='flex items-center'>
                    <button
                        className={`px-4 py-1 rounded-md ${activeTab === 'sheet'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        onClick={() => {
                            setActiveTab('sheet');
                        }}
                    >
                        Sheets
                    </button>
                    {/* Programmer */}
                    <button
                        className={`px-4 py-1 rounded-md ${activeTab === 'cumulative'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        onClick={() => {
                            setActiveTab('cumulative');
                        }}
                    >
                        Cumulative
                    </button>
                </div>
            </div>

            {/* Tab UI */}
            {renderTab()}
        </Card>
    );
};

export default AdminEditPage;
