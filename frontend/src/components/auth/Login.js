import React, { useState } from "react";
import { useParams } from "react-router-dom";
import authService, { setJwt } from "../../_helpers/services/auth.service";
import { Helmet } from "react-helmet";
import { Button, TextField, Tooltip, Typography } from "@material-ui/core";


import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import ResetPassword from "./ResetPassword";
import useNotification from "../../_helpers/hooks/useNotification";

function Login(props) {
  const { addNotification } = useNotification();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetEmailError, setResetEmailError] = useState("");
  const [open, setOpen] = useState("");

  const { token } = useParams();
  const [resetToken, setResetToken] = useState(token);

  const [resetOpen, setResetOpen] = useState(!!token);


  function handleResetClose() {
    setResetOpen(false);
  }

  function submit(e) {
    e.preventDefault();

    if (email.length === 0) {
      setUsernameError(true);
    } else {
      setUsernameError(false);
    }
    if (password.length === 0) {
      setPasswordError(true);
    } else {
      setPasswordError(false);
    }

    if (!(email.length === 0 || password.length === 0)) {
      authService.login(email, password)

        .then((value) => {
          setJwt(value["access_token"], value["refresh_token"], value["expiry_time"]);
          props.history.push("/meals");
        })
        .catch((err) => {
          addNotification("Invalid email or password, please try again", "warning");
        })
    }

    //.then(localStorage.setItem('jwt', ));
  }

  function handleClose() {
    setOpen(false);
  }

  function sendReset() {
    if (resetEmail.length === 0) {
      setResetEmailError(true);
    } else {
      setResetEmailError(false);

      authService.sendPasswordResetEmail(resetEmail)
        .then((value) => {
          addNotification("Email has been sent!", "success");
          handleClose();
        })
        .catch((err) => {
          addNotification("Something went wrong with that, please try again", "error");
        })
    }
  }




  return (
    <div className="flex-container flex-justify-center flex-align-center fill-height b-light-grey flex-column">
      <Helmet>
        <title>Login</title>
      </Helmet>

      {resetToken ? (
        <ResetPassword open={resetOpen} handleClose={handleResetClose} token={token} />
      ) : null}

      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" maxWidth="xs" fullWidth>
        <DialogTitle id="form-dialog-title">Reset password</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter your email and we will send you an email with instructions on how to reset your password
          </DialogContentText>
          <TextField
            error={resetEmailError}
            value={resetEmail}
            onChange={e => setResetEmail(e.target.value)}
            name="resetEmail"
            margin="dense"
            id="name"
            label="Email Address"
            type="email"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={sendReset} color="primary">
            Send email
          </Button>
        </DialogActions>
      </Dialog>


      <h2 style={{ color: "#254774" }} className="margin-bottom">
        Meals
        </h2>
      <form
        onSubmit={submit}
        className="flex-container flex-column padding padding-topbottom radius b-white"
        style={{ width: "400px" }}
      >
        <section className="form-group">

          <TextField
            error={usernameError}
            label="Username"
            type="text"
            name="email"
            placeholder="Email"
            onChange={e => setEmail(e.target.value)}
            value={email}
            helperText={usernameError ? "Username is required" : ""}
          />
        </section>

        <section className="form-group">

          <TextField
            error={passwordError}

            label="Password"
            type="password"
            name="password"
            placeholder="Password"
            onChange={e => setPassword(e.target.value)}
            value={password}
            helperText={passwordError ? "Password is required" : ""}
          />
        </section>
        <section className="flex-container flex-justify-end padding-bottom">
          <Tooltip title="If you have forgotten your password" onClick={() => {
            setOpen(true)
          }}>
            <Typography style={{ cursor: "pointer", color: "var(--c-primary)" }}>Forgot password?</Typography>
          </Tooltip>
        </section>
        <Button
          style={{
            borderRadius: 35,
            textTransform: "capitalize",
            marginTop: "10px"
          }}
          type="submit"
          variant="contained"
          color="primary"
          className="margin-top"
        >
          Submit
              </Button>

      </form>

    </div>
  );

}

export default Login;

