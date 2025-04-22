import * as React from "react";

export type ToastActionElement = React.ReactElement;

export interface ToastProps {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Toast({ 
  title, 
  description, 
  action, 
  open, 
  onOpenChange 
}: ToastProps) {
  return (
    <div
      className={`fixed bottom-4 right-4 z-50 max-w-md rounded-md bg-white p-4 shadow-lg ${
        open ? "block" : "hidden"
      }`}
      role="alert"
    >
      {title && <div className="font-medium">{title}</div>}
      {description && <div className="mt-1 text-sm text-gray-600">{description}</div>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export const Toaster = () => {
  return null; // Simplified implementation
};