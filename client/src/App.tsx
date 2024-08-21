import "./App.css";
import NewCustomersChart from "./components/NewCustomersChart";
import SalesBarChart from "./components/SalesBarChart";
import SalesGrowthRateChart from "./components/SalesGrowthRateChart";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster />
      <div className="grid grid-cols-2 gap-8 p-4 max-w-screen-2xl mx-auto">
        <NewCustomersChart title="New Customers" />
        <SalesBarChart title="Total Sales" />
        <SalesGrowthRateChart title="Sales Growth Rate" />
      </div>
    </>
  );
}

export default App;
