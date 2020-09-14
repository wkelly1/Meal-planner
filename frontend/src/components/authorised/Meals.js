import React, { useEffect, useState } from "react";
import Navigation from "../_shared/Navigation";
import { Helmet } from "react-helmet";
import Collapse from "@material-ui/core/Collapse";
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Avatar, Divider, Paper, Snackbar, Tooltip, Typography } from "@material-ui/core";
import { Alert, Skeleton } from "@material-ui/lab";

import ButtonLoader from "../_shared/ButtonLoader";
import { Button } from "@material-ui/core";
import userService from "../../_helpers/services/user.service";

const Dashboard = (props) => {
    const [meals, setMeals] = useState([]);
    const [mealsRefined, setMealsRefined] = useState([]);
    const [loadingMeals, setLoadingMeals] = useState(false);
    const [gotAllMeals, setGotAllMeals] = useState(false);
    const [limit] = useState(10);
    const [offset, setOffset] = useState(0);
    const [open, setOpen] = React.useState(false);
    const [successOpen, setSuccessOpen] = React.useState(false);
    const [mealTemp, setMealTemp] = React.useState({});
    const [mealTempIndex, setMealTempIndex] = React.useState(0);
    const [loading, setLoading] = React.useState(true);


    const handleClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        getMeals(limit, offset);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function getMeals(limit, offset) {
        if (!gotAllMeals) {

            userService.getMeals(offset, limit)
                .then((value) => {
                    setMeals(
                        meals.concat(
                            value.map((val) => {
                                return { ...val, collapsed: true };
                            })
                        )
                    );
                    setMealsRefined(
                        meals.concat(
                            value.map((val) => {
                                return { ...val, collapsed: true };
                            })
                        )
                    );

                    if (value.length < limit) {
                        setGotAllMeals(true);
                    }
                    setOffset(offset + limit);
                    setLoadingMeals(false);
                    setLoading(false);
                }).catch((err) => {

                })
        } else {
            setLoadingMeals(false);
        }
    }

    async function deleteMeal() {
        userService.deleteMeal(mealTemp.meal_id)
            .then((value) => {
                mealsRefined.splice(mealTempIndex, 1)
                setSuccessOpen(true);
            })
            .catch((error) => {

            });
    }

    return (
        <div>
            <Helmet>
                <title>Your meals</title>
            </Helmet>
            <Navigation current_user={props.current_user}></Navigation>

            <Snackbar
                open={successOpen}
                autoHideDuration={6000}
                onClose={() => {
                    setSuccessOpen(false)
                }}
            >
                <Alert severity="success" onClose={() => {
                    setSuccessOpen(false)
                }}>
                    Meal has been deleted!
                </Alert>
            </Snackbar>

            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Are you sure you want to delete that meal?"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Deleting a meal will mean that it no longer appears as one of your meals but the ingredients
                        will still be available for other meals
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Close
                    </Button>
                    <Button onClick={() => {
                        deleteMeal();
                        handleClose()
                    }} color="primary" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>


            <div className="flex-container flex-justify-center padding-topbottom">
                <div className="flex-10 padding">
                    <h2 className="margin-bottom">Your meals</h2>
                    <Typography>Your frequently cooked</Typography>
                    <Divider />


                    <div className="flex-container flex-column">

                        {loading ? (
                            <div style={{ height: "70px" }}>
                                <Skeleton variant="rect" width="100%">
                                    <div style={{ paddingTop: "57%" }} />
                                </Skeleton>
                            </div>) : null}
                        {mealsRefined.slice(0, 5).map((meal, index) => (
                            <Paper
                                key={index}
                                className="flex-container flex-column padding padding-topbottom b-light-grey radius margin-top"
                            >
                                <div className="flex-container flex-justify-spacebetween">
                                    <div className="flex-container flex-column">
                                        <small>Name</small>
                                        <h2>{meal.title}</h2>
                                    </div>

                                    <div className="flex-container flex-column">


                                        <small>Ingredients</small>

                                        <ul
                                            style={{ listStylePosition: "inside", marginTop: "5px", fontSize: "15px", color: "#3c4043" }}
                                        >
                                            {meal.ingredients.map((ingredient, index2) => (
                                                <li key={index2} >
                                                    {ingredient.quantity}
                                                    {ingredient.unit} {ingredient.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div class="flex-container flex-align-center">
                                        <Tooltip title={"Cooked " + meal.usages + " times"}>
                                            <Avatar style={{ background: "var(--c-primary)", color: "white" }}>{meal.usages}</Avatar>
                                        </Tooltip>
                                    </div>
                                    <Button onClick={() => {
                                        let temp = [...mealsRefined];
                                        temp[index].collapsed = !temp[index].collapsed;
                                        setMealsRefined(temp);
                                        setMeals(temp);
                                    }}>
                                        {!meal.collapsed ? <ExpandLess /> : <ExpandMore />}
                                    </Button>
                                </div>
                                <Collapse in={!meal.collapsed} timeout="auto" unmountOnExit>
                                    <div className="margin-top flex-container flex-justify-end">
                                        <Button color="secondary" onClick={() => {
                                            setMealTemp(meal);
                                            setMealTempIndex(index);
                                            setOpen(true);
                                        }}>Delete</Button></div>
                                </Collapse>
                            </Paper>
                        ))}

                        {mealsRefined.length > 5 ? (<h2 className="margin-top">Others</h2>) : null}
                        {mealsRefined.slice(6, mealsRefined.length).map((meal, index) => (
                            <div
                                key={index}
                                className="flex-container flex-column padding padding-topbottom b-light-grey radius margin-top"
                            >
                                <div className="flex-container flex-justify-spacebetween">
                                    <div className="flex-container flex-column">
                                        <small>Name</small>
                                        <h2>{meal.title}</h2>
                                    </div>

                                    <div className="flex-container flex-column">
                                        <small>Ingredients</small>

                                        <ul
                                            style={{ listStylePosition: "inside", marginTop: "5px" }}
                                        >
                                            {meal.ingredients.map((ingredient, index2) => (
                                                <li key={index2} className="heading-text">
                                                    {ingredient.quantity}
                                                    {ingredient.unit} {ingredient.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <Button onClick={() => {
                                        let temp = [...mealsRefined];
                                        temp[index].collapsed = !temp[index].collapsed;
                                        setMealsRefined(temp);
                                        setMeals(temp);
                                    }}>
                                        {!meal.collapsed ? <ExpandLess /> : <ExpandMore />}
                                    </Button>
                                </div>
                                <Collapse in={!meal.collapsed} timeout="auto" unmountOnExit>
                                    <div className="margin-top flex-container flex-justify-end">
                                        <Button color="secondary" onClick={() => {
                                            setMealTemp(meal);
                                            setMealTempIndex(index);
                                            setOpen(true);
                                        }}>Delete</Button></div>
                                </Collapse>
                            </div>
                        ))}

                        <div className="margin-top flex-container flex-justify-center">
                            {!gotAllMeals ? (
                                <ButtonLoader
                                    loading={loadingMeals}
                                    text="Load more"
                                    onClick={() => {
                                        setLoadingMeals(true);
                                        getMeals(limit, offset);
                                    }}
                                ></ButtonLoader>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
