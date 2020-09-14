import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import Navigation from "../_shared/Navigation";
import {
  IconButton,
  Tooltip,
  InputLabel,
  FormControl,
  makeStyles,
  Chip,
  Avatar, Badge, Input, Slide, useTheme, useMediaQuery
} from "@material-ui/core";
import DoneIcon from '@material-ui/icons/Done';
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import CloseIcon from '@material-ui/icons/Close';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import Paper from '@material-ui/core/Paper';
import EditOutlinedIcon from '@material-ui/icons/EditOutlined';
import Draggable from 'react-draggable';
import {
  catchError401,
  getJwt,
  updateToken,
  isAuthenticated,
} from "../../_helpers/services/auth.service";
import useNotification from "../../_helpers/hooks/useNotification";
import { DebounceInput } from "react-debounce-input";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import useDebounce from "../../_helpers/hooks/useDebounce";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { AvatarGroup } from "@material-ui/lab";
import { Rnd } from "react-rnd";
import authHeader from "../../_helpers/services/auth-header";
import userService from "../../_helpers/services/user.service";

const Week = (props) => {
  const [open, setOpen] = React.useState(false);
  const { addNotification } = useNotification();
  const [mealType, setMealType] = React.useState("breakfast");

  // Meal search
  const [mealSearchQuery, setMealSearchQuery] = React.useState("");
  const [searchedMeals, setSearchedMeals] = React.useState(null);
  const [selectedMeal, setSelectedMeal] = React.useState(null);
  const [mealSearchOffset, setMealSearchOffset] = React.useState(0);
  //const [mealSearchLimit, setMealSearchLimit] = React.useState(2);
  const [gotAllMeals, setGotAllMeals] = React.useState(true);
  const [currentWeekSubtraction, setCurrentWeekSubtraction] = React.useState(0);
  const [people, setPeople] = React.useState([...props.current_user.people.map((value) => ({ ...value, selected: false, current_user: false })), { first_name: props.current_user.firstName, last_name: props.current_user.lastName, current_user: true, selected: true }])
  const [current_user, setCurrent_user] = React.useState(props.current_user);
  let limit = 10;
  const [position, setPosition] = React.useState({
    x: 0, y: 0
  })

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('sm'));


  // Calendar
  const [calendar, setCalendar] = React.useState([
    {
      date: "2020-09-04",
      meal_time: "lunch",
      meal_id: "1",
      meal_title: "Leek and potato soup",
    },
  ]);
  // Temporary calendar
  const [tempCalendarDate, setTempCalendarDate] = React.useState("");
  const [tempCalendarMealTime, setTempCalendarMealTime] = React.useState("");
  const [tempCalendarMealTitle, setTempCalendarMealTitle] = React.useState("");

  const [fetchedMealDetails, setFetchedMealDetails] = React.useState("");
  const [openMealDetails, setOpenMealDetails] = React.useState(false);
  const [openMealIndex, setOpenMealIndex] = React.useState("");

  const [days, setDays] = React.useState([
    { day: "MON" },
    { day: "TUE" },
    { day: "WED" },
    { day: "THU" },
    { day: "FRI" },
    { day: "SAT" },
    { day: "SUN" },
  ]);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setTempCalendarDate("");
    setOpen(false);
  };



  function startOfWeek(date) {
    let diff = date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);

    return new Date(date.setDate(diff));
  }

  Date.prototype.getWeek = function () {
    var date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
    // January 4 is always in week 1.
    var week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return (
      1 +
      Math.round(
        ((date.getTime() - week1.getTime()) / 86400000 -
          3 +
          ((week1.getDay() + 6) % 7)) /
        7
      ) -
      1
    );
  };

  function appendLeadingZeroes(n) {
    if (n <= 9) {
      return "0" + n;
    }
    return n;
  }

  function convertDate(date) {
    return (
      date.getFullYear() +
      "-" +
      appendLeadingZeroes(date.getMonth() + 1) +
      "-" +
      appendLeadingZeroes(date.getDate())
    );
  }

  function convertDate2(date) {
    return (

      appendLeadingZeroes(date.getDate()) +
      "/" +
      appendLeadingZeroes(date.getMonth() + 1) +
      "/" +
      date.getFullYear()

    );
  }



  useEffect(() => {
    let d = new Date();
    d.setDate(d.getDate() - (currentWeekSubtraction * 7));
    setUpWeek(d);
  }, [currentWeekSubtraction]);

  function setUpWeek(d) {
    let start = startOfWeek(d);
    let temp = [...days];
    let tempDate = new Date(start);

    temp[0].date = convertDate(tempDate);
    for (let i = 1; i < 7; i++) {
      tempDate.setDate(tempDate.getDate() + 1);
      temp[i].date = convertDate(tempDate);
    }
    setDays(temp);

    getCalendar(d.getWeek(), d.getFullYear());
  }

  const getCalendar = async (week, year) => {
    const headers = await authHeader();

    fetch(`/api/calendar?week=${week}&year=${year}`, {
      headers: headers,
    })
      .then((response) => {
        catchError401(response.status);

        return response.json();
      })
      .then((value) => {
        setCalendar(value.calendar);
      })
      .catch((err) => { });
  };

  function addMeal(day, event) {

    console.log(event.target);
    const documentElement = document.documentElement;
    const wrapperHeight = (window.innerHeight || documentElement.clientHeight)
    const wrapperWidth = (window.innerWidth || documentElement.clientWidth)
    // const coordX = event.clientX;
    // const coordY = event.clientY;
    const coordX = event.target.offsetLeft;
    const coordY = event.target.offsetHeight;

    let tempX = coordX - 363;
    let tempY = coordY + 150;
    let x = coordX - (wrapperWidth / 2) - (363 / 2);
    let y = coordY - (wrapperHeight / 2) + 150;
    console.log(tempX, wrapperWidth);
    console.log(tempY, wrapperHeight)
    if (tempX < 0 || tempX > wrapperWidth) {
      if (coordX + 363 + event.target.clientWidth > wrapperWidth) {
        x = 0;
      } else {
        x = coordX - (wrapperWidth / 2) + (363 / 2) + event.target.clientWidth;
      }

    }

    if (tempY < 0 || tempY > wrapperHeight) {
      y = 0;
    }
    setX(x);
    setOpen(true);

    setTempCalendarDate(day);
    setTempCalendarMealTime("breakfast");



  }


  async function getMeals(query, offset) {

    userService.getMeals(offset, limit, query)
    .then((value) => {
      //console.log(value);
      if (offset === 0) {
        //console.log("DOING THIS")
        setSearchedMeals(value.map((val) => {
          return { ...val, collapsed: true };
        }));


      } else {
        setSearchedMeals(searchedMeals =>
          searchedMeals.concat(
            value.map((val) => {
              return { ...val, collapsed: true };
            })
          )
        );
      }

      if (value.length < limit) {
        setGotAllMeals(true);
      }

      setMealSearchOffset(mealSearchOffset => mealSearchOffset + limit);

      console.log(offset);
    })
    .catch((err) => {
      console.error(err);
      addNotification("Something went wrong", "error");
    });
  }

  function selectMeal(meal) {
    setTempCalendarMealTitle(meal.title);
    setSelectedMeal(meal);
    setMealSearchQuery("");
    setSearchedMeals(null);
  }

  const debouncedMealSearchQuery = useDebounce(mealSearchQuery, 500);

  // const setupMealSearch = (e) => {
  //   setGotAllMeal(gotAllMeals => false);
  //   setMealSearchQuery(mealSearchQuery => e.target.value);
  //   //setMealSearchOffset(mealSearchOffset => 0);
  //   setSearchedMeals([]);
  //   offset = 0;
  //   getMeals().then(() => { });
  // };

  useEffect((date) => {

    if (debouncedMealSearchQuery.length > 0) {
      setGotAllMeals(gotAllMeals => false);
      setMealSearchQuery(debouncedMealSearchQuery);
      setMealSearchOffset(0);
      setSearchedMeals([]);

      getMeals(debouncedMealSearchQuery, 0).then(() => { });
    }
  }, [debouncedMealSearchQuery])


  async function saveCalendar() {
    let for_current_user = people.some((value) => (value.current_user && value.selected));
    let newPeople = [...people.filter((value) => { if (!value.current_user && value.selected) { return true } }).map((value) => value.people_id)];

    userService.setCalendar(selectedMeal.meal_id, tempCalendarMealTime, tempCalendarDate, for_current_user, newPeople)
      .then((value) => {
        setCalendar(calendar =>
          [...calendar, value.data]
        )
        handleClose();
      })
      .catch((err) => {
        console.error(err);
        addNotification("Something went wrong", "error");
      });
  }

  async function deleteCalendar(calendar_id, index) {
    userService.deleteCalendar(calendar_id)
      .then((value) => {
        calendar.splice(index, 1);
        setOpenMealDetails(false);
        addNotification("Calendar item deleted", "success");

      })
      .catch((err) => {
        console.error(err);
        addNotification("Something went wrong", "error");
      });
  }

  async function getMealDetails(meal_id) {
    userService.getMeal(meal_id)
    .then((value) => {
      setFetchedMealDetails(value);
    })
    .catch((err) => {
      console.error(err);
      addNotification("Something went wrong", "error");
    });
  }

  function filterPeople(people) {
    let newPeople = people.filter((value) => value.selected);
    if (newPeople) {
      return newPeople;
    } else {
      return [];
    }

  }

  function openDetailsDialog(e, meal_id, index) {
    if (e.stopPropagation) {
      e.stopPropagation();   // W3C model
    } else {
      e.cancelBubble = true; // IE model
    } getMealDetails(meal_id).then(() => {
      setOpenMealIndex(index);
      setOpenMealDetails(true);
    })
  }


  const [x, setX] = React.useState(0);
  const [y, setY] = React.useState(0);


  function PaperComponent(props) {
    const [moving, setMoving] = React.useState(false);
    console.log(props)

    return (
      <Draggable cancel={'[class*="MuiDialogContent-root"]'} handle={props.handle} onStart={() => setMoving(true)} onStop={(e, u) => { props.setx(u.x); props.sety(u.y); setMoving(false) }} position={{ x: props.x, y: props.y }}>

        <Paper {...props} style={{ margin: 0, maxWidth: 362 }} />

      </Draggable>

    );
  }


  function dateTitle() {
    if (currentWeekSubtraction === 0) {
      return "This week";
    }
    let d = new Date();
    d.setDate(d.getDate() - (currentWeekSubtraction * 7));
    let d2 = new Date();
    d2.setDate(d.getDate() - (currentWeekSubtraction * 7));

    let startDate = startOfWeek(d);
    let endDate = startOfWeek(d2);
    endDate.setDate(endDate.getDate() + 6);
    return convertDate2(startDate) + " - " + convertDate2(endDate);
  }


  return (
    <div>
      <Helmet>
        <title>Your week</title>
      </Helmet>
      <Navigation current_user={props.current_user} />


      <Dialog
        id="detailsDialog"
        PaperComponent={PaperComponent}
        PaperProps={{
          x: x,
          setx: setX,
          y: y,
          sety: setY,
          handle: "#draggable-dialog-title"
        }}
        position={position}

        open={openMealDetails}
        onClose={() => setOpenMealDetails(false)}
        aria-labelledby="form-dialog-title"
        maxWidth={'xs'}
        fullWidth={true}
      >


        <DialogTitle style={{ padding: "5px", cursor: "move" }} className="flex-container flex-justify-end" id="draggable-dialog-title">
          <IconButton aria-label="close" onClick={() => setOpenMealDetails(false)}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          {calendar[openMealIndex] ? (
            <IconButton aria-label="delete" onClick={() => deleteCalendar(calendar[openMealIndex].calendar_id, openMealIndex)}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          ) : null}
          <IconButton aria-label="close" onClick={() => setOpenMealDetails(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <div className="flex-container flex-column">
            {calendar[openMealIndex] ? (<div style={{
              color:
                calendar[openMealIndex].meal_time === "breakfast"
                  ? "red"
                  : calendar[openMealIndex].meal_time === "lunch"
                    ? "var(--c-primary)"
                    : calendar[openMealIndex].meal_time === "dinner"
                      ? "teal"
                      : "red",

            }}>
              <p>{calendar[openMealIndex].meal_time}</p>
            </div>) : null}
            <div className="flex-container flex-column">
              <p style={{ fontSize: "21px", fontWeight: 400, color: "#3c4043" }}>{fetchedMealDetails.title}</p>
              {calendar[openMealIndex] ? (
                <p style={{ fontSize: "15px", fontWeight: 400, color: "#3c4043" }}>{convertDate2(new Date(calendar[openMealIndex].date))}</p>) : null}

            </div>
            <small className="margin-top">Ingredients</small>
            {fetchedMealDetails.ingredients ? (
              <ul
                style={{ listStylePosition: "inside", marginTop: "5px", fontSize: "15px", color: "#3c4043" }}
              >
                {fetchedMealDetails.ingredients.map((ingredient, index2) => (
                  <li key={index2}>
                    {ingredient.quantity}
                    {ingredient.unit} {ingredient.name}
                  </li>
                ))}

              </ul>) : null}
          </div>

          <div className="flex-container margin-top" style={{ gap: "10px", marginBottom: "10px" }}>
            {calendar[openMealIndex] ? (<div>
              {calendar[openMealIndex].for_current_user ? (
                <Avatar style={{
                  color: "white", backgroundColor:
                    calendar[openMealIndex].meal_time === "breakfast"
                      ? "red"
                      : calendar[openMealIndex].meal_time === "lunch"
                        ? "var(--c-primary)"
                        : calendar[openMealIndex].meal_time === "dinner"
                          ? "teal"
                          : "red",
                }}>{props.current_user.firstName.substring(0, 1) + props.current_user.lastName.substring(0, 1)}</Avatar>

              ) : null}</div>) : null}


            {calendar[openMealIndex] ? (<div className="flex-container" style={{ gap: "10px" }}>
              {calendar[openMealIndex].people.map((value, index) => (
                <Avatar key={index} style={{
                  color: "white", backgroundColor:
                    props.meal_time === "breakfast"
                      ? "red"
                      : props.meal_time === "lunch"
                        ? "var(--c-primary)"
                        : props.meal_time === "dinner"
                          ? "teal"
                          : "red",
                }}>{value.first_name.substring(0, 1) + value.last_name.substring(0, 1)}</Avatar>

              ))}</div>) : null}
          </div>
        </DialogContent>

      </Dialog>

      <Dialog

        PaperComponent={PaperComponent}
        PaperProps={{
          x: x,
          setx: setX,
          y: y,
          sety: setY,
          handle: "#draggable-dialog-title2"
        }}
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
        className='move'
      >
        <DialogTitle style={{ padding: 0 }}>
          <div className="b-light-grey flex-container flex-justify-end " style={{ cursor: "move", padding: "4px" }} id="draggable-dialog-title2">
            <IconButton aria-label="close" onClick={() => setOpen(false)} size="small">
              <CloseIcon fontSize="inherit" />
            </IconButton>
          </div>
          <div className="padding margin-top">Add meal to your week</div>

        </DialogTitle>
        <DialogContent>
          <section className="form-group">
            {selectedMeal ? (
              <div
                className="b-light-grey radius-small colour-text-black flex-container flex-justify-spacebetween flex-align-center wrap-child cursor-pointer"
                style={{ height: "50px" }}
              >
                <p className="paragraph padding">{selectedMeal.title}</p>

                <span
                  className="material-icons"
                  style={{ padding: "0 10px" }}
                  onClick={() => {
                    setSelectedMeal(null);
                  }}
                >
                  delete
                </span>
              </div>
            ) : (
                <div>
                  <InputLabel id="mealSearch">Meal search</InputLabel>
                  <div
                    className="form-input flex-container flex-align-center"
                    style={{ padding: 0 }}
                  >
                    <span
                      className="material-icons"
                      style={{ padding: "0 15px" }}
                    >
                      search
                  </span>

                    <input
                      autoFocus
                      className="form-input"
                      type="text"
                      name="mealSearch"
                      placeholder="Name"
                      onChange={(e) => {
                        setMealSearchQuery(e.target.value);
                      }}
                      value={mealSearchQuery}
                    />
                  </div>

                </div>
              )}

            <div
              className="flex-20 flex-container wrap-container"
              style={{ marginTop: "5px" }}
            >
              {searchedMeals
                ? searchedMeals.map((meal, index) => (
                  <div
                    key={index}
                    className="b-light-grey radius-small colour-text-black flex-container flex-align-center wrap-child cursor-pointer margin-right"
                    style={{ height: "40px" }}
                    onClick={() => {
                      selectMeal(meal);
                    }}
                  >
                    <p className="paragraph padding">{meal.title}</p>
                  </div>
                ))
                : null}

              {!gotAllMeals && !selectedMeal && mealSearchQuery.length > 0 ? (
                <Button
                  style={{
                    borderRadius: 3,
                    textTransform: "capitalize",
                  }}
                  type="submit"
                  variant="contained"
                  color="primary"
                  className="margin-right wrap-child"
                  onClick={() => {
                    getMeals(mealSearchQuery, mealSearchOffset);
                  }}
                >
                  Load more
                </Button>
              ) : null}
            </div>
          </section>

          <section>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker
                disableToolbar
                variant="inline"
                format="dd/MM/yyyy"
                margin="normal"
                id="date-picker-inline"
                label="Date"
                value={tempCalendarDate}
                onChange={(date) => setTempCalendarDate(convertDate(date))}
                KeyboardButtonProps={{
                  'aria-label': 'change date',
                }}
                fullWidth
              />
            </MuiPickersUtilsProvider>
          </section>

          <section className="form-group">
            <InputLabel id="mealType">Meal type</InputLabel>
            <RadioGroup
              aria-label="Meal type"
              name="mealType"
              value={tempCalendarMealTime}
              onChange={(event) => setTempCalendarMealTime(event.target.value)}
            >
              <FormControlLabel
                value="breakfast"
                control={<Radio />}
                label="Breakfast"
              />
              <FormControlLabel
                value="lunch"
                control={<Radio />}
                label="Lunch"
              />
              <FormControlLabel
                value="dinner"
                control={<Radio />}
                label="Dinner"
              />
            </RadioGroup>
          </section>
          <section className="flex-container">

            {people.map((value, index) => (
              <Chip style={{ margin: "5px" }} deleteIcon={value.selected ? <DoneIcon /> : (null)} variant={value.selected ? "default" : "outlined"} color="primary" onDelete={() => { let temp = [...people]; temp[index].selected = !temp[index].selected; setPeople(temp) }} avatar={<Avatar>{value.first_name.substring(0, 1) + value.last_name.substring(0, 1)}</Avatar>} />
            ))}
          </section>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={saveCalendar} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <div className="flex-container flex-justify-center padding-topbottom">
        <div className="flex-10 padding">
          <h1 className="">{dateTitle()}</h1>
          <div className="flex-container flex-justify-end">
            <Tooltip title="Previous week">
              <IconButton color="primary" aria-label="add an alarm" onClick={() => setCurrentWeekSubtraction(currentWeekSubtraction => currentWeekSubtraction + 1)}>
                <ChevronLeftIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Next week">
              <IconButton color="primary" aria-label="add an alarm" onClick={() => setCurrentWeekSubtraction(currentWeekSubtraction => currentWeekSubtraction - 1)}>
                <ChevronRightIcon />
              </IconButton>
            </Tooltip>
          </div>

          {matches ? (
            <div
              className="c-grey"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
                gridAutoRows: "1fr",
                gridGap: "1px",
              }}
            >
              {days.map((day, index) => (
                <div
                  key={index}
                  className="calendar-item cursor-pointer"
                  onClick={(e) => {
                    addMeal(day.date, e);
                  }}
                >
                  <div
                    className="padding-topbottom flex-container flex-align-center fill-width flex-column"
                    style={{ padding: "10px 12px 10px 6px" }}
                  >
                    {day.date === convertDate(new Date()) ? (
                      <small
                        className="b-primary radius-small c-white"
                        style={{ padding: "5px" }}
                      >
                        {day.day}
                      </small>
                    ) : (
                        <small className="margin-bottom">{day.day}</small>
                      )}

                    <div className="flex-container flex-column fill-width">
                      {calendar.map((cal, index) => (<div>
                        {
                          cal.date === day.date && cal.meal_time === "breakfast" ? (
                            <CalendarItem onClick={(e) => { openDetailsDialog(e, cal.meal_id, index) }} key={index} meal_time={cal.meal_time} meal_title={cal.meal_title} people={cal.people} for_current_user={cal.for_current_user} first_name={props.current_user.firstName} last_name={props.current_user.lastName} />) : null
                        }
                      </div>
                      ))}
                      {tempCalendarDate === day.date && tempCalendarMealTime === "breakfast" ? (
                        <CalendarItem meal_time={tempCalendarMealTime} meal_title={tempCalendarMealTitle} people={filterPeople(people)} first_name={props.current_user.firstName} last_name={props.current_user.lastName} for_current_user={false} />
                      ) : null}
                      {calendar.map((cal, index) => (<div>
                        {
                          cal.date === day.date && cal.meal_time === "lunch" ? (
                            <CalendarItem onClick={(e) => { openDetailsDialog(e, cal.meal_id, index) }} key={index} meal_time={cal.meal_time} meal_title={cal.meal_title} people={cal.people} for_current_user={cal.for_current_user} first_name={props.current_user.firstName} last_name={props.current_user.lastName} />) : null
                        }
                      </div>
                      ))}

                      {tempCalendarDate === day.date && tempCalendarMealTime === "lunch" ? (
                        <CalendarItem meal_time={tempCalendarMealTime} meal_title={tempCalendarMealTitle} people={filterPeople(people)} first_name={props.current_user.firstName} last_name={props.current_user.lastName} for_current_user={false} />
                      ) : null}

                      {calendar.map((cal, index) => (<div>
                        {
                          cal.date === day.date && cal.meal_time === "dinner" ? (
                            <CalendarItem onClick={(e) => { openDetailsDialog(e, cal.meal_id, index) }} key={index} meal_time={cal.meal_time} meal_title={cal.meal_title} people={cal.people} for_current_user={cal.for_current_user} first_name={props.current_user.firstName} last_name={props.current_user.lastName} />) : null
                        }
                      </div>
                      ))}

                      {tempCalendarDate === day.date && tempCalendarMealTime === "dinner" ? (
                        <CalendarItem meal_time={tempCalendarMealTime} meal_title={tempCalendarMealTitle} people={filterPeople(people)} first_name={props.current_user.firstName} last_name={props.current_user.lastName} for_current_user={false} />
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
              <div className="flex-container flex-column">
                {days.map((day, index) => (
                  <div
                    key={index}
                    className="calendar-item cursor-pointer"
                    onClick={(e) => {
                      addMeal(day.date, e);
                    }}
                  >
                    <div
                      className="padding-topbottom flex-container flex-align-center fill-width"
                      style={{ padding: "10px 12px 10px 6px" }}
                    >
                      <div className="flex-sm-3">
                        {day.date === convertDate(new Date()) ? (
                          <small
                            className="b-primary radius-small c-white"
                            style={{ padding: "5px", fontSize: "12px" }}
                          >
                            {day.day}
                          </small>
                        ) : (
                            <small className="margin-bottom c-dark-grey" style={{ fontSize: "12px" }}>{day.day}</small>
                          )}
                      </div>
                      <div className="flex-container flex-column fill-width flex-sm-17">
                        {calendar.map((cal, index) => (<div>
                          {
                            cal.date === day.date && cal.meal_time === "breakfast" ? (
                              <CalendarItem onClick={(e) => { openDetailsDialog(e, cal.meal_id, index) }} key={index} meal_time={cal.meal_time} meal_title={cal.meal_title} people={cal.people} for_current_user={cal.for_current_user} first_name={props.current_user.firstName} last_name={props.current_user.lastName} />) : null
                          }
                        </div>
                        ))}
                        {tempCalendarDate === day.date && tempCalendarMealTime === "breakfast" ? (
                          <CalendarItem meal_time={tempCalendarMealTime} meal_title={tempCalendarMealTitle} people={filterPeople(people)} first_name={props.current_user.firstName} last_name={props.current_user.lastName} for_current_user={false} />
                        ) : null}
                        {calendar.map((cal, index) => (<div>
                          {
                            cal.date === day.date && cal.meal_time === "lunch" ? (
                              <CalendarItem onClick={(e) => { openDetailsDialog(e, cal.meal_id, index) }} key={index} meal_time={cal.meal_time} meal_title={cal.meal_title} people={cal.people} for_current_user={cal.for_current_user} first_name={props.current_user.firstName} last_name={props.current_user.lastName} />) : null
                          }
                        </div>
                        ))}

                        {tempCalendarDate === day.date && tempCalendarMealTime === "lunch" ? (
                          <CalendarItem meal_time={tempCalendarMealTime} meal_title={tempCalendarMealTitle} people={filterPeople(people)} first_name={props.current_user.firstName} last_name={props.current_user.lastName} for_current_user={false} />
                        ) : null}

                        {calendar.map((cal, index) => (<div>
                          {
                            cal.date === day.date && cal.meal_time === "dinner" ? (
                              <CalendarItem onClick={(e) => { openDetailsDialog(e, cal.meal_id, index) }} key={index} meal_time={cal.meal_time} meal_title={cal.meal_title} people={cal.people} for_current_user={cal.for_current_user} first_name={props.current_user.firstName} last_name={props.current_user.lastName} />) : null
                          }
                        </div>
                        ))}

                        {tempCalendarDate === day.date && tempCalendarMealTime === "dinner" ? (
                          <CalendarItem meal_time={tempCalendarMealTime} meal_title={tempCalendarMealTitle} people={filterPeople(people)} first_name={props.current_user.firstName} last_name={props.current_user.lastName} for_current_user={false} />
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Week;

function CalendarItem(props) {
  return (

    <div
      onClick={props.onClick}
      className="radius-small c-white flex-container"
      style={{
        pointerEvents: "box-none",
        marginTop: "5px",
        gap: "5px",
        backgroundColor:
          props.meal_time === "breakfast"
            ? "red"
            : props.meal_time === "lunch"
              ? "var(--c-primary)"
              : props.meal_time === "dinner"
                ? "teal"
                : "red",
        width: "100%",
        padding: "3px",
        cursor: "pointer",
        minHeight: "15px",
      }}
    >
      <p>{props.meal_title}</p>


      {props.for_current_user ? (
        <div style={{
          backgroundColor: "white", color:
            props.meal_time === "breakfast"
              ? "red"
              : props.meal_time === "lunch"
                ? "var(--c-primary)"
                : props.meal_time === "dinner"
                  ? "teal"
                  : "red",
          padding: "3px", borderRadius: "10px"
        }}>
          <p>{props.first_name.substring(0, 1) + props.last_name.substring(0, 1)}</p>
        </div>
      ) : null}

      {props.people.map((value, index) => (
        <div key={index} style={{
          backgroundColor: "white", color:
            props.meal_time === "breakfast"
              ? "red"
              : props.meal_time === "lunch"
                ? "var(--c-primary)"
                : props.meal_time === "dinner"
                  ? "teal"
                  : "red",
          padding: "3px", borderRadius: "10px"
        }}>
          <p>{value.first_name.substring(0, 1) + value.last_name.substring(0, 1)}</p>
        </div>
      ))}
    </div>

  )
}