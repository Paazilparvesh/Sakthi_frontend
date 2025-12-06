import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";

interface MaterialType {
    id: number;
    material_name: string;
    density_value: number;
}

const AdminMaterials: React.FC = () => {
    const [materials, setMaterials] = useState<MaterialType[]>([]);
    const [loading, setLoading] = useState(false);

    // Add Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [materialName, setMaterialName] = useState("");
    const [density, setDensity] = useState("");
    const [adding, setAdding] = useState(false);

    // Edit Modal State
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editItem, setEditItem] = useState<MaterialType | null>(null);

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteItem, setDeleteItem] = useState<MaterialType | null>(null);

    const { toast } = useToast();
    const API_URL = import.meta.env.VITE_API_URL;

    // Regex patterns
    const materialNameRegex = /^[A-Za-z0-9 _-]+$/;
    const densityRegex = /^(\d+(\.\d*)?|\.\d+)?$/;

    // Fetch material types
    const fetchMaterials = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/get_material_type/`);
            setMaterials(response.data);
        } catch {
            toast({
                title: "Failed to load materials",
                description: "Please check your backend.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [API_URL, toast]);

    // Add new material
    const handleAddMaterial = async () => {
        if (!materialName.trim()) {
            toast({ title: "Material name required", variant: "destructive" });
            return;
        }

        if (!materialNameRegex.test(materialName.trim())) {
            return toast({
                title: "Invalid material name",
                description: "Only letters, numbers, spaces, hyphens, and underscores allowed.",
                variant: "destructive",
            });
        }

        if (!density.trim() || !densityRegex.test(density)) {
            return toast({
                title: "Invalid Density",
                description: "Enter valid float or scientific notation (e.g., 8e-06).",
                variant: "destructive",
            });
        }

        try {
            setAdding(true);
            await axios.post(`${API_URL}/api/add_material_type/`, {
                material_name: materialName.trim(),
                density_value: parseFloat(density),
            });

            toast({ title: "Material Added" });
            setMaterialName("");
            setDensity("");
            setIsModalOpen(false);
            fetchMaterials();
        } finally {
            setAdding(false);
        }
    };

    // Open Edit Modal
    const openEditModal = (item: MaterialType) => {
        setEditItem(item);
        setMaterialName(item.material_name);
        setDensity(item.density_value.toString());
        setEditModalOpen(true);
    };

    // Save updated material
    const handleUpdateMaterial = async () => {
        if (!editItem) return;

        if (!materialNameRegex.test(materialName.trim())) {
            return toast({
                title: "Invalid material name",
                description: "Only letters, numbers, spaces, hyphens, and underscores allowed.",
                variant: "destructive",
            });
        }
        if (!densityRegex.test(density)) {
            return toast({
                title: "Invalid Density",
                description: "Enter valid float or scientific notation (e.g., 8e-06).",
                variant: "destructive",
            });
        }

        try {
            setAdding(true);
            await axios.put(`${API_URL}/api/update_material_type/${editItem.id}/`, {
                material_name: materialName.trim(),
                density_value: parseFloat(density),
            });

            toast({ title: "Material Updated" });
            setEditModalOpen(false);
            fetchMaterials();
        } finally {
            setAdding(false);
        }
    };

    // Open Delete Modal
    const openDeleteModal = (item: MaterialType) => {
        setDeleteItem(item);
        setDeleteModalOpen(true);
    };

    // Delete material
    const handleDeleteMaterial = async () => {
        if (!deleteItem) return;

        try {
            await axios.delete(`${API_URL}/api/delete_material_type/${deleteItem.id}/`);
            toast({ title: "Material Deleted" });
            setDeleteModalOpen(false);
            fetchMaterials();
        } catch {
            toast({
                title: "Error deleting material",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        fetchMaterials();
    }, [fetchMaterials]);

    // Live validation for Material Name
    const handleMaterialNameChange = (value: string) => {
        // Allow typing empty (so user can delete)
        if (value === "") {
            setMaterialName("");
            return;
        }

        // If valid, update state
        if (materialNameRegex.test(value)) {
            setMaterialName(value);
        }
    };

    // Live validation for Density
    const handleDensityChange = (value: string) => {
        // Allow empty
        if (value === "") {
            setDensity("");
            return;
        }

        // Allowed characters (basic filter)
        if (!/^[0-9eE+.\\-]*$/.test(value)) return;

        // Rule 1: Max ONE "."
        if (value.split(".").length > 2) return;

        // Rule 2: Max ONE "e" or "E"
        const eCount = (value.match(/[eE]/g) || []).length;
        if (eCount > 1) return;

        // Rule 3: "+" or "-" rules
        for (let i = 0; i < value.length; i++) {
            const char = value[i];

            if (char === "+" || char === "-") {
                // "+" or "-" allowed ONLY at start or right after "e/E"
                const previous = value[i - 1];
                if (i !== 0 && previous !== "e" && previous !== "E") return;
            }
        }

        // Rule 4: "e/E" cannot be first
        if (value[0] === "e" || value[0] === "E") return;

        setDensity(value);
    };


    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-medium">Material Type</h1>
                <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Add Material
                </Button>
            </div>

            {/* Native HTML Table */}
            <div className="border rounded-lg shadow bg-white overflow-x-auto p-4">
                <table className="w-full border-collapse">
                    <thead>
                        <tr>
                            <th className="border px-4 py-2 text-left">ID</th>
                            <th className="border px-4 py-2 text-left">Material</th>
                            <th className="border px-4 py-2 text-left">Density</th>
                            <th className="border px-4 py-2 text-center w-[15%]">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="text-center py-6">
                                    <Loader2 className="animate-spin mx-auto" />
                                </td>
                            </tr>
                        ) : materials.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center py-6 text-gray-500">
                                    No material types found.
                                </td>
                            </tr>
                        ) : (
                            materials.map((mat) => (
                                <tr key={mat.id}>
                                    <td className="border px-4 py-2">{mat.id}</td>
                                    <td className="border px-4 py-2">{mat.material_name}</td>
                                    <td className="border px-4 py-2">{mat.density_value}</td>

                                    <td className="border px-4 py-2 text-center">
                                        <div className="flex justify-center gap-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => openEditModal(mat)}
                                                className="hover:bg-transparent hover:text-black hover:scale-105"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>

                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => openDeleteModal(mat)}
                                                className="hover:scale-105"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ADD MODAL */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md p-6 space-y-6 rounded-xl">
                    <DialogHeader className="border-b pb-3">
                        <DialogTitle className="text-xl font-semibold">
                            Add New Material
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-5">
                        {/* Material Name */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Material Name</label>
                            <Input
                                placeholder="Enter material name"
                                value={materialName}
                                onChange={(e) => handleMaterialNameChange(e.target.value)}
                                className={`border rounded-md ${materialName !== "" && !materialNameRegex.test(materialName) ? "border-red-500" : ""}`}
                            />

                        </div>

                        {/* Density */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Density (Float Value)</label>
                            <Input
                                type="text"
                                placeholder="Enter density value"
                                value={density}
                                onChange={(e) => handleDensityChange(e.target.value)}
                                className={`border rounded-md ${density !== "" && !densityRegex.test(density) ? "border-red-500" : ""}`}
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-3 border-t">
                        <Button
                            onClick={handleAddMaterial}
                            disabled={adding}
                            className="w-full flex items-center justify-center gap-2 py-2 text-md"
                        >
                            {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Material"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            {/* EDIT MODAL */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Material Type</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <Input
                            placeholder="Material name"
                            value={materialName}
                            onChange={(e) => handleMaterialNameChange(e.target.value)}
                        />
                        <Input
                            type="text"
                            placeholder="Density"
                            value={density}
                            onChange={(e) => handleDensityChange(e.target.value)}
                        />
                    </div>

                    <DialogFooter>
                        <Button onClick={handleUpdateMaterial} disabled={adding}>
                            {adding ? <Loader2 className="animate-spin" /> : "Update"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* DELETE MODAL */}
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Material?</DialogTitle>
                    </DialogHeader>

                    <p>Are you sure you want to delete <b>{deleteItem?.material_name}</b>?</p>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteMaterial}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminMaterials;
