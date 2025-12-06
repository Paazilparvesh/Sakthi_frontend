import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button"; // shadcn/ui button
// import { motion } from "framer-motion";

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50 px-6">
      {/* Logo */}
      <img
        src="/logo.png" // <-- Replace with your actual logo path
        alt="Site Logo"
        className="w-24 mb-6"
      />

      {/* Card */}
      <div
        className="bg-white shadow-xl rounded-2xl p-8 max-w-md text-center border border-gray-200"
      >
        <h1 className="text-3xl font-semibold text-red-600 mb-3">
          Unauthorized Access
        </h1>

        <p className="text-gray-600 mb-6 leading-relaxed">
          You don’t have permission to view this page.
          Please contact an administrator if you believe this is an error.
        </p>

        <Button
          onClick={handleGoHome}
          className="w-full py-5 text-base font-medium rounded-xl"
        >
          Go Back Home
        </Button>
      </div>
    </div>
  );
};

export default Unauthorized;
