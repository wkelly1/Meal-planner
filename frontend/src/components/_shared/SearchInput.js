import Loader from "react-loader-spinner";
import React from "react";

const SearchInput = (props) => {
  return (
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
            <span class="material-icons padding">add_circle_outline</span>
            <p class="paragraph margin-right">Add as new ingredient?</p>
          </div>
        ) : null}
      </div>

      {this.state.selectedIngredients.map((ingredient, index) => (
        <div
          key={index}
          className="b-light-grey radius-small colour-text-black flex-container flex-justify-spacebetween flex-align-center wrap-child cursor-pointer"
          style={{ height: "50px" }}
        >
          <p class="paragraph padding">{ingredient.name}</p>
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
                      event.shiftKey == false) ||
                    (95 < event.keyCode && event.keyCode < 106) ||
                    event.keyCode == 8 ||
                    event.keyCode == 9 ||
                    (event.keyCode > 34 && event.keyCode < 40) ||
                    event.keyCode == 46
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
            class="material-icons"
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
  );
};
export default SearchInput;
