import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, UserPlus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Operator {
  id: number;
  operator_name: string;
}

const AdminOperators: React.FC = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { toast } = useToast();

  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(false);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(
    null
  );

  const [formData, setFormData] = useState({
    operator_name: "",
  });

  const nameRegex = /^[A-Za-z0-9 _-]+$/;

  const fetchOperators = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/get_operator/`);
      const data = await response.json();
      if (response.status === 404 || data.msg === "No operators found") {
        setOperators([]);
      } else {
        setOperators(data);
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to load operators.",
      });
    } finally {
      setLoading(false);
    }
  }, [API_URL, toast]);

  useEffect(() => {
    fetchOperators();
  }, [fetchOperators]);

  const handleNameChange = (val: string) => {
    if (val === "" || nameRegex.test(val)) {
      setFormData({ operator_name: val });
    }
  };

  // ADD Operator
  const handleAddOperator = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/add_operator/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || data.status === false) {
        throw new Error(data.message || data.error);
      }

      toast({ title: "Success", description: "Operator added successfully." });
      setOpenAdd(false);
      setFormData({ operator_name: "" });
      fetchOperators();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Unexpected error occurred.",
      });
    }
  };

  // UPDATE Operator
  const handleUpdateOperator = async () => {
    if (!selectedOperator) return;

    try {
      const response = await fetch(
        `${API_URL}/api/update_operator/${selectedOperator.id}/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      if (!response.ok || data.status === false)
        throw new Error(data.message || data.error);

      toast({ title: "Updated", description: "Operator updated successfully." });

      setOpenEdit(false);
      fetchOperators();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error updating operator",
      });
    }
  };

  // DELETE Operator
  const handleDeleteOperator = async () => {
    if (!selectedOperator) return;

    try {
      const response = await fetch(
        `${API_URL}/api/delete_operator/${selectedOperator.id}/`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok || data.status === false) {
        throw new Error(data.message);
      }

      toast({
        title: "Deleted",
        description: "Operator deleted successfully.",
      });

      setOpenDelete(false);
      fetchOperators();
    } catch {
      toast({
        variant: "destructive",
        title: "Error deleting operator",
      });
    }
  };

  return (
    <div className="text-gray-700 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Manage Operators</h2>

        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <UserPlus className="w-4 h-4" /> New Operator
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md p-6 rounded-xl">
            <DialogHeader>
              <DialogTitle>Add Operator</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleAddOperator} className="space-y-4 mt-3">
              <div>
                <Label>Operator Name *</Label>
                <Input
                  value={formData.operator_name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className={`mt-1 ${formData.operator_name &&
                    !nameRegex.test(formData.operator_name)
                    ? "border-red-500"
                    : ""
                    }`}
                  required
                />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenAdd(false)} className=" hover:bg-transparent hover:text-black">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={
                    !formData.operator_name ||
                    !nameRegex.test(formData.operator_name)
                  }
                >
                  Save
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin mr-2" /> Loading...
        </div>
      ) : operators.length === 0 ? (
        <p className="text-center">No operators found.</p>
      ) : (
        <Card className="border shadow-sm overflow-x-auto rounded-lg">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100 text-center">
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">Operator Name</th>
                <th className="border px-4 py-2 w-[15%]">Actions</th>
              </tr>
            </thead>

            <tbody>
              {operators.map((op) => (
                <tr key={op.id} className="text-center hover:bg-slate-50">
                  <td className="border px-4 py-2">{op.id}</td>
                  <td className="border px-4 py-2">{op.operator_name}</td>

                  <td className="border px-4 py-2">
                    <div className="flex justify-center gap-3">

                      {/* EDIT BUTTON */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOperator(op);
                          setFormData({ operator_name: op.operator_name });
                          setOpenEdit(true);
                        }}
                        className="hover:bg-transparent hover:scale-110 hover:text-black"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>

                      {/* DELETE BUTTON */}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedOperator(op);
                          setOpenDelete(true);
                        }}
                        className=" hover:scale-110"

                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* EDIT MODAL */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="p-6 rounded-xl">
          <DialogHeader>
            <DialogTitle>Edit Operator</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-3">
            <Label>Operator Name *</Label>
            <Input
              value={formData.operator_name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={`mt-1 ${formData.operator_name &&
                !nameRegex.test(formData.operator_name)
                ? "border-red-500"
                : ""
                }`}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenEdit(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateOperator}
              className="bg-blue-600 text-white hover:bg-blue-700"
              disabled={!formData.operator_name}
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE MODAL */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="p-6 rounded-xl">
          <DialogHeader>
            <DialogTitle>Delete Operator?</DialogTitle>
          </DialogHeader>

          <p>
            Are you sure you want to delete{" "}
            <b>{selectedOperator?.operator_name}</b>?
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDelete(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteOperator}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default AdminOperators;
