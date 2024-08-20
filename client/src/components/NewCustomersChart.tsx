import { useMemo, useState, useEffect, useRef } from "react";
import { getSalesGrowthRate } from "@/actions";
import * as d3 from "d3";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "./ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

type SalesBarChartProps = {
  width?: number;
  height?: number;
  title: string;
};

type Data = { date: string; growthRate: number };

export default function SalesBarChart({ width = 600, height = 400, title }: SalesBarChartProps) {
  const MARGIN = { top: 30, right: 30, bottom: 30, left: 50 };
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;
  const padding = 0.4;

  const [interval, setInterval] = useState<"Year" | "Month" | "Day">("Month");
  const [prevInterval, setPrevInterval] = useState(interval);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Data[]>([]);
  const [noOfPages, setNoOfPages] = useState(1);
  const [extent, setExtent] = useState(d3.extent(data, (d) => d.growthRate));
  const svgRef = useRef(null);

  const xScale = useMemo(() => {
    return d3
      .scalePoint()
      .domain(data.map((d) => d.date))
      .range([0, boundsWidth])
      .padding(padding);
  }, [data, boundsWidth]);

  const yScale = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([extent[1] && extent[1] > 100 ? extent[1] : 100, 0])
      .range([0, boundsHeight / 2]);
  }, [extent, boundsHeight]);

  const yScaleNeg = useMemo(() => {
    return d3
      .scaleLinear()
      .domain([-0, extent[0] && extent[0] < -100 ? extent[0] : -100])
      .range([boundsHeight / 2, boundsHeight]);
  }, [extent, boundsHeight]);

  const linePath = d3
    .line<Data>()
    .x((d) => xScale(d.date)!)
    .y((d) => yScale(d.growthRate))(data);

  // Build the circles
  const allCircles = data.map((d, i) => {
    return (
      <circle
        className="transition-all duration-300"
        key={i}
        cx={xScale(d.date)}
        cy={yScale(d.growthRate)}
        r={4}
        fill="black"
      />
    );
  });

  const grid = (
    <g>
      <g>
        {/* Y axis line */}
        <line x1={0} y1={0} x2={0} y2={height - MARGIN.bottom - MARGIN.top} className="stroke-gray-600" />
        {/* Y axis positive percent */}
        {yScale.ticks(5).map((growthRate, i) => {
          const yScaleValue = yScale(growthRate);
          return (
            <g key={i}>
              {/* Y axis text */}
              <text x={-10} y={yScaleValue} textAnchor="end" alignmentBaseline="central" fontWeight={500} fontSize={12}>
                {`${growthRate}%`}
              </text>
              {/* Grid Line */}
              <line y1={yScaleValue} y2={yScaleValue} x1={0} x2={boundsWidth} className="stroke-gray-300" />
            </g>
          );
        })}
        {/* Y axis negative percent */}
        {yScaleNeg.ticks(5).map((growthRate, i) => {
          const yScaleValue = yScaleNeg(growthRate);
          return (
            <g x={0} y={boundsHeight / 2} key={i}>
              {/* Y axis text */}
              <text x={-10} y={yScaleValue} textAnchor="end" alignmentBaseline="central" fontWeight={500} fontSize={12}>
                {`${growthRate}%`}
              </text>
              {/* Grid Line */}
              <line y1={yScaleValue} y2={yScaleValue} x1={0} x2={boundsWidth} className="stroke-gray-300" />
            </g>
          );
        })}
      </g>
      <g>
        {/* X axis line */}
        <line y1={yScaleNeg(-100)} y2={yScaleNeg(-100)} x1={0} x2={boundsWidth} className="stroke-gray-600" />
        {/* X axis text */}
        {data?.reverse().map((d) => {
          return (
            <text
              key={d.date.toString()}
              x={xScale(d.date)}
              y={yScaleNeg(-100) + 20}
              alignmentBaseline="central"
              textAnchor="middle"
              fontSize={12}
              fontWeight={500}
            >
              {d.date}
            </text>
          );
        })}
      </g>
    </g>
  );

  const handlePrevious = () => {
    if (page < noOfPages) setPage((prev) => prev + 1);
  };

  const handleNext = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  // get Sales when interval changes but set page to 1
  // because page could be set to a higher number of the previous
  // interval pages than the pages available in this current interval
  useEffect(() => {
    if (prevInterval !== interval) {
      getSalesGrowthRate({ interval, page: 1, limit: 6 }).then((result) => {
        setData(result?.data);
        setPage(1);
        setNoOfPages(result.noOfPages);
      });
      setPrevInterval(interval);
    } else
      getSalesGrowthRate({ interval, page, limit: 6 }).then((result) => {
        setData(result?.data);
        setNoOfPages(result.noOfPages);
      });
  }, [interval, page]);

  useEffect(() => {
    setExtent(d3.extent(data, (d) => d.growthRate));
  }, [data]);

  return (
    <div className="w-fit mx-auto p-4 border rounded-md border-gray-300">
      <div style={{ width: width }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-semibold 6">{title}</h2>

          <div className="flex space-x-3 items-center">
            <Select
              onValueChange={(value: string) => {
                setPrevInterval(interval);
                setInterval(value as "Year" | "Month" | "Day");
              }}
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
            <path
              className="transition-all duration-300"
              d={linePath!}
              stroke="black"
              fill="none"
              strokeWidth={1.5}
            ></path>
            {allCircles}
          </g>
        </svg>
      </div>
    </div>
  );
}
