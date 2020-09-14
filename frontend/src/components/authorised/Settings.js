
import { Avatar, Button, IconButton, List, ListItem, ListItemText, TextField, Tooltip } from "@material-ui/core";
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import useNotification from "../../_helpers/hooks/useNotification";

import Navigation from "../_shared/Navigation";
import AddIcon from '@material-ui/icons/Add';
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";

import DeleteIcon from '@material-ui/icons/Delete';
import userService from "../../_helpers/services/user.service";

function UserSettings(props) {
    const { addNotification } = useNotification();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [firstNameError, setFirstNameError] = useState(false);
    const [lastNameError, setLastNameError] = useState(false);
    const [open, setOpen] = useState(false);
    const [people] = useState(props.current_user.people);


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


        userService.setPeople(firstName, lastName)
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
        userService.deletePeople(people_id)
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