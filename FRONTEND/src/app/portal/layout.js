import PortalProvider from "../../providers/PortalProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import React from "react";

const layout = ({ children }) => {
  return (
    <ProtectedRoute>
      <PortalProvider>{children}</PortalProvider>
    </ProtectedRoute>
  );
};

export default layout;
