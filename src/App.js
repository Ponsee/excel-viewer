import React from "react";
import "./App.css";
import XLSX from "xlsx";
import TableView from "./Table";
import { Button } from "@material-ui/core";
// import FileUpload from "./FileUpload";
import { makeStyles } from "@material-ui/core/styles";
import { Paper, Grid, Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {},
  headerAlign: {
    width: "100%",
    height: "10%",
  },
  containerAlign: {
    display: "flex",
    justifyContent: "center",
    margin: "auto",
    flexDirection: "column",
    alignItems: "center",
    minHeight: "80%",
    paddingTop: "20px",
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    // color: theme.palette.text.secondary,
  },
  footerAlign: {
    width: "100%",
    bottom: "0px",
    position: "fixed",
  },
  footerAlignWithData: {
    width: "100%",
    position: "relative",
  },
}));

function App() {
  const [cols, setCols] = React.useState([]);
  const [data, setData] = React.useState(null);
  const [jsonData, setJsonData] = React.useState([]);
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [fileName, setFileName] = React.useState("");

  const getSameRecords = (fData, value, uniqueKey) => {
    return fData.filter((t) => t[uniqueKey] === value[uniqueKey]);
  };

  const getColumns = (data) => {
    const cols = [];
    Object.keys(data).forEach((t, i) => {
      cols.push({
        index: i,
        name: data[t],
        displayName: data[t],
        isEnableSorting: data[t] === "Amount" ? true : false,
      });
    });
    return cols;
  };

  const getFormattedJsonData = (data) => {
    const formattedData = [],
      fileData = [];
    if (Array.isArray(data) && data.length > 0) {
      const columns = Object.keys(data[0]);
      data.forEach((t, i) => {
        if (i > 0) {
          let row = {};
          columns.forEach((r) => {
            if (data[0][r] === "Serial Number" && t[r] === "NA") {
              const previousObj = fileData[fileData.length - 1];
              if (previousObj["Customer Name"] === t["__EMPTY_1"]) {
                row[data[0][r]] = previousObj["Serial Number"];
              } else {
                const nxtObj = data[i + 1];
                if (nxtObj["__EMPTY_1"] === t["__EMPTY_1"])
                  row[data[0][r]] = nxtObj["__EMPTY_2"];
              }
            } else {
              row[data[0][r]] = t[r];
            }
          });
          fileData.push(row);
        }
      });
      const cols = getColumns(data[0]);
      setCols(cols);
    }

    if (Array.isArray(fileData) && fileData.length > 0) {
      fileData.forEach((t) => {
        const findObj = formattedData.find(
          (f) => f["Serial Number"] === t["Serial Number"]
        );
        if (!findObj) {
          const sameRecords = getSameRecords(fileData, t, "Serial Number");
          if (Array.isArray(sameRecords) && sameRecords.length > 0) {
            const amount = sameRecords.reduce(
              (a, b) => parseFloat(a) + (parseFloat(b["Amount"]) || 0),
              0
            );
            const pkName = sameRecords
              .reduce((a, b) => a + `,${b["Package Name"] || ""}`, "")
              .substring(1);
            const index = sameRecords.findIndex(
              (t) =>
                t["VC Number"] !== "NA" &&
                t["Package Name"] !== "NA" &&
                t["Package Type"] !== "NA"
            );
            formattedData.push({
              ...sameRecords[index],
              "S.NO": formattedData.length + 1,
              Amount: parseFloat(amount.toFixed(2)),
              "Package Name": pkName,
            });
          }
        }
      });
    }
    // console.log(fileData);
    // console.log(formattedData)
    return formattedData;
  };

  const click = () => {
    const reader = new FileReader();
    const rABS = !!reader.readAsBinaryString;
    console.log();
    reader.onload = (e) => {
      /* Parse data */
      const bstr = e.target.result;

      const wb = XLSX.read(bstr, {
        type: rABS ? "binary" : "array",
        bookVBA: true,
      });
      /* Get first worksheet */
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      /* Convert array of arrays */
      const jsonData = XLSX.utils.sheet_to_json(ws);
      // const csv = XLSX.utils.sheet_to_csv(ws, { header: 1 });
      // console.log(data)

      // console.log(csv)
      const formattedData = getFormattedJsonData(jsonData);
      if (formattedData.length > 0) {
        setJsonData(formattedData);
      } else {
        console.log("File is empty or sheet data is empty");
      }
    };
    reader.readAsBinaryString(data);
  };

  const handleFleUploadChange = (evt) => {
    let fileObj = evt.target.files[0];
    const name = fileObj && fileObj.name ? fileObj.name : "";
    const fileExt = name.split(".").pop();
    if (name && fileExt === "xlsx") {
      setData(fileObj);
      setFileName(name);
    } else {
      //error
      alert("Pls upload .xlsx file");
    }
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
    if (isAsc) {
      return jsonData.sort((a, b) => a[property] - b[property]);
    }
    return jsonData.sort((a, b) => b[property] - a[property]);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  const classes = useStyles();
  return (
    <>
      <div className={classes.root}>
        <Grid container>
          <header className={classes.headerAlign}>
            <Paper component="h1" className={classes.paper}>
              Excel Viewer
            </Paper>
          </header>

          <Grid item xs={12} className={classes.containerAlign}>
            <a href="https://cloudconvert.com/" target={"_blank"}>
              Convert to xlsx
            </a>
            <input
              type="file"
              id="myFile"
              style={{ color: "black", marginBottom: "15px" }}
              name="filename"
              onChange={(evt) => {
                handleFleUploadChange(evt);
              }}
              accept=".xlsx"
            />
            {data && (
              <Typography>
                <Button
                  color="primary"
                  variant="contained"
                  component="label"
                  style={{ marginRight: "5px" }}
                  onClick={() => click()}
                >
                  {" "}
                  View
                </Button>
                <Button
                  color="primary"
                  variant="contained"
                  component="label"
                  onClick={() => {
                    setData(null);
                    setFileName("");
                    setJsonData([]);
                  }}
                >
                  {" "}
                  clear
                </Button>
              </Typography>
            )}

            {cols && jsonData && cols.length > 0 && jsonData.length > 0 && (
              <>
                <TableView
                  columns={cols}
                  rows={jsonData}
                  order={order}
                  orderBy={orderBy}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  handleChangePage={handleChangePage}
                  handleChangeRowsPerPage={handleChangeRowsPerPage}
                  handleRequestSort={handleRequestSort}
                />
              </>
            )}
            {/* <FileUpload /> */}
          </Grid>
          <footer
            className={
              cols && jsonData && cols.length > 0 && jsonData.length > 0
                ? classes.footerAlignWithData
                : classes.footerAlign
            }
          >
            <Typography className={classes.paper}>
              <span>💻</span> Design and developed by{" "}
              <a
                rel="noopener noreferrer"
                target="_blank"
                href="https://www.linkedin.com/in/ponseelan/"
              >
                Ponseelan
              </a>
              <span>🚀</span>
            </Typography>
          </footer>
        </Grid>
      </div>
    </>
  );
}

export default App;
