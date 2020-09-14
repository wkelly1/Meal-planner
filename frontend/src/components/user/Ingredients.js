import React, { useEffect, useState } from "react";

import { Helmet } from "react-helmet";

import {
  setJwt,
  catchError401,
  getJwt,
  updateToken,
  isAuthenticated,
} from "../../_helpers/services/auth.service";

import Navigation from "../Navigation";
import ButtonLoader from "../_shared/ButtonLoader";
import { Skeleton } from "@material-ui/lab";
import { Button } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import useNotification from "../../_helpers/hooks/useNotification";
import authHeader from "../../_helpers/services/auth-header";
import userService from "../../_helpers/services/user.service";

const Ingredients = (props) => {
  const [ingredients, setIngredients] = useState([]);
  const [ingredientsRefined, setIngredientsRefined] = useState([]);
  const [loadingIngredients, setLoadingIngredients] = useState(false);
  const [gotAllIngredients, setGotAllIngredients] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteTemp, setDeleteTemp] = useState(null);
  const [deleteTempIndex, setDeleteTempIndex] = useState(null);
  const { addNotification } = useNotification();

  useEffect(() => {

    getIngredients(limit, offset);
  }, []);

  async function getIngredients(limit, offset) {
    if (!gotAllIngredients) {
      userService.getIngredients(offset, limit)
        .then((value) => {
          setIngredients(ingredients.concat(value.ingredients));
          setIngredientsRefined(ingredients.concat(value.ingredients));
          console.log(value.ingredients.length, limit);
          if (value.ingredients.length < limit) {
            setGotAllIngredients(true);
          }
          setOffset(offset + limit);
          setLoadingIngredients(false);
          setLoading(false);
        })
        .catch((err) => {

        });
    } else {
      setLoadingIngredients(false);
      setLoading(false);
    }
  }

  async function deleteIngredient(id, index) {
    userService.deleteIngredient(id)
      .then((value) => {

        ingredientsRefined.splice(index, 1);
        ingredients.splice(index, 1);

        addNotification("Ingredient has been deleted!", "success");
      })
      .catch((error) => {
        addNotification("Something went wrong!", "error");
      });
  }

  function handleClose(event, reason) {
    if (reason === "clickaway") {
      return;
    }

    setSuccess(false);
  }

  function handleErrorClose(event, reason) {
    if (reason === "clickaway") {
      return;
    }

    setError(false);
  }

  function handleDialogClose() {
    setDialogOpen(false);
  }


  return (
    <div>
      <Helmet>
        <title>Your ingredients</title>
      </Helmet>
      <Navigation current_user={props.current_user}></Navigation>
      {/* <Snackbar open={success} autoHideDuration={6000} onClose={handleClose}>
        <Alert severity="success" onClose={handleClose}>
          Ingredient has been deleted!
        </Alert>
      </Snackbar>

      <Snackbar open={error} autoHideDuration={6000} onClose={handleErrorClose}>
        <Alert severity="error" onClose={handleErrorClose}>
          Something went wrong!
        </Alert>
      </Snackbar> */}

      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Are you sure you want to delete that ingredient?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Deleting an ingredient will mean that it is removed from any meal
            using it.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Close
          </Button>
          <Button
            onClick={() => {
              deleteIngredient(deleteTemp, deleteTempIndex);
              handleDialogClose();
            }}
            color="primary"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <div className="flex-container flex-justify-center padding-topbottom">
        <div className="flex-10 padding">
          <h1 className="margin-bottom">Your ingredients</h1>
          {ingredientsRefined.length === 0 && !loading ? (<div className="flex-container flex-column flex-align-center padding-topbottom">
            <h2 className="c-primary">Nothing yet!</h2>
          </div>) : (null)}

          {loading ? (
            <div className="grid">
              <Skeleton variant="rect" width="100%">
                <div style={{ paddingTop: "57%" }} />
              </Skeleton>
              <Skeleton variant="rect" width="100%">
                <div style={{ paddingTop: "57%" }} />
              </Skeleton>
              <Skeleton variant="rect" width="100%">
                <div style={{ paddingTop: "57%" }} />
              </Skeleton>
              <Skeleton variant="rect" width="100%">
                <div style={{ paddingTop: "57%" }} />
              </Skeleton>
              <Skeleton variant="rect" width="100%">
                <div style={{ paddingTop: "57%" }} />
              </Skeleton>
              <Skeleton variant="rect" width="100%">
                <div style={{ paddingTop: "57%" }} />
              </Skeleton>
            </div>
          ) : null}
          <div className="grid">
            {ingredientsRefined.map((ingredient, index) => (
              <div
                key={index}
                className="flex-container flex-justify-spacebetween b-light-grey radius position-relative"

              >
                <div
                  className="position-absolute hoverDelete"
                  style={{ fontSize: "50px" }}
                  onClick={() => {
                    setDeleteTemp(ingredient.ingredient_id);
                    setDeleteTempIndex(index);
                    setDialogOpen(true);
                  }}
                >
                  <span>
                    <span
                      className="material-icons"
                      style={{ color: "white", fontSize: "40px" }}
                    >
                      delete_outline
                    </span>
                  </span>
                </div>
                <div
                  className="flex-container flex-column flex-align-center"
                  style={{ height: "100%", width: "100%" }}
                >
                  <div
                    className="flex-container flex-column flex-justify-center flex-align-center"
                    style={{ height: "100%", width: "100%" }}
                  >
                    <div>
                      <small>Name</small>
                      <h2>{ingredient.name}</h2>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="margin-top flex-container flex-justify-center">
            {!gotAllIngredients ? (
              <ButtonLoader
                loading={loadingIngredients}
                text="Load more"
                onClick={() => {
                  setLoadingIngredients(true);
                  getIngredients(limit, offset);
                }}
              ></ButtonLoader>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ingredients;
