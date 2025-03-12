"use client"

import * as React from "react"
import {
  CartesianGrid as RechartsCartesianGrid,
  Legend as RechartsLegend,
  Line as RechartsLine,
  LineChart as RechartsLineChart,
  Pie as RechartsPie,
  PieChart as RechartsPieChart,
  ResponsiveContainer as RechartsResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  BarChart as RechartsBarChart,
  Bar as RechartsBar,
  AreaChart as RechartsAreaChart,
  Area as RechartsArea,
  ReferenceLine as RechartsReferenceLine,
} from "recharts"

// Recharts components with default styling
export const ResponsiveContainer = React.forwardRef<
  React.ElementRef<typeof RechartsResponsiveContainer>,
  React.ComponentPropsWithoutRef<typeof RechartsResponsiveContainer>
>(({ className, ...props }, ref) => <RechartsResponsiveContainer width="100%" height={350} {...props} ref={ref} />)
ResponsiveContainer.displayName = "ResponsiveContainer"

export const LineChart = React.forwardRef<
  React.ElementRef<typeof RechartsLineChart>,
  React.ComponentPropsWithoutRef<typeof RechartsLineChart>
>(({ className, children, ...props }, ref) => (
  <RechartsLineChart {...props} ref={ref}>
    {children}
  </RechartsLineChart>
))
LineChart.displayName = "LineChart"

export const BarChart = React.forwardRef<
  React.ElementRef<typeof RechartsBarChart>,
  React.ComponentPropsWithoutRef<typeof RechartsBarChart>
>(({ className, children, ...props }, ref) => (
  <RechartsBarChart {...props} ref={ref}>
    {children}
  </RechartsBarChart>
))
BarChart.displayName = "BarChart"

export const PieChart = React.forwardRef<
  React.ElementRef<typeof RechartsPieChart>,
  React.ComponentPropsWithoutRef<typeof RechartsPieChart>
>(({ className, children, ...props }, ref) => (
  <RechartsPieChart {...props} ref={ref}>
    {children}
  </RechartsPieChart>
))
PieChart.displayName = "PieChart"

export const AreaChart = React.forwardRef<
  React.ElementRef<typeof RechartsAreaChart>,
  React.ComponentPropsWithoutRef<typeof RechartsAreaChart>
>(({ className, children, ...props }, ref) => (
  <RechartsAreaChart {...props} ref={ref}>
    {children}
  </RechartsAreaChart>
))
AreaChart.displayName = "AreaChart"

export const Line = React.forwardRef<
  React.ElementRef<typeof RechartsLine>,
  React.ComponentPropsWithoutRef<typeof RechartsLine>
>(({ className, ...props }, ref) => <RechartsLine activeDot={{ strokeWidth: 0, r: 6 }} {...props} ref={ref} />)
Line.displayName = "Line"

export const Bar = React.forwardRef<
  React.ElementRef<typeof RechartsBar>,
  React.ComponentPropsWithoutRef<typeof RechartsBar>
>(({ className, ...props }, ref) => <RechartsBar {...props} ref={ref} />)
Bar.displayName = "Bar"

export const Pie = React.forwardRef<
  React.ElementRef<typeof RechartsPie>,
  React.ComponentPropsWithoutRef<typeof RechartsPie>
>(({ className, ...props }, ref) => <RechartsPie {...props} ref={ref} />)
Pie.displayName = "Pie"

export const Area = React.forwardRef<
  React.ElementRef<typeof RechartsArea>,
  React.ComponentPropsWithoutRef<typeof RechartsArea>
>(({ className, ...props }, ref) => <RechartsArea {...props} ref={ref} />)
Area.displayName = "Area"

export const XAxis = React.forwardRef<
  React.ElementRef<typeof RechartsXAxis>,
  React.ComponentPropsWithoutRef<typeof RechartsXAxis>
>(({ className, ...props }, ref) => (
  <RechartsXAxis
    axisLine={false}
    tickLine={false}
    tick={{ fill: "hsl(var(--muted-foreground))" }}
    {...props}
    ref={ref}
  />
))
XAxis.displayName = "XAxis"

export const YAxis = React.forwardRef<
  React.ElementRef<typeof RechartsYAxis>,
  React.ComponentPropsWithoutRef<typeof RechartsYAxis>
>(({ className, ...props }, ref) => (
  <RechartsYAxis
    axisLine={false}
    tickLine={false}
    tick={{ fill: "hsl(var(--muted-foreground))" }}
    {...props}
    ref={ref}
  />
))
YAxis.displayName = "YAxis"

export const CartesianGrid = React.forwardRef<
  React.ElementRef<typeof RechartsCartesianGrid>,
  React.ComponentPropsWithoutRef<typeof RechartsCartesianGrid>
>(({ className, ...props }, ref) => (
  <RechartsCartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" {...props} ref={ref} />
))
CartesianGrid.displayName = "CartesianGrid"

export const Tooltip = React.forwardRef<
  React.ElementRef<typeof RechartsTooltip>,
  React.ComponentPropsWithoutRef<typeof RechartsTooltip>
>(({ className, ...props }, ref) => (
  <RechartsTooltip
    cursor={{ stroke: "hsl(var(--muted-foreground))" }}
    contentStyle={{
      backgroundColor: "hsl(var(--background))",
      border: "1px solid hsl(var(--border))",
      borderRadius: "var(--radius)",
    }}
    {...props}
    ref={ref}
  />
))
Tooltip.displayName = "Tooltip"

export const Legend = React.forwardRef<
  React.ElementRef<typeof RechartsLegend>,
  React.ComponentPropsWithoutRef<typeof RechartsLegend>
>(({ className, ...props }, ref) => <RechartsLegend verticalAlign="top" height={36} {...props} ref={ref} />)
Legend.displayName = "Legend"

export const ReferenceLine = React.forwardRef<
  React.ElementRef<typeof RechartsReferenceLine>,
  React.ComponentPropsWithoutRef<typeof RechartsReferenceLine>
>(({ className, ...props }, ref) => <RechartsReferenceLine stroke="hsl(var(--border))" {...props} ref={ref} />)
ReferenceLine.displayName = "ReferenceLine"

