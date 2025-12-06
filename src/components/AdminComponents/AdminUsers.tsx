import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, UserPlus, Pencil, Trash2, ChevronsUpDown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

type RoleType = "inward" | "programer" | "qa" | "admin" | "accounts";

interface UserItem {
  id: number;
  username: string;
  email: string;
  roles: string[];
  isAdmin: boolean;
}


interface UserForm {
  username: string;
  email: string;
  password?: string;
  role?: string[];
  isAdmin?: boolean;   // <-- ADD THIS
}

const PAGE_SIZE = 10;

const AdminUsersAdvanced: React.FC = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { toast } = useToast();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | RoleType | "all">("");
  const [sortBy, setSortBy] = useState<"username" | "email" | "role_type">("username");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const [allRoles, setAllRoles] = useState<{ id: number; name: string }[]>([]);

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [selected, setSelected] = useState<UserItem | null>(null);
  const [processing, setProcessing] = useState(false);


  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const resp = await fetch(`${API_URL}/api/get_role_list/`);
        const json = await resp.json();

        if (!resp.ok) throw new Error(json?.msg || "Failed to fetch roles");

        setAllRoles(json.roles);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Failed to load roles",
          description: String(err),
        });
      }
    };

    fetchRoles();
  }, [API_URL, toast]);


  /* ----------- ADD FORM ----------- */
  const {
    register: registerAdd,
    handleSubmit: handleAddSubmit,
    reset: resetAdd,
    formState: { errors: addErrors },
  } = useForm<UserForm>({
    defaultValues: { username: "", email: "", password: "", role: [], isAdmin: false },

  });

  /* ----------- EDIT FORM ----------- */
  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm<UserForm>({
    defaultValues: { username: "", email: "", password: "", role: [], isAdmin: false },

  });

  /* ----------- FETCH USERS (matches backend) ----------- */
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_URL}/api/get_all_users/`);
      const json = await resp.json();

      if (!resp.ok) throw new Error(json?.msg || "Failed to load users");

      // Convert backend structure → your frontend array
      const mapped: UserItem[] = Object.entries(json)
        .filter(([key]) => key !== "total_users")
        .map(([id, value]) => {
          const u = value[0];
          return {
            id: Number(id),
            username: u.username,
            email: u.email,
            roles: u.roles || [],
            isAdmin: u.isAdmin ?? false, // KEEP ALL ROLES
          };
        });

      setUsers(mapped);

    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error loading users",
        description: String(err),
      });
    } finally {
      setLoading(false);
    }
  }, [API_URL, toast]);


  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, refreshKey]);

  /* ----------- FILTER + SORT + PAGINATION ----------- */
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = [...users];

    if (q) {
      out = out.filter(
        (u) =>
          u.username.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }

    out.sort((a, b) => {
      const aKey = String(a[sortBy] ?? "").toLowerCase();
      const bKey = String(b[sortBy] ?? "").toLowerCase();
      if (aKey < bKey) return sortDir === "asc" ? -1 : 1;
      if (aKey > bKey) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return out;
  }, [users, query, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (field: "username" | "email" | "role_type") => {
    if (sortBy === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  /* ----------- CREATE USER (matches backend /create_user/) ----------- */
  const onAdd = async (form: UserForm) => {
    setProcessing(true);

    const payload = {
      username: form.username,
      email: form.email,
      password: form.password,
      isAdmin: form.isAdmin || false,
      role: form.role || [],
    };

    try {
      const resp = await fetch(`${API_URL}/api/create_user/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await resp.json();
      if (!resp.ok) throw new Error(json.message || json.msg);

      setRefreshKey((k) => k + 1);
      resetAdd();
      setAddOpen(false);
      toast({ title: "User created successfully" });
    } catch (err) {
      toast({ variant: "destructive", title: "Create failed", description: String(err) });
    } finally {
      setProcessing(false);
    }
  };


  /* ----------- OPEN EDIT ----------- */
  const onOpenEdit = (u: UserItem) => {
    setSelected(u);
    resetEdit({
      username: u.username,
      email: u.email,
      password: "",
      role: u.roles,
      isAdmin: u.isAdmin,
    });
    setEditOpen(true);
  };

  /* ----------- UPDATE USER (matches /update_user/<id>/) ----------- */
  const onEdit = async (data: UserForm) => {
    if (!selected) return;

    setProcessing(true);
    try {
      const resp = await fetch(`${API_URL}/api/update_user/${selected.id}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await resp.json();
      if (!resp.ok) throw new Error(json.msg);

      setRefreshKey((k) => k + 1);
      setEditOpen(false);
      setSelected(null);

      toast({ title: "User updated" });
    } catch (err) {
      toast({ variant: "destructive", title: "Update failed", description: String(err) });
    } finally {
      setProcessing(false);
    }
  };

  /* ----------- DELETE USER (matches /delete_user/<id>/) ----------- */
  const onDelete = async () => {
    if (!selected) return;

    setProcessing(true);
    try {
      const resp = await fetch(`${API_URL}/api/delete_user/${selected.id}/`, {
        method: "DELETE",
      });

      const json = await resp.json();
      if (!resp.ok) throw new Error(json.msg);

      setUsers((prev) => prev.filter((x) => x.id !== selected.id));
      setDeleteOpen(false);
      setSelected(null);
      setRefreshKey((k) => k + 1);

      toast({ title: "User deleted" });
    } catch (err) {
      toast({ variant: "destructive", title: "Delete failed", description: String(err) });
    } finally {
      setProcessing(false);
    }
  };

  /* ----------- ROLE BADGE ----------- */
  const roleBadge = (r: RoleType) => {
    const map: Record<RoleType, string> = {
      inward: "bg-blue-100 text-blue-800",
      programer: "bg-green-100 text-green-800",
      qa: "bg-purple-100 text-purple-800",
      admin: "bg-red-100 text-red-800",
      accounts: "bg-orange-100 text-orange-800",
    };
    return map[r];
  };

  /* ----------- RENDER ----------- */
  return (
    <div className="space-y-6">

      {/* ---------------- SEARCH / FILTER / SORT ---------------- */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className="w-72"
          />

          <div className="flex items-center gap-1 text-sm text-gray-600">
            <span>Sort:</span>
            <button onClick={() => toggleSort("username")} className="px-2 py-1 flex gap-1">
              Username <ChevronsUpDown className="w-4 h-4" />
            </button>
            <button onClick={() => toggleSort("email")} className="px-2 py-1 flex gap-1">
              Email <ChevronsUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ---------------- ADD USER ---------------- */}
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> New User
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create User</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleAddSubmit(onAdd)} className="space-y-4">
              <div>
                <Label>Username</Label>
                <Input {...registerAdd("username", { required: "Required" })} disabled={processing} />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  {...registerAdd("email", {
                    required: "Required",
                    pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" },
                  })}
                  disabled={processing}
                />
              </div>

              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  {...registerAdd("password", { required: "Required" })}
                  disabled={processing}
                />
              </div>

              <div>
                <Label>Roles</Label>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  {allRoles.map((role) => (
                    <label key={role.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        value={role.name}
                        {...registerAdd("role")}
                        className="w-4 h-4"
                        disabled={processing}
                      />
                      {role.name}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  {...registerAdd("isAdmin")}
                  className="w-4 h-4"
                />
                <Label className="cursor-pointer">Admin</Label>
              </div>



              <DialogFooter>
                <Button variant="outline" onClick={() => setAddOpen(false)} disabled={processing} className="hover:bg-gray-200 hover:text-black">
                  Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                  {processing ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ---------------- USER TABLE ---------------- */}
      <Card className="overflow-x-auto">
        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-center border">
                <th className="px-4 py-3 border">S.no.</th>
                <th className="px-4 py-3 border">Username</th>
                <th className="px-4 py-3 border">Email</th>
                <th className="px-4 py-3 border">Role</th>
                <th className="px-4 py-3 border">Admin</th>
                <th className="px-4 py-3 border w-[15%]">Actions</th>
              </tr>
            </thead>

            <tbody>
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                pageData.map((u, idx) => (
                  <tr key={u.id} className="border-t hover:bg-gray-50 text-center">
                    <td className="px-4 py-3 border">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                    <td className="px-4 py-3 border">{u.username}</td>
                    <td className="px-4 py-3 border">{u.email}</td>
                    <td className="px-4 py-3 border">
                      <div className="flex flex-wrap justify-center gap-1">
                        {u.roles.map((r) => (
                          <span
                            key={r}
                            className={`px-2 py-1 rounded text-xs font-medium ${roleBadge(r as RoleType)}`}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 border text-xl">
                      {u.isAdmin ? "✓" : "✕"}
                    </td>
                    <td className="px-4 py-3 border">
                      <div className="flex justify-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => onOpenEdit(u)} className="hover:bg-transparent hover:text-black hover:scale-110">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => { setSelected(u); setDeleteOpen(true); }} className="hover:scale-110">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </Card>

      {/* ---------------- PAGINATION ---------------- */}
      {totalPages > 1 && (
        <div className="flex justify-end items-center gap-3 mt-6 text-sm">

          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-1 bg-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-300"
          >
            Prev
          </button>
          <span className="font-medium text-slate-700">
            Page {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-1 bg-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-300"
          >
            Next
          </button>
        </div>
      )}

      {/* ---------------- EDIT DIALOG ---------------- */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditSubmit(onEdit)} className="space-y-4">
            <div>
              <Label>Username</Label>
              <Input {...registerEdit("username", { required: "Required" })} />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                {...registerEdit("email", {
                  required: "Required",
                  pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" },
                })}
              />
            </div>

            <div>
              <Label>Password (optional)</Label>
              <Input {...registerEdit("password")} type="password" />
            </div>

            <div>
              <Label>Roles</Label>

              <div className="grid grid-cols-2 gap-2 mt-2">
                {allRoles.map((role) => (
                  <label key={role.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={role.name}
                      defaultChecked={selected?.roles.includes(role.name)}
                      {...registerEdit("role")}
                      className="w-4 h-4"
                    />
                    {role.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                {...registerEdit("isAdmin")}
                defaultChecked={selected?.isAdmin}
                className="w-4 h-4"
              />
              <Label className="cursor-pointer">Admin</Label>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)} className="hover:bg-gray-300 hover:text-black">
                Cancel
              </Button>
              <Button type="submit" disabled={processing}>
                {processing ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ---------------- DELETE DIALOG ---------------- */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">Confirm Delete</DialogTitle>
          </DialogHeader>

          <p>
            Are you sure you want to delete <strong>{selected?.username}</strong>?
          </p>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={processing}
              className="hover:bg-gray-300 hover:text-black"
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDelete} disabled={processing}>
              {processing ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsersAdvanced;
