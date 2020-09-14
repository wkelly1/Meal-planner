
import React, { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet";
import useNotification from "../../_helpers/hooks/useNotification";
import { catchError401, getJwt, isAuthenticated, updateToken } from "../../_helpers/services/auth.service";
import Navigation from "../Navigation";
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { IconButton, TablePagination, TableSortLabel, Toolbar, Tooltip, Typography } from "@material-ui/core";
import PrintIcon from '@material-ui/icons/Print';
import ReactToPrint, { useReactToPrint } from 'react-to-print';
import authHeader from "../../_helpers/services/auth-header";
import userService from "../../_helpers/services/user.service";

function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

function ShoppingList(props) {
    const [shoppingList, setShoppingList] = useState([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('name');

    const { addNotification } = useNotification();

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

    useEffect(() => {
        let d = new Date();
        getShoppingList(d.getFullYear(), d.getWeek());
    }, [])

    async function getShoppingList(year, week) {
        return userService.getShoppingList(year, week)
            .then((value) => {
                setShoppingList(value.shopping_list);

            })
            .catch((err) => {
                console.error(err);
                addNotification("Something went wrong", "error");
            });
    }

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, shoppingList.length - page * rowsPerPage);
    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const createSortHandler = (property) => (event) => {
        handleRequestSort(event, property);
    };

    const printComponent = useRef();
    

    return (
        <div>
            <Helmet>
                <title>Your list</title>
            </Helmet>

            <Navigation current_user={props.current_user} />
            <div style={{ display: "none" }}>
                <ComponentToPrint ref={printComponent} rows={shoppingList}/>
            </div>
            <div className="flex-container flex-justify-center margin-top">

                <div className="flex-10 padding">
                    <Paper>
                        <Toolbar className="flex-container flex-justify-spacebetween">
                            <Typography variant="h6" id="tableTitle" component="div">Shopping list</Typography>
                            <ReactToPrint
                                trigger={() => <Tooltip title="Print list">
                                    <IconButton aria-label="Print list">
                                        <PrintIcon />
                                    </IconButton>
                                </Tooltip>}
                                content={() => printComponent.current}
                                copyStyles={true}
                                documentTitle="Shopping list"
                            />

                        </Toolbar>
                        <TableContainer >
                            <Table aria-label="simple table">
                                <TableHead>
                                    <TableRow>

                                        <TableCell align="left">Ingredient</TableCell>
                                        <TableCell align="right">Quantity</TableCell>
                                        <TableCell align="right">Unit</TableCell>

                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {stableSort(shoppingList, getComparator(order, orderBy))
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((row, index) => {
                                            return (
                                                <TableRow key={index}>
                                                    <TableCell component="th" scope="row">
                                                        {row.name}
                                                    </TableCell>
                                                    <TableCell align="right">{row.quantity}</TableCell>
                                                    <TableCell align="right">{row.unit}</TableCell>

                                                </TableRow>
                                            );
                                        })}
                                    {emptyRows > 0 && (
                                        <TableRow style={{ height: 53 * emptyRows }}>
                                            <TableCell colSpan={3} />
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={shoppingList.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onChangePage={handleChangePage}
                            onChangeRowsPerPage={handleChangeRowsPerPage}
                        />
                    </Paper>
                </div>
                {/* {shoppingList.map((value, index) => (
                <p>{value.name}</p>
            ))} */}
            </div>
        </div>
    )
}

export default ShoppingList;

class ComponentToPrint extends React.Component {

    render() {
        return (

            <div className="padding padding-topbottom">
                <div
                    className="flex-container flex-align-center flex-justify-spacebetween b-primary shadow"
                    style={{ height: "60px" }}
                >
                    <div className="flex-container flex-justify-spacebetween flex-align-center fill-height fill-width">
                        
                            <h2 className="c-white margin-right margin-left">Meals</h2>
                            <h2 className="c-white margin-right margin-left">Shopping list</h2>
                    
                    </div>
                </div>

                <TableContainer>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>

                                <TableCell align="left">Ingredient</TableCell>
                                <TableCell align="right">Quantity</TableCell>
                                <TableCell align="right">Unit</TableCell>

                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {this.props.rows
                                .map((row, index) => {
                                    return (
                                        <TableRow key={index}>
                                            <TableCell component="th" scope="row">
                                                {row.name}
                                            </TableCell>
                                            <TableCell align="right">{row.quantity}</TableCell>
                                            <TableCell align="right">{row.unit}</TableCell>

                                        </TableRow>
                                    );
                                })}

                        </TableBody>
                    </Table>
                </TableContainer>
            </div>

        )
    }
}