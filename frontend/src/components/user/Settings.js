
import { Avatar, Button, Divider, IconButton, List, ListItem, ListItemText, TextField, Tooltip } from "@material-ui/core";
import { Settings } from "@material-ui/icons";
import React, { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet";
import useNotification from "../../_helpers/hooks/useNotification";
import { catchError401, getJwt, isAuthenticated, updateToken } from "../../_helpers/jwt";
import Navigation from "../Navigation";
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";

import DeleteIcon from '@material-ui/icons/Delete';

function UserSettings(props) {
    const { addNotification } = useNotification();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [firstNameError, setFirstNameError] = useState(false);
    const [lastNameError, setLastNameError] = useState(false);
    const [open, setOpen] = useState(false);
    const [people, setPeople] = useState(props.current_user.people);
    const [extraPeople, setExtraPeople] = useState([]);
    async function addPerson() {

    }

    async function handleSubmit(e) {
        e.preventDefault() // stops default reloading behaviour
        if (lastName.length === 0){
            setLastNameError(true);
        } else {
            setLastNameError(false);
        }
        if (firstName.length === 0){
            setFirstNameError(true);
        }else {
            setFirstNameError(false);
        }

        if (!(firstName.length === 0 || lastName.length === 0)){


        if (!isAuthenticated()) {
            await updateToken();
        }

        const jwt = getJwt();

        return fetch(`/api/people?first_name=${firstName}&last_name=${lastName}`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwt}`,
            },
            body: JSON.stringify({
                first_name: firstName,
                last_name: lastName
            })
        })
            .then((response) => {
                catchError401(response.status);
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
            .then((value) => {
                people.push(value.person);
             
                setOpen(false);
                addNotification(firstName + " has been added", "success");
                
            })
            .catch((err) => {
                console.error(err);
                addNotification("Something went wrong", "error");
            });
        }
    }

    async function deletePerson(people_id, index){
        if (!isAuthenticated()) {
            await updateToken();
        }

        const jwt = getJwt();

        return fetch(`/api/people?people_id=${people_id}`, {
            method: "DELETE",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${jwt}`,
            }
        })
            .then((response) => {
                catchError401(response.status);
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
            .then((value) => {
                people.splice(index, 1);
                addNotification("Person has been removed", "success");
                
            })
            .catch((err) => {
                console.error(err);
                addNotification("Something went wrong", "error");
            });
        }
    

    return (
        <div>
            <Helmet>
                <title>Settings</title>
            </Helmet>

            <Navigation current_user={props.current_user} />


            <Dialog


        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="form-dialog-title"
        maxWidth={'sm'}
        fullWidth={true}
      >
      
        <DialogTitle id="draggable-dialog-title">
          Add person
        
        </DialogTitle>
        <form noValidate autoComplete="off" onSubmit={handleSubmit}>
        <DialogContent>
        
        <TextField
            error={firstNameError}
            autoFocus
            margin="dense"
            id="name"
            label="First name"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
           fullWidth
          />
          <TextField
          error={lastNameError}
            
            margin="dense"
            id="name"
            label="Last name"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            fullWidth
          />
          
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            Cancel
          </Button>
          <Button type="submit" color="primary">
            Add
          </Button>
        </DialogActions>
        </form>
      </Dialog>

            <div className="flex-container flex-justify-center padding-topbottom">
                <div className="flex-10 padding">
                    <h1 className="">Settings</h1>

                    <div className="flex-container margin-top flex-justify-spacebetween">
                        <h2>People</h2>
                        <Tooltip title="Add people">
                        <IconButton color="primary" aria-label="add" onClick={() => setOpen(true)}>
                            <AddIcon fontSize="small" />
                        </IconButton>
                        </Tooltip>
                    </div>

                    <List component="nav" aria-label="mailbox folders">
                        <ListItem divider>
                            <Avatar className="margin-right" style={{ background: "var(--c-primary)", color: "white" }}>{props.current_user.firstName.substring(0, 1) + props.current_user.lastName.substring(0, 1)}</Avatar>
                            <ListItemText primary={props.current_user.firstName + " " + props.current_user.lastName + " (you)"} />
                        </ListItem>
                        {people.map((value, index) => {
                            return (
                                <ListItem key={index} divider>
                                    <div className="flex-container flex-justify-spacebetween fill-width">
                                        <div className="flex-container">
                                    <Avatar className="margin-right" style={{ background: "var(--c-primary)", color: "white" }}>{value.first_name.substring(0, 1) + value.last_name.substring(0, 1)}</Avatar>
                                    <ListItemText primary={value.first_name + " " + value.last_name} />
                                    </div>
                                        <IconButton aria-label="delete" onClick={() => {deletePerson(value.people_id, index)}}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </div>
                                </ListItem>
                            );
                        })}

                    </List>

                </div>
            </div>
        </div>
    )
                    }

export default UserSettings;