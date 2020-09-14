import React, { useEffect, useState } from "react";
import {
  isAuthenticated,
  updateToken,
  getJwt,
  catchError401,
} from "../_helpers/jwt";
import { withRouter, Route } from "react-router-dom";
import { CircularProgress, Backdrop, makeStyles } from "@material-ui/core";


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

  useEffect(async () => {
    if (!isAuthenticated()) {
      await updateToken();
    }

    const jwt = getJwt();

    fetch("/api/user", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    })
      .then((response) => {
        catchError401(response.status);
        return response.json();
      })
      .then((value) => {
        setCurrent_user(value);
        setLoading(false);
      });
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



// class AuthenticatedComponent extends Component {
//   constructor(props) {
//     super(props);
    
//     this.state = {
//       loading: true,
//     };
//   }

//   componentDidMount() {
//     if (!isAuthenticated()) {
//       updateToken();
//     }

//     const jwt = getJwt();

//     fetch("/api/user", {
//       headers: {
//         Accept: "application/json",
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${jwt}`,
//       },
//     })
//       .then((response) => {
//         catchError401(response.status);
//         return response.json();
//       })
//       .then((value) => {
//         this.setState({
//           current_user: value,
//           loading: false,
//         });
//       });
//   }

//   render() {

//     if (this.state.loading) {
//       return (
//         <div>
//           <Backdrop
//             className={this.classes.backdrop}
//             open={true}
//           >
//             <CircularProgress color="inherit" />
//           </Backdrop>
//         </div>
//       );
//     }

//     return (
//       <Route
//         path={this.props.path}
//         exact
//         component={(props) => (
//           <this.props.Component
//             {...this.props.rest}
//             current_user={this.state.current_user}
//           />
//         )}
//       />
//     );
//   }
// }

export default withRouter(AuthenticatedComponent);
