"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationProps {
  notification: Notification;
  onClose: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

const iconStyles = {
  success: "text-green-400",
  error: "text-red-400",
  warning: "text-yellow-400",
  info: "text-blue-400",
};

export function NotificationItem({ notification, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const Icon = icons[notification.type];

  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose(notification.id), 300);
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.duration, notification.id, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(notification.id), 300);
  };

  return (
    <div
      className={cn(
        "pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition-all duration-300",
        isVisible
          ? "translate-x-0 transform opacity-100"
          : "translate-x-full transform opacity-0",
        styles[notification.type]
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={cn("h-6 w-6", iconStyles[notification.type])} />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium">{notification.title}</p>
            {notification.message && (
              <p className="mt-1 text-sm opacity-90">{notification.message}</p>
            )}
            {notification.action && (
              <div className="mt-3">
                <button
                  onClick={notification.action.onClick}
                  className="text-sm font-medium underline hover:no-underline"
                >
                  {notification.action.label}
                </button>
              </div>
            )}
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              onClick={handleClose}
              className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface NotificationContainerProps {
  notifications: Notification[];
  onClose: (id: string) => void;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

const positionStyles = {
  "top-right": "top-0 right-0",
  "top-left": "top-0 left-0",
  "bottom-right": "bottom-0 right-0",
  "bottom-left": "bottom-0 left-0",
};

export function NotificationContainer({
  notifications,
  onClose,
  position = "top-right",
}: NotificationContainerProps) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed z-50 space-y-4 p-6",
        positionStyles[position]
      )}
    >
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={onClose}
        />
      ))}
    </div>
  );
}

// Hook for managing notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000,
    };

    setNotifications((prev) => [...prev, newNotification]);
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Convenience methods
  const success = (
    title: string,
    message?: string,
    options?: Partial<Notification>
  ) => addNotification({ type: "success", title, message, ...options });

  const error = (
    title: string,
    message?: string,
    options?: Partial<Notification>
  ) => addNotification({ type: "error", title, message, ...options });

  const warning = (
    title: string,
    message?: string,
    options?: Partial<Notification>
  ) => addNotification({ type: "warning", title, message, ...options });

  const info = (
    title: string,
    message?: string,
    options?: Partial<Notification>
  ) => addNotification({ type: "info", title, message, ...options });

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info,
  };
}
