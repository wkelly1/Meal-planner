import React, { useState } from "react";

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Button, TextField } from "@material-ui/core";
import useNotification from "../../_helpers/hooks/useNotification";
import authService from "../../_helpers/services/auth.service";

function ResetPassword(props) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");

    const { addNotification } = useNotification();

    function sendPassword() {
        if (password.length === 0) {
            setPasswordError(true)
        } else {
            setPasswordError(false);
        }
        if (confirmPassword.length === 0) {
            setConfirmPasswordError(true)
        } else {
            setConfirmPasswordError(false);
        }

        if (confirmPassword !== password){
            setConfirmPasswordError(true)
        } else {
            setConfirmPasswordError(false);
        }

        if (!(password.length === 0 || confirmPassword.length === 0 || confirmPassword !== password)) {
            authService.resetPassword(password, props.token)
                .then((value) => {
                    addNotification("Password has been reset", "success");
                    props.handleClose();
                })
                .catch((err) => {
                    if (err.response){
                      addNotification(err.msg, err.type);
                    } else {
                      addNotification("Something went wrong", "error");
                    }
        }
    }

    return (
        
        <Dialog open={props.open} onClose={props.handleClose} aria-labelledby="form-dialog-title" maxWidth="xs" fullWidth>
            <DialogTitle id="form-dialog-title">Reset password</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Enter your email and we will send you an email with instructions on how to reset your password
          </DialogContentText>
                <TextField
                    error={passwordError}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    name="password"
                    margin="dense"
                    id="password"
                    label="Password"
                    type="password"
                    fullWidth
                />
                <TextField
                    error={confirmPasswordError}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    name="confirmPassword"
                    margin="dense"
                    id="confirmPassword"
                    label="Confirm password"
                    type="password"
                    fullWidth
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={props.handleClose} color="primary">
                    Cancel
          </Button>
                <Button onClick={sendPassword} color="primary" variant="contained" >
                    Reset password
          </Button>
            </DialogActions>
        </Dialog>
    )
}

export default ResetPassword;