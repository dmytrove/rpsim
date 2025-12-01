"use client"
// @ts-nocheck - Recharts has complex type definitions that don't work well with React.forwardRef

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
>(({ className, ...props }, ref) => (
  <RechartsLine 
    activeDot={{ strokeWidth: 0, r: 6 }} 
    {...props} 
    // @ts-ignore - Ignoring type issues with Recharts ref forwarding
    ref={ref} 
  />
))
Line.displayName = "Line"

export const Bar = (props: any) => <RechartsBar {...props} />
Bar.displayName = "Bar"

export const Pie = (props: any) => <RechartsPie {...props} />
Pie.displayName = "Pie"

export const Area = (props: any) => <RechartsArea {...props} />
Area.displayName = "Area"

export const XAxis = (props: any) => (
  <RechartsXAxis
    axisLine={false}
    tickLine={false}
    tick={{ fill: "hsl(var(--muted-foreground))" }}
    {...props}
  />
)
XAxis.displayName = "XAxis"

export const YAxis = (props: any) => (
  <RechartsYAxis
    axisLine={false}
    tickLine={false}
    tick={{ fill: "hsl(var(--muted-foreground))" }}
    {...props}
  />
)
YAxis.displayName = "YAxis"

export const CartesianGrid = (props: any) => (
  <RechartsCartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" {...props} />
)
CartesianGrid.displayName = "CartesianGrid"

export const Tooltip = (props: any) => (
  <RechartsTooltip
    cursor={{ stroke: "hsl(var(--muted-foreground))" }}
    contentStyle={{
      backgroundColor: "hsl(var(--background))",
      border: "1px solid hsl(var(--border))",
      borderRadius: "var(--radius)",
    }}
    {...props}
  />
)
Tooltip.displayName = "Tooltip"

export const Legend = (props: any) => (
  <RechartsLegend verticalAlign="top" height={36} {...props} />
)
Legend.displayName = "Legend"

export const ReferenceLine = (props: any) => (
  <RechartsReferenceLine stroke="hsl(var(--border))" {...props} />
)
ReferenceLine.displayName = "ReferenceLine"

