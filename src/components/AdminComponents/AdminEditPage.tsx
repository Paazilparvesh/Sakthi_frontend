import { Card } from "@/components/ui/card";
import React, { useState } from "react";
import { ProductType } from "@/types/inward.type";

import InwardEditForm from "@/components/AdminComponents/EditComponents/InwardEditForm";
import ProgrammerEditForm from "@/components/AdminComponents/EditComponents/ProgrammerEditForm";
import QaEditForm from "@/components/AdminComponents/EditComponents/QaEditForm";

const tabs = ["Inward", "Programmer", "QA"] as const;
type TabType = (typeof tabs)[number];

interface Props {
  product: ProductType;
  onCancel: () => void;
  onBack: () => void;
}

const AdminEditPage: React.FC<Props> = ({ product, onCancel, onBack }) => {
  const [activeTab, setActiveTab] = useState<TabType>("Inward");
  const [form, setForm] = useState(product);
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);

  const updateForm = (partial: Partial<ProductType>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  };

  const renderTab = () => {
    switch (activeTab) {
      case "Inward":
        return (
          <InwardEditForm
            form={form}
            updateForm={updateForm}
          />
        );

      case "Programmer":
        return (
          <ProgrammerEditForm
            productId={form.product_id}
            materials={form.materials}
            selectedMaterialId={selectedMaterialId}
            setSelectedMaterialId={setSelectedMaterialId}
          />
        );



      case "QA":
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
    <Card className="border-none">
      <h2 className="text-2xl font-bold mb-6">Edit Product</h2>

      {/* Tabs */}
      <div className="flex justify-between gap-3 border-b pb-3 mb-4">
        <div className="flex items-center">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`px-4 py-1 rounded-md ${activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              onClick={() => {
                setActiveTab(tab);
                setSelectedMaterialId(null);
              }}
            >
              {tab}
            </button>
          ))}
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
