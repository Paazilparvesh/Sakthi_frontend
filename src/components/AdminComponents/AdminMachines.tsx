import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, Pencil, Trash2, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Machine {
    id: number;
    machine: string;
}

const AdminMachines: React.FC = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    const { toast } = useToast();

    const [machines, setMachines] = useState<Machine[]>([]);
    const [loading, setLoading] = useState(false);

    const [openModal, setOpenModal] = useState(false);
    const [editModal, setEditModal] = useState(false);

    const [deleteModal, setDeleteModal] = useState(false);
    const [machineToDelete, setMachineToDelete] = useState<Machine | null>(null);


    const [newMachine, setNewMachine] = useState("");
    const [editMachine, setEditMachine] = useState("");
    const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);

    const [query, setQuery] = useState("");

    /* -------------------- FETCH -------------------- */
    const fetchMachines = useCallback(async () => {
        setLoading(true);
        try {
            const resp = await fetch(`${API_URL}/api/get_machines/`);
            const data = await resp.json();
            setMachines(Array.isArray(data) ? data : []);
        } catch {
            toast({
                variant: "destructive",
                title: "Error loading machines",
            });
        } finally {
            setLoading(false);
        }
    }, [API_URL, toast])

    useEffect(() => {
        fetchMachines();
    }, [fetchMachines]);

    /* -------------------- ADD MACHINE -------------------- */
    const handleAdd = async () => {
        if (!newMachine.trim()) {
            toast({
                variant: "destructive",
                title: "Machine name required",
            });
            return;
        }

        try {
            const resp = await fetch(`${API_URL}/api/add_machine/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ machine: newMachine }),
            });

            const data = await resp.json();
            if (!resp.ok) throw new Error(data.message);

            toast({ title: "Machine added" });

            setNewMachine("");
            setOpenModal(false);
            fetchMachines();
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Add failed",
                description: err.message,
            });
        }
    };

    /* -------------------- EDIT MACHINE -------------------- */
    const openEdit = (item: Machine) => {
        setSelectedMachine(item);
        setEditMachine(item.machine);
        setEditModal(true);
    };

    const handleEdit = async () => {
        if (!selectedMachine) return;

        try {
            const resp = await fetch(
                `${API_URL}/api/update_machine/${selectedMachine.id}/`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ machine: editMachine }),
                }
            );

            const data = await resp.json();
            if (!resp.ok) throw new Error(data.message);

            toast({ title: "Machine updated" });

            setEditModal(false);
            fetchMachines();
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Update failed",
                description: err.message,
            });
        }
    };

    /* -------------------- DELETE MACHINE -------------------- */
    const handleDelete = async (item: Machine) => {
        try {
            const resp = await fetch(
                `${API_URL}/api/delete_machine/${item.id}/`,
                { method: "DELETE" }
            );

            const data = await resp.json();
            if (!resp.ok) throw new Error(data.message);

            toast({ title: "Machine deleted" });

            fetchMachines();
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Delete failed",
                description: err.message,
            });
        }
    };

    /* -------------------- FILTER -------------------- */
    const filtered = machines.filter((m) =>
        m.machine.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Manage Machines</h2>

                <div className="flex items-center gap-3">
                    <Input
                        placeholder="Search..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-60"
                    />

                    <Dialog open={openModal} onOpenChange={setOpenModal}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 text-white flex items-center gap-2">
                                <Plus className="h-4 w-4" /> Add Machine
                            </Button>
                        </DialogTrigger>

                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add Machine</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4">
                                <Label>Machine Name</Label>
                                <Input
                                    value={newMachine}
                                    onChange={(e) => setNewMachine(e.target.value)}
                                    placeholder="Enter machine name"
                                />
                                <Button className="w-full" onClick={handleAdd}>
                                    Save
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* ---------------- TABLE ---------------- */}
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <Loader2 className="animate-spin h-5 w-5" />
                </div>
            ) : filtered.length === 0 ? (
                <p className="text-center text-gray-500 py-10">No machines found</p>
            ) : (
                <Card className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-100 text-center">
                                <th className="p-2 border w-[15%] ">S.No</th>
                                <th className="p-2 border">Machine</th>
                                <th className="p-2 border w-[15%]">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filtered.map((m, i) => (
                                <tr key={m.id} className="text-center border-b">
                                    <td className="p-2 border">{i + 1}</td>
                                    <td className="p-2 border">{m.machine}</td>
                                    <td className="p-2 border">
                                        <div className="flex justify-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => openEdit(m)}
                                                className="hover:bg-gray-200 hover:text-black hover:scale-110 "
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => {
                                                    setMachineToDelete(m);
                                                    setDeleteModal(true);
                                                }}

                                                className=" hover:scale-110 "

                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}

            {/* ---------------- EDIT DIALOG ---------------- */}
            <Dialog open={editModal} onOpenChange={setEditModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Machine</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <Label>Machine Name</Label>
                        <Input
                            value={editMachine}
                            onChange={(e) => setEditMachine(e.target.value)}
                        />

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditModal(false)}
                                className="hover:bg-gray-200 hover:text-black"
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleEdit}>Save</Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ---------------- DELETE CONFIRMATION MODAL ---------------- */}
            <Dialog open={deleteModal} onOpenChange={setDeleteModal}>
                <DialogContent className="max-w-sm rounded-lg">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 font-semibold">
                            Confirm Delete
                        </DialogTitle>
                    </DialogHeader>

                    <p className="text-gray-700 mt-2">
                        Are you sure you want to delete{" "}
                        <span className="font-semibold">{machineToDelete?.machine}</span>?
                        <br />
                        This action cannot be undone.
                    </p>

                    <DialogFooter className="mt-4 flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteModal(false)}
                            className="hover:bg-gray-200 hover:text-black"
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={async () => {
                                if (!machineToDelete) return;

                                try {
                                    const resp = await fetch(
                                        `${API_URL}/api/delete_machine/${machineToDelete.id}/`,
                                        { method: "DELETE" }
                                    );

                                    const data = await resp.json();
                                    if (!resp.ok) throw new Error(data.message);

                                    toast({ title: "Machine deleted" });
                                    fetchMachines();
                                } catch (err) {
                                    toast({
                                        variant: "destructive",
                                        title: "Delete failed",
                                        description: err.message,
                                    });
                                }

                                setDeleteModal(false);
                            }}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default AdminMachines;
