import React from 'react';
import './App.css';
import { makeStyles } from '@material-ui/core/styles';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TableSortLabel, TablePagination } from '@material-ui/core';

const useStyles = makeStyles({
	table: {
		minWidth: 700,
	},
	visuallyHidden: {
		border: 0,
		clip: 'rect(0 0 0 0)',
		height: 1,
		margin: -1,
		overflow: 'hidden',
		padding: 0,
		position: 'absolute',
		top: 20,
		width: 1,
	}
});

function ccyFormat(num) {
	return `${num.toFixed(2)}`;
}

function TableView(props) {
	const { order, orderBy, columns, rows, page, rowsPerPage, handleRequestSort, handleChangeRowsPerPage, handleChangePage } = props;
	const classes = useStyles();
	const totalAmount = (jsonData) => {
		return jsonData.map(({ Amount }) => Amount).reduce((sum, i) => sum + i, 0);
	}
	const handleSort = (property) => (event) => {
		handleRequestSort(event, property);
	};

	return (
		<div className="tableContainer">
			<TableContainer component={Paper}>
				<Table className={classes.table} aria-label="spanning table">
					<TableHead>
						<TableRow>
							{Array.isArray(columns) && columns.map(t => {
								if (t.isEnableSorting) {
									return (
										<TableCell
											sortDirection={orderBy === t.name ? order : false}
											className="tableColumn"
										>
											<TableSortLabel
												active={orderBy === t.name}
												direction={orderBy === t.name ? order : 'asc'}
												onClick={handleSort(t.name)}
											>
												{t.displayName}
												{orderBy === t.name ? (
													<span className={classes.visuallyHidden}>
														{order === 'desc' ? 'sorted descending' : 'sorted ascending'}
													</span>
												) : null}
											</TableSortLabel>
										</TableCell>
									)
								}
								return <TableCell>{t.displayName}</TableCell>
							})}
						</TableRow>
					</TableHead>
					<TableBody>
						{Array.isArray(rows) && rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => {
							return <TableRow>
								{
									columns.map(col => {
										const key = col.name;
										return <TableCell>{row[key]}</TableCell>
									})
								}
							</TableRow>
						})}

						<TableRow>
							<TableCell rowSpan={4} />
							<TableCell colSpan={7} align="right" >Total amount</TableCell>
							<TableCell >{ccyFormat(totalAmount(rows))}</TableCell>
						</TableRow>
					</TableBody>
				</Table>
			</TableContainer>
			<TablePagination
				rowsPerPageOptions={[10, 25, 100]}
				component="div"
				count={rows.length}
				rowsPerPage={rowsPerPage}
				page={page}
				onChangePage={handleChangePage}
				onChangeRowsPerPage={handleChangeRowsPerPage}
			/>
		</div>
	)
}

export default TableView;