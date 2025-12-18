import { Card } from '@/components/ui/card';
import React, { useState } from 'react';
import { ProductType, EditProps } from '@/types/inward.type';

import InwardEditForm from '@/components/AdminComponents/EditComponents/InwardEditForm';
import ProgrammerEditForm from '@/components/AdminComponents/EditComponents/ProgrammerEditForm';
import QaEditForm from '@/components/AdminComponents/EditComponents/QaEditForm';

const tabs = ['Inward', 'Programmer', 'QA'] as const;
type TabType = (typeof tabs)[number];



const AdminEditPage: React.FC<EditProps> = ({ product, onCancel, onBack }) => {
  const [activeTab, setActiveTab] = useState<TabType>('Inward');
  const [form, setForm] = useState(product);
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(
    null
  );
  const canEditProgrammer =
    product.programer_status?.toLowerCase() === 'completed';
  const canEditQa = product.qa_status?.toLowerCase() === 'completed';

  const updateForm = (partial: Partial<ProductType>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'Inward':
        return <InwardEditForm product={form} updateForm={updateForm} />;

      case 'Programmer': {
        return (
          <ProgrammerEditForm
            productId={form.product_id}
            materials={form.materials}
            selectedMaterialId={selectedMaterialId}
            setSelectedMaterialId={setSelectedMaterialId}
          />
        );
      }

      case 'QA':
        return (
          <QaEditForm
            productId={form.product_id}
            materials={form.materials}
            selectedMaterialId={selectedMaterialId}
            setSelectedMaterialId={setSelectedMaterialId}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Card className='border-none'>
      <h2 className='text-2xl font-bold mb-6'>Edit Product</h2>

      {/* Tabs */}
      <div className='flex justify-between gap-3 border-b pb-3 mb-4'>
        <div className='flex items-center'>
          {/* Inward - always allowed */}
          <button
            className={`px-4 py-1 rounded-md ${activeTab === 'Inward'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            onClick={() => {
              setActiveTab('Inward');
              setSelectedMaterialId(null);
            }}
          >
            Inward
          </button>

          {/* Programmer */}
          <button
            disabled={!canEditProgrammer}
            className={`px-4 py-1 rounded-md ${!canEditProgrammer
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : activeTab === 'Programmer'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            onClick={() => {
              if (!canEditProgrammer) return;
              setActiveTab('Programmer');
              setSelectedMaterialId(null);
            }}
          >
            Programmer
          </button>

          {/* QA */}
          <button
            disabled={!canEditQa || !canEditProgrammer}
            className={`px-4 py-1 rounded-md ${!canEditQa || !canEditProgrammer
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : activeTab === 'QA'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            onClick={() => {
              if (!canEditQa || !canEditProgrammer) return;
              setActiveTab('QA');
              setSelectedMaterialId(null);
            }}
          >
            QA
          </button>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => {
              onBack();
              onCancel();
            }}
            className="px-4 py-2 bg-gray-300 rounded-md"
          >
            Back
          </button>
        </div>
      </div>

      {/* Tab UI */}
      {renderTab()}
    </Card>
  );
};

export default AdminEditPage;
