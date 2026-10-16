import React from "react";

export const Card = ({
  children,
  className = "",
  title,
  subtitle,
  actions,
  headerClassName = "",
  bodyClassName = "",
  ...props
}) => {
  return (
    <div
      className={`bg-surface rounded-xl border border-gray-200/80 shadow-sm overflow-hidden ${className}`}
      {...props}
    >
      {(title || subtitle || actions) && (
        <div
          className={`px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2 ${headerClassName}`}
        >
          <div>
            {title && (
              <h3 className="text-base font-semibold text-textPrimary leading-6">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-textSecondary mt-0.5">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>{children}</div>
    </div>
  );
};

export default Card;
