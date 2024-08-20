import axios from "axios";

const api = axios.create({ baseURL: import.meta.env.DEV ? "http://localhost:5000/api" : "/api" });

export const getSales = async ({
  interval,
  page = 1,
  limit = 5,
}: {
  interval: "Year" | "Month" | "Day" | "Quarter";
  page?: number;
  limit?: number;
}) => {
  try {
    const res = await api.get("/sales", { params: { ["by" + interval]: true, page, limit } });
    return res.data;
  } catch (error) {
    console.log("error: ", error);
  }
};

export const getSalesGrowthRate = async ({
  interval,
  page = 1,
  limit = 5,
}: {
  interval: "Year" | "Month" | "Day";
  page?: number;
  limit?: number;
}) => {
  try {
    const res = await api.get("/sales", {
      params: { byGrowthRate: true, ["by" + interval]: true, page, limit },
    });
    return res.data;
  } catch (error) {
    console.log("error: ", error);
  }
};

export const getNewCustomersData = async ({
  interval,
  page = 1,
  limit = 5,
}: {
  interval: "Year" | "Month" | "Day";
  page?: number;
  limit?: number;
}) => {
  try {
    const res = await api.get("/customers", {
      params: { ["by" + interval]: true, page, limit },
    });
    return res.data;
  } catch (error) {
    console.log("error: ", error);
  }
};

export const getRepeatedCustomers = async ({
  interval,
  page = 1,
  limit = 5,
}: {
  interval: "Year" | "Month" | "Day";
  page?: number;
  limit?: number;
}) => {
  try {
    const res = await api.get("/customers", {
      params: { repeatedCustomers: true, ["by" + interval]: true, page, limit },
    });
    return res.data;
  } catch (error) {
    console.log("error: ", error);
  }
};
