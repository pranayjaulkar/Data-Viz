import { useMemo, useState, useEffect, useRef } from "react";
import { getSales } from "@/actions";
import * as d3 from "d3";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "./ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

type SalesBarChartProps = {
  width?: number;
  height?: number;
  title: string;
};

type SalesByDate = { date: string; totalAmount: number };
const IndianRupee = new Intl.NumberFormat("en-US", { style: "currency", currency: "INR" });

export default function SalesBarChart({ width = 600, height = 400, title }: SalesBarChartProps) {
  const MARGIN = { top: 30, right: 30, bottom: 30, left: 100 };
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;
  const BAR_PADDING = 0.3;

  const [interval, setInterval] = useState<"Year" | "Month" | "Day" | "Quarter">("Month");
  const [prevInterval, setPrevInterval] = useState(interval);
  const [noOfPages, setNoOfPages] = useState(1);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<SalesByDate[]>([]);
  const svgRef = useRef(null);

  const xScale = useMemo(() => {
    return d3
      .scaleBand()
      .domain(data.map((d) => d.date))
      .range([0, boundsWidth])
      .padding(BAR_PADDING);
  }, [data, boundsWidth]);

  const yScale = useMemo(() => {
    const extent = d3.extent(data.map((d) => d.totalAmount));
    const max = extent[1] && extent[1] > 10000 ? extent[1] : 10000;
    return d3.scaleLinear().domain([max, 0]).range([0, boundsHeight]);
  }, [data, boundsHeight]);

  const bars = data.map((d, i) => {
    const y = yScale(d.totalAmount);
    const x = xScale(d.date);

    if (y === undefined) {
      return null;
    }

    return (
      <g key={i}>
        {/* bar */}
        <rect
          x={x}
          y={y}
          width={xScale.bandwidth()}
          height={boundsHeight - y}
          className="fill-gray-950 hover:fill-gray-900 transition-all duration-300"
        />
        {/* total price text */}
        <text
          x={x! + xScale.bandwidth() / 2}
          y={y - 12}
          textAnchor="middle"
          alignmentBaseline="central"
          fontSize={14}
          fontWeight={500}
        >
          {IndianRupee.format(d.totalAmount)}
        </text>
      </g>
    );
  });

  const grid = yScale.ticks(6).map((totalAmount, i) => {
    const yScaleValue = yScale(totalAmount);
    return (
      <g key={i}>
        <g>
          {/* Y axis text/amount in rupees */}
          <text
            x={-10}
            y={yScaleValue}
            textAnchor="end"
            alignmentBaseline="central"
            fontWeight={500}
            className="font-roboto"
            fontSize={13}
          >
            {IndianRupee.format(totalAmount)}
          </text>
          {/* Y axis line */}
          <line x1={0} y1={0} x2={0} y2={height - MARGIN.bottom - MARGIN.top} className="stroke-gray-600" />
          {/* Grid Line */}
          <line y1={yScaleValue} y2={yScaleValue} x1={0} x2={boundsWidth} className="stroke-gray-300" />
        </g>
        <g>
          {/* X axis line */}
          <line y1={yScale(0)} y2={yScale(0)} x1={0} x2={boundsWidth} className="stroke-gray-600" />
          {/* X axis text/dates */}
          {data?.map((d, i) => {
            const date = new Date(d.date);
            let formattedDate = "";

            const month = date.toLocaleString("en-IN", { month: "short" });
            const year = date.getFullYear();
            const day = date.toLocaleString("en-IN", { dateStyle: "medium" });

            if (interval === "Month") formattedDate = month + " " + year;
            else if (interval === "Year") formattedDate = year.toString();
            else if (interval === "Day") formattedDate = day;
            else if (interval === "Quarter") formattedDate = d.date;

            return (
              <text
                key={i}
                x={(xScale(d.date) || 0) + xScale.bandwidth() / 2}
                y={yScale(0) + 20}
                alignmentBaseline="central"
                textAnchor="middle"
                fontSize={13}
                className="font-roboto"
              >
                {formattedDate}
              </text>
            );
          })}
        </g>
      </g>
    );
  });

  const handlePrevious = () => {
    if (page < noOfPages) setPage((prev) => prev + 1);
  };

  const handleNext = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  useEffect(() => {
    // get Sales when interval changes but set page to 1
    // because page could be set to a higher number of the previous
    // interval pages than the pages available in this current interval
    if (prevInterval !== interval) {
      getSales({ interval, page: 1, limit: interval === "Quarter" ? 4 : 5 })
        .then((result) => {
          if (result?.data.length) {
            // reverse the data to display data in ascending order
            setData(result?.data.reverse());
            setNoOfPages(result.noOfPages);
          } else setData([]);
          setPage(1);
        })
        .catch(() => {
          toast.error("An Unexpected error has occured.");
        });
      setPrevInterval(interval);
    } else
      getSales({ interval, page, limit: interval === "Quarter" ? 4 : 5 })
        .then((result) => {
          // reverse the data to display data in ascending order
          if (result?.data.length) {
            setData(result?.data.reverse());
            setNoOfPages(result.noOfPages);
          } else setData([]);
        })
        .catch(() => {
          toast.error("An Unexpected error has occured.");
        });
  }, [interval, page]);

  return (
    <div className="w-fit mx-auto p-4 border rounded-md border-gray-300">
      <div style={{ width: width }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-semibold 6">{title}</h2>

          <div className="flex space-x-3 items-center">
            <Select
              onValueChange={(value: string) => setInterval(value as "Year" | "Month" | "Day" | "Quarter")}
              defaultValue="Month"
            >
              <SelectTrigger className="w-[180px] border-gray-300">
                <SelectValue placeholder="Select a Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Year">Year</SelectItem>
                <SelectItem value="Month">Month</SelectItem>
                <SelectItem value="Day">Day</SelectItem>
                <SelectItem value="Quarter">Quarter</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handlePrevious} className="p-1 h-fit rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Button onClick={handleNext} className="p-1 h-fit rounded-full">
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <svg width={width} height={height}>
          <g
            ref={svgRef}
            width={boundsWidth}
            height={boundsHeight}
            transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
          >
            {grid}
            {bars}
          </g>
        </svg>
      </div>
    </div>
  );
}
