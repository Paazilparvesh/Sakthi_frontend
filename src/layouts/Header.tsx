import React, { useState, useRef, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { LogOut, User, AlertTriangle, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Dashboard from "@/pages/Dashboard_Page/Dashboard";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Dropdown states
  const [userOpen, setUserOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Refs
  const userRef = useRef(null);
  const menuRef = useRef(null);
  const modalRef = useRef(null);

  /* ---------- ROLE NAVIGATION MAPPING ---------- */
  const rolePaths: Record<string, string> = {
    Dashboard: "/dashboard",
    inward: "/inward_dashboard",
    programer: "/programer_dashboard",
    qa: "/qa_dashboard",
    accounts: "/accounts_dashboard",
    admin: "/admin_dashboard",
  };

  const formatTitle = (role: string) =>
    role.charAt(0).toUpperCase() + role.slice(1) + " Dashboard";

  const roleCards = useMemo(() => {
    if (!user) return [];
    const rolesToShow = user.isAdmin ? Object.keys(rolePaths) : user.roles;
    return rolesToShow.map((role) => ({
      role,
      title: formatTitle(role),
      path: rolePaths[role],
    }));
  }, [user]);

  /* ---------- CLOSE DROPDOWNS / MODAL OUTSIDE CLICK ---------- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;

      if (userOpen && userRef.current && !userRef.current.contains(t)) {
        setUserOpen(false);
      }
      if (menuOpen && menuRef.current && !menuRef.current.contains(t)) {
        setMenuOpen(false);
      }
      if (confirmOpen && modalRef.current && !modalRef.current.contains(t)) {
        setConfirmOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [userOpen, menuOpen, confirmOpen]);

  /* ------------------------------------------------------------ */

  return (
    <>
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="w-full max-w-8xl mx-auto px-8 sm:px-6 lg:px-16 flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src="/logo.png" className="w-32 object-cover" />
            <div className="hidden sm:flex flex-col">
              <h1 className="text-lg font-bold">Sakthi Laser Technology</h1>
              <p className="text-sm text-gray-500">Enterprise Resource Planning</p>
            </div>
          </div>

          {/* ----------- RIGHT SIDE BUTTONS (2 DROPDOWNS) ----------- */}
          <div className="flex items-center gap-4">

            {/* USER DROPDOWN */}
            <div className="relative" ref={userRef}>
              <button
                onClick={() => {
                  setUserOpen(!userOpen);
                  setMenuOpen(false); // close other dropdown
                }}
                className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
              >
                <User className="w-5 h-5" />
              </button>

              {/* USER DROPDOWN MENU */}
              {userOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {user?.username}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setUserOpen(false);
                      setConfirmOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>

            {/* DASHBOARD DROPDOWN */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => {
                  setMenuOpen(!menuOpen);
                  setUserOpen(false); // close other dropdown
                }}
                className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {/* DASHBOARD MENU */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg py-2 z-50">

                  {/* ALWAYS SHOW DASHBOARD */}
                  <button
                    onClick={() => {
                      navigate("/dashboard");
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 font-medium border-b"
                  >
                    Dashboard
                  </button>

                  {/* ROLES SECTION */}
                  {roleCards.length === 0 ? (
                    <p className="px-4 py-2 text-sm text-gray-500 text-center">
                      No roles available
                    </p>
                  ) : (
                    roleCards
                      .filter((item) => item.role !== "Dashboard") // avoid duplicate dashboard
                      .map((item) => (
                        <button
                          key={item.role}
                          onClick={() => {
                            navigate(item.path);
                            setMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                        >
                          {item.title}
                        </button>
                      ))
                  )}

                </div>
              )}


            </div>

          </div>
        </div>
      </header>

      {/* ---------- LOGOUT CONFIRM MODAL ---------- */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[999] backdrop-blur-sm">
          <div ref={modalRef} className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">

            <div className="flex flex-col items-center text-center gap-3">
              <AlertTriangle className="w-12 h-12 text-red-500" />
              <h2 className="text-xl font-semibold text-gray-800">
                Confirm Logout
              </h2>
              <p className="text-gray-600 text-sm">Are you sure you want to logout?</p>

              <div className="flex gap-4 mt-4 w-full">
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="flex-1 px-4 py-2 rounded-lg border hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={logout}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                >
                  Yes, Logout
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default Header;
