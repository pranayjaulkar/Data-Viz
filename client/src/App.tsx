import "./App.css";
import NewCustomersChart from "./components/NewCustomersChart";
import SalesBarChart from "./components/SalesBarChart";
import SalesGrowthRate from "./components/SalesGrowthRate";

function App() {
  return (
    <div className="grid grid-cols-2 gap-4 p-4 max-w-screen-2xl mx-auto">
      <NewCustomersChart title="New Customers" />
      <SalesBarChart title="Total Sales" />
      <SalesGrowthRate title="Sales Growth Rate" />
    </div>
  );
}

export default App;
