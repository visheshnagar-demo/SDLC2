import React from "react";

export default function Card({
  children,
  title,
  subtitle,
  action,
  className = "",
  headerClassName = "",
  bodyClassName = "",
}) {
  return (
    <div
      className={`bg-white rounded-xl border border-[#E3E8F0] shadow-sm overflow-hidden ${className}`}
    >
      {(title || subtitle || action) && (
        <div
          className={`px-6 py-4 border-b border-[#E3E8F0] flex items-center justify-between ${headerClassName}`}
        >
          <div>
            {title && (
              <h3 className="text-base font-semibold text-[#0F1729]">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-[#66738A] mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>{children}</div>
    </div>
  );
}
