import React, { useState, useCallback } from "react";

export const NotificationContext = React.createContext({
  notification: null,
  addNotification: () => {},
  removeNotification: () => {}
});

export default function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);

  const removeNotification = () => setNotification(null);

  const addNotification = (message, type) => setNotification({ message, type });

  const contextValue = {
    notification: notification,
    addNotification: useCallback((message, status) => addNotification(message, status), []),
    removeNotification: useCallback(() => removeNotification(), [])
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}
