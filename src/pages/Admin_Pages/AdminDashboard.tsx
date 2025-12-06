import React, { useState } from "react";
import { Users, Package, Building2, Wrench, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminUsers from "@/components/AdminComponents/AdminUsers.tsx";
import AdminProducts from "@/components/AdminComponents/AdminProduct.tsx";
import AdminCompanies from "@/components/AdminComponents/AdminCompanies.tsx";
import AdminOperators from "@/components/AdminComponents/AdminOperators.tsx";
import AdminMaterials from "@/components/AdminComponents/AdminMaterials.tsx";
import AdminMachines from "@/components/AdminComponents/AdminMachines.tsx";

const AdminDashboardWrapper: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("products");

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "products":
        return <AdminProducts />;
      case "users":
        return <AdminUsers />;
      case "machines":
        return <AdminMachines />;
      case "companies":
        return <AdminCompanies />;
      case "operators":
        return <AdminOperators />;
      case "materials":
        return <AdminMaterials />;
      default:
        return <AdminUsers />;
    }
  };

  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h1>

        {/* Navigation Tabs */}
        <div className="flex gap-3">

          <Button
            variant={activeTab === "products" ? "default" : "outline"}
            onClick={() => setActiveTab("products")}
            className="flex items-center gap-2 hover:bg-blue-600"
          >
            <Package className="w-4 h-4" /> Products
          </Button>

          <Button
            variant={activeTab === "users" ? "default" : "outline"}
            onClick={() => setActiveTab("users")}
            className="flex items-center gap-2 hover:bg-blue-600"
          >
            <Users className="w-4 h-4" /> Users
          </Button>

          <Button
            variant={activeTab === "machines" ? "default" : "outline"}
            onClick={() => setActiveTab("machines")}
            className="flex items-center gap-2 hover:bg-blue-600"
          >
            <Users className="w-4 h-4" /> Machines
          </Button>

          <Button
            variant={activeTab === "companies" ? "default" : "outline"}
            onClick={() => setActiveTab("companies")}
            className="flex items-center gap-2 hover:bg-blue-600"
          >
            <Building2 className="w-4 h-4" /> Companies
          </Button>

          <Button
            variant={activeTab === "operators" ? "default" : "outline"}
            onClick={() => setActiveTab("operators")}
            className="flex items-center gap-2 hover:bg-blue-600"
          >
            <Wrench className="w-4 h-4" /> Mission Operators
          </Button>

          <Button
            variant={activeTab === "materials" ? "default" : "outline"}
            onClick={() => setActiveTab("materials")}
            className="flex items-center gap-2 hover:bg-blue-600"
          >
            <PackageCheck className="w-4 h-4" /> Material Type
          </Button>
        </div>

      </div>



      {/* Dynamic Content */}
      <div className="bg-white rounded-lg shadow p-6 border">
        {renderActiveComponent()}
      </div>
    </div>
  );
};

export default AdminDashboardWrapper;
