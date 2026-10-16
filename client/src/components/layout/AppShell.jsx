import React from "react";
import PropTypes from "prop-types";
import HeaderBar from "./HeaderBar";
import SidebarNav from "./SidebarNav";

export function AppShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7FAFC]">
      <HeaderBar />
      <div className="flex flex-1 min-w-0">
        <SidebarNav />
        <main className="flex-1 min-w-0 p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

AppShell.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppShell;
