import React, { useEffect, useState } from "react";
import { withRouter, Route } from "react-router-dom";
import { CircularProgress, Backdrop, makeStyles } from "@material-ui/core";
import userService from "../../_helpers/services/user.service";



const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}));
const AuthenticatedComponent = (props) => {
  const [loading, setLoading] = useState(true);
  const [current_user, setCurrent_user] = useState(null);

  const classes = useStyles();

  useEffect(() => {
    const getUser = async () => {
      userService.getUser()
      .then((value) => {
        setCurrent_user(value);
        setLoading(false);
      })
      .catch((err) => {

      })
    }
    getUser();
  }, []);

 

  if (loading) {
    return (
      <div>
        <Backdrop
          className={classes.backdrop}
          open={true}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
      </div>
    );
  }

  if (props.render){
    return (
      <Route
        path={props.path}
        exact
        render={() => (
          <props.render
            {...props.rest}
            current_user={current_user}
  
          />
        )}
      />
    );
  } else {
    return (
      <Route
        path={props.path}
        exact
        component={() => (
          <props.Component
            {...props.rest}
            current_user={current_user}
  
          />
        )}
      />
    );
  }
  
};

export default withRouter(AuthenticatedComponent);
