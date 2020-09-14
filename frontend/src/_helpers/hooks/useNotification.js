import { useContext } from "react";
import { NotificationContext } from "../providers/NotificationProvider";


function useNotification() {
  const { notification, addNotification, removeNotification } = useContext(NotificationContext);
  return { notification, addNotification, removeNotification };
}

export default useNotification;
