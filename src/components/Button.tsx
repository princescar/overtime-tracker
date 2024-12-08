import React from "react";
import clsx from "clsx";

const baseButtonStyles =
  "px-4 py-2 rounded-md font-medium transition-colors cursor-pointer flex items-center justify-center";
const buttonVariants = {
  default: `${baseButtonStyles} bg-blue-500 text-white hover:bg-blue-600`,
  light: `${baseButtonStyles} bg-gray-100 text-gray-700 hover:bg-gray-200`,
  subtle: `${baseButtonStyles} text-gray-600 hover:bg-gray-100`,
  filled: `${baseButtonStyles} bg-blue-100 text-blue-800 hover:bg-blue-200`,
  danger: `${baseButtonStyles} text-red-500 hover:bg-red-300/25 hover:text-red-600`,
};
const spinner = (
  <svg
    className="animate-spin -ml-1 mr-3 h-[20px] w-[20px] inline"
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
);

type ButtonProps = {
  variant?: keyof typeof buttonVariants;
  loading?: boolean;
} & React.ComponentProps<"button">;

export const Button = ({
  variant = "default",
  loading,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={clsx(
        baseButtonStyles,
        buttonVariants[variant],
        loading && "opacity-75 pointer-events-none",
      )}
      {...props}
      disabled={loading}
    >
      {loading && spinner}
      {children}
    </button>
  );
};
