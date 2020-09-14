import React from "react";
import useNotification from "../../_helpers/hooks/useNotification";
import { Snackbar } from "@material-ui/core";
import { Alert } from "@material-ui/lab";

function Notification() {
  const { notification, removeNotification } = useNotification();

  const handleErrorClose = () => {
    removeNotification();
  };

  console.log("ERROR", notification);

  return (
    <Snackbar open={!!notification} autoHideDuration={3000} onClose={handleErrorClose}>
      {notification ? (
        <Alert severity={ notification.type } onClose={handleErrorClose}>
          {notification.message}
        </Alert>
      ) : null}
    </Snackbar>
  );
}

export default Notification;

export function withNotifications(Component) {
  return function WrappedComponent(props){
    const { addNotification } = useNotification();
    return <Component {...props} addNotification={addNotification}/>
  }
}