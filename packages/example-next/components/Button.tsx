import * as React from "react";

interface Props {
  name: string;
  loading?: boolean | false;
  secondary?: boolean | false;
  onClick: () => void;
  href?: string;
  className?: string;
  disabled?: boolean;
  [x: string]: any;
}

function Button({
  className = "",
  secondary,
  name,
  href,
  loading,
  onClick,
  disabled = false,
  ...props
}: Props) {
  return (
    <button
      type="button"
      className={`flex justify-center bg-gradient-to-r from-blue-700 to-green-400 py-2 px-5 text-white font-semibold rounded-2xl shadow-m text-lg focus:ring-2 ring-blue-700 ${className} ${
        disabled && "opacity-50"
      }`}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        name
      )}
    </button>
  );
}

export default Button;
