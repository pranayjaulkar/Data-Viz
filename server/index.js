const express = require("express");
const mongoose = require("mongoose");
// const cors = require("cors");
const path = require("path");
const PORT = process.env.PORT;
const DB_CONNECTION_URL = process.env.DB_CONNECTION_URL;

const logger = (req, res, next) => {
  const time = new Date(Date.now());
  console.log(`${time.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })}  ${req.method}  ${req.path}`);
  next();
};

const app = express();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist/")));
//   app.use(cors({ credentials: true }));
} else {
//   app.use(
//     cors({
//       origin: "http://localhost:3000",
//       credentials: true,
//     })
//   );
}

app.use(express.json());
app.use(logger);

mongoose
  .connect(DB_CONNECTION_URL)
  .then(() => console.log("Database Connected"))
  .catch((error) => {
    console.log("MongoDB Connection Error\n", error);
  });

if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}
app.all("*", (req, res, next) => {
  next(new customError("Not Found", 404));
});

app.use((error, req, res, next) => {
  console.log("err: ", error);
  if (!error.statusCode) error.statusCode = 500;
  if (!error.message) error.message = "Something went wrong";
  res.status(error.statusCode).json({ error: error.message });
});

app.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`);
});
