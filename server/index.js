const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const PORT = process.env.PORT;
const DB_CONNECTION_URL = process.env.DB_CONNECTION_URL;
const aggregateSalesByDate = require("./Queries/aggregateSalesByDate");
const aggregateSalesByQuarter = require("./Queries/aggregateSalesByQuarter");
const aggregateSalesByGrowthRate = require("./Queries/aggregateSalesByGrowthRate");
const aggregateNewCustomers = require("./Queries/aggregateNewCustomers");
const aggregateRepeatedCustomers = require("./Queries/aggregateRepeatedCustomers");

let db;

const app = express();

// Request logger
app.use((req, res, next) => {
  const time = new Date(Date.now());
  console.log(`${time.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })}  ${req.method}  ${req.url}`);
  next();
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist/")));
} else {
  app.use(
    require("cors")({
      origin: process.env.FRONTEND_DEV_URL,
    })
  );
}

app.use(express.json());

// Connect to mongoose
mongoose
  .connect(DB_CONNECTION_URL, { dbName: "RQ_Analytics" })
  .then(() => {
    console.log("Database Connected");
    db = mongoose.connection;
  })
  .catch((err) => console.error("Could not connect to MongoDB", err));

// Routes
app.get("/api/sales", async (req, res) => {
  const { byDay, byMonth, byQuarter, byGrowthRate } = req.query;
  const format = byDay ? "%Y-%m-%d" : byMonth ? "%Y-%m" : "%Y";
  let data = [];

  const page = !req.query.page ? 1 : Number(req.query.page) > 0 ? req.query.page : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 10;

  // Aggregate by growth rate
  if (byGrowthRate) {
    const growthRates = [];

    data = await db
      .collection("shopifyOrders")
      // query returns data in descending order i.e 2023-12, 2023-11,..., 2022-1
      // limit parameter limits the no of doucments returned
      .aggregate(aggregateSalesByGrowthRate({ format, limit, page }))
      .toArray();
    // Calculate percentages of each interval
    if (data.length && data[0].groupedDocuments?.length) {
      const groupedDocuments = data[0].groupedDocuments;

      groupedDocuments.forEach((interval, i) => {
        if (i >= groupedDocuments.length - 1) {
          return;
        } else {
          const prevInterval = groupedDocuments[i + 1];
          // calculate current time interval percentage with respect to previous interval.
          const gr = ((interval.totalOrders - prevInterval.totalOrders) / prevInterval.totalOrders) * 100;
          growthRates.push({ date: interval.date, growthRate: gr });
        }
      });
      // finally add growth rate of the first interval zero
      growthRates.push({ date: groupedDocuments[groupedDocuments.length - 1].date, growthRate: 0 });
    }

    if (growthRates?.length)
      return res.json({ data: growthRates, noOfPages: Math.ceil(data[0].countOfTotalDocuments / limit) });
    else return res.json(null);
  } else {
    data = await db
      .collection("shopifyOrders")
      // query returns data in descending order i.e 2023-12, 2023-11,..., 2022-1
      // limit parameter limits the no of doucments returned
      .aggregate(byQuarter ? aggregateSalesByQuarter({ limit, page }) : aggregateSalesByDate({ format, limit, page }))
      .toArray();

    if (data[0]?.groupedDocuments?.length)
      return res.json({ data: data[0].groupedDocuments, noOfPages: Math.ceil(data[0].countOfTotalDocuments / limit) });
    else return res.json(null);
  }
});

app.get("/api/customers", async (req, res) => {
  let data = [];
  const { byMonth, byDay, repeatedCustomers, byLocation } = req.query;
  const format = byDay ? "%Y-%m-%d" : byMonth ? "%Y-%m" : "%Y";

  const page = !req.query.page ? 1 : Number(req.query.page) > 0 ? req.query.page : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 10;

  const aggregateByLocation = [
    {
      $group: {
        _id: "$default_address.city",
        count: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },

    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
  ];
  // Aggregate Repeated Customers by time interval
  if (repeatedCustomers)
    data = await db
      .collection("shopifyOrders")
      // query returns data in descending order i.e 2023-12, 2023-11,..., 2022-1
      // limit parameter limits the no of doucments returned
      .aggregate(aggregateRepeatedCustomers({ format, limit, page }))
      .toArray();
  // Aggregate Customers by location
  else if (byLocation)
    data = await db
      .collection("shopifyCustomers")
      // query returns data in descending order i.e 2023-12, 2023-11,..., 2022-1
      // limit parameter limits the no of doucments returned
      .aggregate(aggregateByLocation)
      .toArray();
  // Aggregate New customers by time interval
  else
    data = await db
      .collection("shopifyCustomers")
      // query returns data in descending order i.e 2023-12, 2023-11,..., 2022-1
      // limit parameter limits the no of doucments returned
      .aggregate(aggregateNewCustomers({ format, limit, page }))
      .toArray();

  if (data[0]?.groupedDocuments?.length)
    return res.json({ data: data[0].groupedDocuments, noOfPages: Math.ceil(data[0].countOfTotalDocuments / limit) });
  else return res.json(null);
});

app.all("*", (req, res, next) => {
  next(new Error("Not found", "404 Not Found"));
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
