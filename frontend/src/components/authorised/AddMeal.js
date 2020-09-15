import React, { Component } from "react";
import Navigation from "../_shared/Navigation";
import history from "../../_helpers/hooks/history";
import { DebounceInput } from "react-debounce-input";
import { Snackbar, Button } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import userService from "../../_helpers/services/user.service";
import { withNotifications } from "../_shared/Notification";

class AddMeal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: "",
      selectedIngredients: [],
      ingredientSearch: "",
      ingredients: [],
      offset: 0,
      limit: 3,
      gotAllIngredients: true,
      loadingIngredients: false,
      searching: false,
      open: false,
      error: false,
    };

    this.change = this.change.bind(this);
    this.submit = this.submit.bind(this);
    this.getIngredients = this.getIngredients.bind(this);
    this.selectIngredient = this.selectIngredient.bind(this);
    this.checkExactMatch = this.checkExactMatch.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleErrorClose = this.handleErrorClose.bind(this);
  }

  change(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  async getIngredients() {
    if (!this.state.gotAllIngredients) {
      userService.getIngredientsWithQuery(this.state.offset, this.state.limit, this.state.ingredientSearch)
        .then((value) => {
          if (this.state.offset === 0) {
            this.setState({
              ingredients: [],
            });
          }
          this.setState({
            ingredients: this.state.ingredients.concat(value.ingredients),
          });

          if (value.ingredients.length < this.state.limit) {
            this.setState({
              gotAllIngredients: true,
            });
          } else {
            this.setState({
              gotAllIngredients: false,
            });
          }

          this.setState({
            offset: this.state.offset + this.state.limit,
            loadingIngredients: false,
          });
        })
        .catch((err) => {

        })
    } else {
      this.setState({
        loadingIngredients: false,
      });
    }
  }

  selectIngredient(ingredient) {
    ingredient = {
      ...ingredient,
      quantity: null,
      unit: "",
    };
    //console.log(ingredient)
    //console.log(this.state.selectedIngredients.push(ingredient));
    this.setState({
      selectedIngredients: [...this.state.selectedIngredients, ingredient],
      ingredientSearch: "",
      ingredients: [],
    });
    //console.log(this.state.selectedIngredients);
  }

  async submit(e) {
    e.preventDefault();

    let ingredient = this.state.selectedIngredients.map((value) => {
      return {
        ingredient_id: value.ingredient_id,
        quantity: parseInt(value.quantity),
        unit: value.unit,
      };
    });

    userService.setMeal(this.state.name, ingredient)
      .then((value) => {
        history.push("/meals");
      })
      .catch((err) => {
        console.log(err)
        if (err.response){
          this.props.addNotification(err.data.msg, err.data.type);
        } else {
          this.props.addNotification("Something went wrong", "error");
        }
       
      });
  }

  checkExactMatch(value) {
    return this.state.ingredients.some((ingredient) => {
      return ingredient.name === value;
    });
  }

  async addNewIngredient() {

    let ingredient = this.state.selectedIngredients.map((value) => {
      return {
        ingredient_id: value.ingredient_id,
        quantity: value.quantity,
        unit: value.unit,
      };
    });
    console.log(ingredient);

    userService.setIngredient(this.state.ingredientSearch)
      .then((value) => {
        this.selectIngredient(value.ingredient);
        this.setState({
          open: true,
        });
      });
  }

  handleClose(event, reason) {
    if (reason === "clickaway") {
      return;
    }

    this.setState({
      open: false,
    });
  }

  handleErrorClose(event, reason) {
    if (reason === "clickaway") {
      return;
    }

    this.setState({
      error: false,
    });
  }

  render() {

    return (
      <div>
        <Navigation current_user={this.props.current_user}></Navigation>

        <Snackbar
          open={this.state.open}
          autoHideDuration={6000}
          onClose={this.handleClose}
        >
          <Alert severity="success" onClose={this.handleClose}>
            Ingredient has been added!
          </Alert>
        </Snackbar>

        <Snackbar
          open={this.state.error}
          autoHideDuration={6000}
          onClose={this.handleErrorClose}
        >
          <Alert severity="error" onClose={this.handleErrorClose}>
            Something went wrong!
          </Alert>
        </Snackbar>

        <div className="flex-container flex-justify-center padding-topbottom">
          <div className="flex-10 flex-container flex-justify-center">
            <form
              onSubmit={(e) => this.submit(e)}
              className="flex-container flex-column padding padding-topbottom radius b-white"
              style={{ width: "550px" }}
            >
              <section className="form-group">
                <label for="name">Meal name</label>
                <input
                  className="form-input"
                  type="text"
                  name="name"
                  placeholder="Meal name"
                  onChange={(e) => this.change(e)}
                  value={this.state.name}
                />
              </section>

              <section className="form-group">
                <label for="name">Ingredient search</label>
                <div
                  className="form-input flex-container flex-align-center"
                  style={{ padding: 0 }}
                >
                  <span class="material-icons" style={{ padding: "0 15px" }}>
                    search
                  </span>
                  <DebounceInput
                    className="form-input"
                    debounceTimeout={300}
                    type="text"
                    name="ingredientSearch"
                    placeholder="Name"
                    onChange={(e) => {
                      this.change(e);
                      this.setState({
                        offset: 0,
                        gotAllIngredients: false,
                      });
                      this.getIngredients();
                    }}
                    value={this.state.ingredientSearch}
                  />
                </div>

                <div
                  className="flex-20 flex-container wrap-container"
                  style={{ marginTop: "5px" }}
                >
                  {this.state.ingredients.map((ingredient, index) => (
                    <div
                      key={index}
                      className="b-light-grey radius-small colour-text-black flex-container flex-align-center wrap-child cursor-pointer margin-right"
                      style={{ height: "40px" }}
                      onClick={() => {
                        this.selectIngredient(ingredient);
                      }}
                    >
                      <p class="paragraph padding">{ingredient.name}</p>
                    </div>
                  ))}

                  {!this.state.gotAllIngredients ? (
                    <div
                      className="b-primary radius-small c-white flex-container flex-align-center wrap-child cursor-pointer margin-right padding"
                      style={{ height: "40px" }}
                      onClick={() => {
                        this.getIngredients();
                      }}
                    >
                      <p class="paragraph">Load more</p>
                    </div>
                  ) : null}

                  {this.state.ingredientSearch &&
                    !this.checkExactMatch(this.state.ingredientSearch) ? (
                      <div
                        className="b-primary radius-small c-white flex-container flex-align-center wrap-child cursor-pointer margin-right"
                        style={{ height: "40px" }}
                        onClick={() => {
                          this.addNewIngredient();
                        }}
                      >
                        <span class="material-icons padding">
                          add_circle_outline
                      </span>
                        <p class="paragraph margin-right">
                          Add as new ingredient?
                      </p>
                      </div>
                    ) : null}
                </div>

                {this.state.selectedIngredients.map((ingredient, index) => (
                  <div
                    key={index}
                    className="b-light-grey radius-small colour-text-black flex-container flex-justify-spacebetween flex-align-center wrap-child cursor-pointer"
                    style={{ height: "50px" }}
                  >
                    <p className="paragraph padding">{ingredient.name}</p>
                    <div className="flex-container flex-column">
                      <input
                        className="form-input-blank no-padding"
                        type="number"
                        name="quantity"
                        placeholder="quantity"
                        onKeyDown={(event) => {
                          if (
                            !(
                              event.ctrlKey ||
                              event.altKey ||
                              (47 < event.keyCode &&
                                event.keyCode < 58 &&
                                event.shiftKey === false) ||
                              (95 < event.keyCode && event.keyCode < 106) ||
                              event.keyCode === 8 ||
                              event.keyCode === 9 ||
                              (event.keyCode > 34 && event.keyCode < 40) ||
                              event.keyCode === 46
                            )
                          ) {
                            event.preventDefault();
                          }
                        }}
                        onChange={(e) => {
                          let temp = [...this.state.selectedIngredients];
                          temp[index].quantity = e.target.value;
                          this.setState({ selectedIngredients: temp });
                        }}
                        value={ingredient.quantity}
                        style={{ width: "100px", MozAppearance: "textfield" }}
                      />
                      {ingredient.quantity ? (
                        <small
                          className="c-dark-grey"
                          style={{ fontSize: "13px", fontWeight: "bold" }}
                        >
                          Quantity
                        </small>
                      ) : null}
                    </div>
                    <div className="flex-container flex-column">
                      <input
                        className="form-input-blank no-padding"
                        type="text"
                        name="unit"
                        placeholder="unit"
                        style={{ width: "60px" }}
                        onChange={(e) => {
                          let temp = [...this.state.selectedIngredients];
                          temp[index].unit = e.target.value;
                          this.setState({ selectedIngredients: temp });
                        }}
                        value={ingredient.unit}
                      />
                      {ingredient.unit ? (
                        <small
                          className="c-dark-grey"
                          style={{ fontSize: "13px", fontWeight: "bold" }}
                        >
                          Unit
                        </small>
                      ) : null}
                    </div>
                    <span
                      className="material-icons"
                      style={{ padding: "0 10px" }}
                      onClick={() => {
                        let temp = [...this.state.selectedIngredients];
                        temp.splice(index, 1);
                        this.setState({ selectedIngredients: temp });
                      }}
                    >
                      delete
                    </span>
                  </div>
                ))}
              </section>

              <Button
                style={{
                  borderRadius: 35,
                  textTransform: "capitalize",
                }}
                type="submit"
                variant="contained"
                color="primary"
              >
                Add meal
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default withNotifications(AddMeal);
