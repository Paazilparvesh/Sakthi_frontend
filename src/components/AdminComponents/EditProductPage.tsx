import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "react-router-dom";

const EditProductPage: React.FC = () => {
  const { id } = useParams(); // product id
  
  const [activeTab, setActiveTab] = useState("inward");

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Edit Product #{id}</h2>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        
        {/* TAB BUTTONS */}
        <TabsList className="mb-6 flex gap-4 bg-gray-200 p-2 rounded-lg">
          <TabsTrigger value="inward" className="px-6 py-2">Inward</TabsTrigger>
          <TabsTrigger value="programmer" className="px-6 py-2">Programmer</TabsTrigger>
          <TabsTrigger value="qa" className="px-6 py-2">QA</TabsTrigger>
          <TabsTrigger value="accounts" className="px-6 py-2">Accounts</TabsTrigger>
        </TabsList>

        {/* TAB CONTENTS */}
        <TabsContent value="inward">
          <div className="p-4 border rounded-lg">
            🔧 Inward Edit Form Here
          </div>
        </TabsContent>

        <TabsContent value="programmer">
          <div className="p-4 border rounded-lg">
            🛠 Programmer Edit Form Here
          </div>
        </TabsContent>

        <TabsContent value="qa">
          <div className="p-4 border rounded-lg">
            🧪 QA Edit Form Here
          </div>
        </TabsContent>

        <TabsContent value="accounts">
          <div className="p-4 border rounded-lg">
            💰 Account Edit Form Here
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EditProductPage;
