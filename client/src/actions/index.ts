import axios from "axios";
import toast from "react-hot-toast";

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
    toast.error("An unexpected error has ocurred");
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
    toast.error("An unexpected error has ocurred");
  }
};

export const getNewCustomers = async ({
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
    toast.error("An unexpected error has ocurred");
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
    toast.error("An unexpected error has ocurred");
  }
};

export const getCustomersByLocation = async ({ page = 1, limit = 5 }: { page?: number; limit?: number }) => {
  try {
    const res = await api.get("/customers", {
      params: { page, limit },
    });
    return res.data;
  } catch (error) {
    console.log("error: ", error);
    toast.error("An unexpected error has ocurred");
  }
};
