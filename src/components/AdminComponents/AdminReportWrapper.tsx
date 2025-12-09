import { Card } from '@/components/ui/card';
import { useState } from 'react';

import AdminReports from "@/components/AdminComponents/AdminReports.tsx"
import AdminReports2 from "@/components/ReusableComponents/DummyReport.tsx"

const AdminEditPage = () => {
    const [activeTab, setActiveTab] = useState('Report');

    const renderTab = () => {
        switch (activeTab) {
            case 'Report':
                return <AdminReports />;

            case 'Cumulative': {
                return (
                    <AdminReports2 />
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
                        className={`px-4 py-1 rounded-md ${activeTab === 'Report'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        onClick={() => {
                            setActiveTab('Report');
                        }}
                    >
                        Sheets
                    </button>
                    {/* Programmer */}
                    <button
                        className={`px-4 py-1 rounded-md ${activeTab === 'Cumulative'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        onClick={() => {
                            setActiveTab('Cumulative');
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
