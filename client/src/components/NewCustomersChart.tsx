import { useMemo, useState, useEffect } from "react";
import { getNewCustomers } from "@/actions";
import * as d3 from "d3";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "./ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

type NewCustomersChartProps = {
  width?: number;
  height?: number;
  title: string;
};

type NewCustomersData = { date: string; totalCustomers: number };

export default function NewCustomersChart({ width = 600, height = 400, title }: NewCustomersChartProps) {
  const MARGIN = { top: 30, right: 30, bottom: 30, left: 30 };
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;
  const PADDING = 0.3;

  const [interval, setInterval] = useState<"Year" | "Month" | "Day">("Month");
  const [loading, setLoading] = useState(false);
  const [disable, setDisable] = useState({ left: false, right: false });
  const [prevInterval, setPrevInterval] = useState(interval);
  const [noOfPages, setNoOfPages] = useState(1);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<NewCustomersData[]>([]);

  const xScale = useMemo(() => {
    return d3
      .scalePoint()
      .domain(data.map((d) => d.date))
      .range([0, boundsWidth])
      .padding(PADDING);
  }, [data, width]);

  const yScale = useMemo(() => {
    const extent = d3.extent(data.map((d) => d.totalCustomers));
    const max = extent[1] && extent[1] > 15 ? extent[1] + 5 : 15;
    return d3.scaleLinear().domain([max, 0]).range([0, boundsHeight]);
  }, [data, height]);

  const linePath = d3
    .line<NewCustomersData>()
    .x((d) => xScale(d.date)!)
    .y((d) => yScale(d.totalCustomers))(data);

  const handlePrevious = () => {
    if (page < noOfPages) setPage((prev) => prev + 1);
  };

  const handleNext = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  useEffect(() => {
    // Get New Customers data when interval changes but set page to 1
    // because page could be set to a higher number of the previous
    // interval pages than the pages available in this current interval
    setLoading(true);
    setDisable({ left: true, right: true });
    if (prevInterval !== interval) {
      getNewCustomers({ interval, page: 1 })
        .then((result) => {
          if (result?.data.length) {
            // reverse the data to display data in ascending order
            setData(result?.data.reverse());
            setNoOfPages(result.noOfPages);
            setLoading(false);
            setDisable({ left: false, right: false });
          } else {
            setData([]);
          }

          setPage(1);
        })
        .catch(() => {
          setLoading(false);
          toast.error("An Unexpected error has occured.");
        });
      setPrevInterval(interval);
    } else {
      getNewCustomers({ interval, page })
        .then((result) => {
          if (result?.data.length) {
            // reverse the data to display data in ascending order
            setData(result?.data.reverse());
            setNoOfPages(result.noOfPages);
            setLoading(false);
            setDisable({ left: false, right: false });
          } else {
            setData([]);
          }
        })
        .catch(() => {
          setLoading(false);
          toast.error("An Unexpected error has occured.");
        });
    }
  }, [interval, page]);

  return (
    <div className="w-fit mx-auto p-4 border rounded-md border-gray-300">
      <div style={{ width: width }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-semibold 6">{title}</h2>

          <div className="flex space-x-3 items-center">
            <Select
              onValueChange={(value: string) => setInterval(value as "Year" | "Month" | "Day")}
              defaultValue="Month"
            >
              <SelectTrigger className="w-[180px] border-gray-300">
                <SelectValue placeholder="Select a Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Year">Year</SelectItem>
                <SelectItem value="Month">Month</SelectItem>
                <SelectItem value="Day">Day</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handlePrevious}
              disabled={page === noOfPages || disable.left}
              className="p-1 h-fit rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Button onClick={handleNext} disabled={page === 1 || disable.right} className="p-1 h-fit rounded-full">
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <svg width={width} height={height}>
          <g width={boundsWidth} height={boundsHeight} transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}>
            <g>
              {/* Y axis line */}
              <line x1={0} y1={0} x2={0} y2={height - MARGIN.bottom - MARGIN.top} className="stroke-gray-600" />

              {/* Y axis text and background grid lines */}
              {yScale.ticks(6).map((totalCustomers, i) => {
                const yScaleValue = yScale(totalCustomers);
                return (
                  <g key={i}>
                    <g>
                      <text
                        x={-10}
                        y={yScaleValue}
                        textAnchor="end"
                        alignmentBaseline="central"
                        fontSize={13}
                        fontWeight={500}
                      >
                        {totalCustomers}
                      </text>
                      <line y1={yScaleValue} y2={yScaleValue} x1={0} x2={boundsWidth} className="stroke-gray-300" />
                    </g>
                  </g>
                );
              })}
              {/* X axis line */}
              <line y1={yScale(0)} y2={yScale(0)} x1={0} x2={boundsWidth} className="stroke-gray-600" />
              {/* X axis text */}
              {data?.map((d) => {
                const date = new Date(d.date);
                let formattedDate = "";

                const month = date.toLocaleString("en-IN", { month: "short" });
                const year = date.getFullYear();
                const day = date.toLocaleString("en-IN", { dateStyle: "medium" });

                if (interval === "Month") formattedDate = month + " " + year;
                else if (interval === "Year") formattedDate = year.toString();
                else if (interval === "Day") formattedDate = day;
                return (
                  <text
                    key={d.date}
                    x={xScale(d.date)! + xScale.bandwidth() / 2}
                    y={yScale(0) + 20}
                    alignmentBaseline="central"
                    textAnchor="middle"
                    fontSize={13}
                    fontWeight={500}
                  >
                    {formattedDate}
                  </text>
                );
              })}
            </g>

            {/* line path */}
            <path
              className="transition-all duration-300"
              d={linePath || ""}
              stroke="black"
              fill="none"
              strokeWidth={1.5}
              opacity={loading ? 0.3 : 1}
            ></path>

            {/* dots */}
            {data.map((d, i) => (
              <circle
                className="transition-all duration-300"
                key={i}
                cx={xScale(d.date)}
                cy={yScale(d.totalCustomers)}
                r={4}
                fill="black"
                opacity={loading ? 0.3 : 1}
              />
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}
