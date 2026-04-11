"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
  Area,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  BrainCircuit,
  Zap,
  Database,
  Layers,
  Activity,
  TrendingUp,
  Shield,
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Thermometer,
  CloudRain,
  Car,
  Eye,
  Loader2,
  Info,
  Star,
  Trophy,
  Target,
  User,
  Truck,
  MapPin,
  Wrench,
  ChevronDown,
  ChevronUp,
  PieChart as PieChartIcon,
  Flame,
  Calendar,
  Route,
} from "lucide-react";
import { ALL_FEATURE_OPTIONS, ALL_FEATURES } from "@/lib/feature-options";

// ─── Types ──────────────────────────────────────────────────────────

interface SeverityItem {
  name: string;
  value: number;
  color: string;
}

interface PeakHour {
  hour: string;
  count: number;
}

interface DayItem {
  day: string;
  count: number;
}

interface HeatmapItem {
  weather: string;
  severity: string;
  count: number;
}

interface AgeItem {
  age: string;
  severity: string;
  count: number;
}

interface VehicleItem {
  name: string;
  count: number;
}

interface CauseItem {
  name: string;
  count: number;
}

interface EdaData {
  severity_distribution: SeverityItem[];
  peak_hours: PeakHour[];
  day_distribution: DayItem[];
  weather_severity: HeatmapItem[];
  age_severity: AgeItem[];
  vehicle_type_distribution: VehicleItem[];
  cause_distribution: CauseItem[];
  total_records: number;
  total_features: number;
}

interface ClassModel {
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  approach: string;
  rocAuc: number | null;
  confusionMatrix: number[][];
  bestParams: Record<string, unknown> | null;
}

interface RegModel {
  name: string;
  mae: number;
  mse: number;
  rmse: number;
  r2: number;
  approach: string;
  bestParams: Record<string, unknown> | null;
}

interface ModelData {
  classification: ClassModel[];
  regression: RegModel[];
}

// ─── Chart Theme ────────────────────────────────────────────────────

const tooltipStyle: React.CSSProperties = {
  backgroundColor: "oklch(0.16 0.025 260 / 95%)",
  border: "1px solid oklch(0.35 0.02 260 / 60%)",
  borderRadius: "10px",
  color: "#f1f5f9",
  backdropFilter: "blur(12px)",
  boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
};

const axisTickStyle = { fill: "#94a3b8" };

// ─── Helper Components ──────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color, gradient }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: string;
  gradient: string;
}) {
  return (
    <Card className={cn("card-glow border-border/30", gradient)}>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110",
          color === "text-blue-400" && "bg-blue-500/15 text-blue-400",
          color === "text-emerald-400" && "bg-emerald-500/15 text-emerald-400",
          color === "text-red-400" && "bg-red-500/15 text-red-400",
          color === "text-amber-400" && "bg-amber-500/15 text-amber-400",
        )}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className={cn("text-3xl font-bold tracking-tight", color, "animate-count-up")}>{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, description, icon: Icon, accentColor, children }: {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  accentColor?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="glass-subtle card-glow border-border/30 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
              accentColor === "amber" && "bg-amber-500/15 text-amber-400",
              accentColor === "blue" && "bg-blue-500/15 text-blue-400",
              accentColor === "violet" && "bg-violet-500/15 text-violet-400",
              accentColor === "cyan" && "bg-cyan-500/15 text-cyan-400",
              accentColor === "red" && "bg-red-500/15 text-red-400",
              accentColor === "emerald" && "bg-emerald-500/15 text-emerald-400",
              accentColor === "rose" && "bg-rose-500/15 text-rose-400",
              !accentColor && "bg-muted text-muted-foreground",
            )}>
              <Icon className="h-4 w-4" />
            </div>
          )}
          <div>
            <CardTitle className="text-sm font-semibold">{title}</CardTitle>
            {description && <CardDescription className="text-xs mt-0.5">{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

// ─── Confidence Gauge ───────────────────────────────────────────────

function ConfidenceGauge({ value, label, color }: { value: number; label: string; color: string }) {
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center gap-2">
      <svg width="100" height="100" className="-rotate-90">
        <circle cx="50" cy="50" r="40" fill="none" stroke="oklch(0.22 0.02 260)" strokeWidth="8" />
        <circle cx="50" cy="50" r="40" fill="none" className={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }} />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: 100, height: 100, marginTop: 0 }}>
        <span className="text-xl font-bold">{value.toFixed(0)}%</span>
        <span className="text-[10px] text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

// ─── Weather Heatmap ───────────────────────────────────────────────

function WeatherHeatmapChart({ data }: { data: HeatmapItem[] }) {
  const weathers = [...new Set(data.map((d) => d.weather))];
  const severities = ["Fatal injury", "Serious Injury", "Slight Injury"];
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const getColor = (count: number) => {
    const ratio = count / maxCount;
    if (ratio > 0.7) return "bg-red-500/70 text-red-100";
    if (ratio > 0.4) return "bg-amber-500/60 text-amber-100";
    if (ratio > 0.15) return "bg-yellow-500/40 text-yellow-200";
    return "bg-green-500/30 text-green-200";
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left py-2.5 px-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">
              Weather
            </th>
            {severities.map((s) => (
              <th
                key={s}
                className="text-center py-2.5 px-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider"
              >
                {s}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weathers.map((w) => (
            <tr key={w} className="border-t border-border/20 transition-colors hover:bg-muted/30">
              <td className="py-2.5 px-3 text-sm font-medium">{w}</td>
              {severities.map((s) => {
                const item = data.find(
                  (d) => d.weather === w && d.severity === s
                );
                const count = item?.count || 0;
                return (
                  <td key={s} className="py-2 px-1.5">
                    <div
                      className={`rounded-lg px-3 py-1.5 text-center text-xs font-semibold transition-transform hover:scale-105 ${getColor(count)}`}
                    >
                      {count.toLocaleString()}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Age Severity Chart ────────────────────────────────────────────

function AgeSeverityChart({ data }: { data: AgeItem[] }) {
  const ages = [...new Set(data.map((d) => d.age))];
  const severities = ["Fatal injury", "Serious Injury", "Slight Injury"];
  const severityColors: Record<string, string> = {
    "Fatal injury": "#ef4444",
    "Serious Injury": "#f59e0b",
    "Slight Injury": "#22c55e",
  };

  const chartData = ages.map((age) => {
    const row: Record<string, string | number> = { age };
    for (const s of severities) {
      const item = data.find((d) => d.age === age && d.severity === s);
      row[s] = item?.count || 0;
    }
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
        <XAxis dataKey="age" tick={{ fill: "#94a3b8" }} />
        <YAxis tick={{ fill: "#94a3b8" }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
        {severities.map((s) => (
          <Bar
            key={s}
            dataKey={s}
            fill={severityColors[s]}
            radius={[4, 4, 0, 0]}
            stackId="a"
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Dashboard Skeleton ────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Hero skeleton */}
      <Skeleton className="h-32 w-full rounded-2xl skeleton-shimmer" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border/30">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-xl skeleton-shimmer" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-24 skeleton-shimmer" />
                  <Skeleton className="h-3 w-20 skeleton-shimmer" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border/30">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-8 w-8 rounded-lg skeleton-shimmer" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-40 skeleton-shimmer" />
                  <Skeleton className="h-3 w-28 skeleton-shimmer" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full rounded-md skeleton-shimmer" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ─── Model Skeleton ────────────────────────────────────────────────

function ModelSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-3">
        <Skeleton className="h-10 w-48 rounded-full skeleton-shimmer" />
        <Skeleton className="h-10 w-48 rounded-full skeleton-shimmer" />
      </div>
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-border/30">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-8 w-8 rounded-lg skeleton-shimmer" />
              <Skeleton className="h-4 w-48 skeleton-shimmer" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full rounded-md skeleton-shimmer" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Predictor Skeleton ────────────────────────────────────────────

function PredictorSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-border/30">
        <CardHeader>
          <Skeleton className="h-5 w-48 skeleton-shimmer" />
          <Skeleton className="h-4 w-32 skeleton-shimmer" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <Skeleton className="h-4 w-32 mb-3 skeleton-shimmer" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-4">
                {[1, 2].map((j) => (
                  <div key={j} className="space-y-1.5">
                    <Skeleton className="h-3 w-24 skeleton-shimmer" />
                    <Skeleton className="h-9 w-full rounded-md skeleton-shimmer" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="border-border/30 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-20">
          <Skeleton className="h-14 w-14 rounded-full skeleton-shimmer mb-4" />
          <Skeleton className="h-4 w-32 skeleton-shimmer" />
          <Skeleton className="h-3 w-48 mt-2 skeleton-shimmer" />
        </CardContent>
      </Card>
    </div>
  );
}

// ─── 1. DASHBOARD TAB ─────────────────────────────────────────────

function DashboardTab() {
  const [edaData, setEdaData] = useState<EdaData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/eda-data")
      .then((r) => r.json())
      .then((data) => {
        setEdaData(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (!edaData)
    return (
      <div className="text-center py-10 text-red-400">
        Failed to load EDA data. Make sure the ML service data files exist.
      </div>
    );

  const fatalCount =
    edaData.severity_distribution.find((s) => s.name === "Fatal injury")
      ?.value || 0;
  const seriousCount =
    edaData.severity_distribution.find((s) => s.name === "Serious Injury")
      ?.value || 0;

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-2xl mesh-gradient border border-border/30 p-6 sm:p-8 mb-6 animate-fade-in-up">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-primary text-xs font-medium mb-2">
            <Activity className="h-3.5 w-3.5" />
            <span>EXPLORATORY DATA ANALYSIS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Accident Analytics Dashboard
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-xl">
            Comprehensive analysis of {edaData.total_records.toLocaleString()} road accident records across India. Explore patterns by time, weather, location, and driver demographics.
          </p>
        </div>
      </section>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard
          icon={Database}
          label="Total Records"
          value={edaData.total_records.toLocaleString()}
          color="text-blue-400"
          gradient="stat-gradient-blue"
        />
        <StatCard
          icon={Layers}
          label="Features"
          value={edaData.total_features}
          color="text-emerald-400"
          gradient="stat-gradient-emerald"
        />
        <StatCard
          icon={AlertTriangle}
          label="Fatal Accidents"
          value={fatalCount.toLocaleString()}
          color="text-red-400"
          gradient="stat-gradient-red"
        />
        <StatCard
          icon={Users}
          label="Serious Injuries"
          value={seriousCount.toLocaleString()}
          color="text-amber-400"
          gradient="stat-gradient-amber"
        />
      </div>

      {/* Row 1: Severity Pie + Peak Hours Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Accident Severity Distribution"
          description="Class imbalance visualization"
          icon={PieChartIcon}
          accentColor="red"
        >
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={edaData.severity_distribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                innerRadius={60}
                paddingAngle={2}
                label={({ name, percent }: { name: string; percent: number }) =>
                  `${name} ${(percent * 100).toFixed(1)}%`
                }
              >
                {edaData.severity_distribution.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Peak Accident Hours"
          description="Accidents by hour of day"
          icon={Clock}
          accentColor="amber"
        >
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={edaData.peak_hours}>
              <defs>
                <linearGradient id="hourGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="hour" tick={{ fill: "#94a3b8", fontSize: 11 }} interval={1} angle={-45} textAnchor="end" height={60} />
              <YAxis tick={{ fill: "#94a3b8" }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} fill="url(#hourGradient)" name="Accidents" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2: Day Distribution + Weather Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Accidents by Day of Week"
          description="Weekly distribution pattern"
          icon={Calendar}
          accentColor="violet"
        >
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={edaData.day_distribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis dataKey="day" tick={axisTickStyle} />
              <YAxis tick={axisTickStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar
                dataKey="count"
                fill="#a78bfa"
                radius={[4, 4, 0, 0]}
                name="Accidents"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Weather vs Severity Heatmap"
          description="Cross-tabulation of weather conditions and severity"
          icon={CloudRain}
          accentColor="blue"
        >
          <WeatherHeatmapChart data={edaData.weather_severity} />
        </ChartCard>
      </div>

      {/* Row 3: Vehicle Type + Top Causes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Vehicle Types Involved"
          description="Distribution by vehicle type"
          icon={Car}
          accentColor="cyan"
        >
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={edaData.vehicle_type_distribution}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis type="number" tick={axisTickStyle} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ ...axisTickStyle, fontSize: 11 }}
                width={130}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar
                dataKey="count"
                fill="#06b6d4"
                radius={[0, 4, 4, 0]}
                name="Accidents"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Top 10 Causes of Accidents"
          description="Leading accident causes"
          icon={Flame}
          accentColor="rose"
        >
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={edaData.cause_distribution}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis type="number" tick={axisTickStyle} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ ...axisTickStyle, fontSize: 11 }}
                width={200}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar
                dataKey="count"
                fill="#f87171"
                radius={[0, 4, 4, 0]}
                name="Accidents"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 4: Age vs Severity */}
      <ChartCard
        title="Driver Age vs Accident Severity"
        description="Age group breakdown by severity"
        icon={Users}
        accentColor="emerald"
      >
        <AgeSeverityChart data={edaData.age_severity} />
      </ChartCard>
    </div>
  );
}

// ─── 2. CLASSIFICATION MODELS ──────────────────────────────────────

function ClassificationModels({ data }: { data: ClassModel[] }) {
  const [approachFilter, setApproachFilter] = useState<string>("all");

  const approaches = ["all", "base", "smote", "smote_xgboost", "tuned_smote"];
  const approachLabels: Record<string, string> = {
    all: "All Models",
    base: "Base Only",
    smote: "SMOTE Only",
    smote_xgboost: "SMOTE XGBoost",
    tuned_smote: "Tuned",
  };

  const filtered =
    approachFilter === "all"
      ? data
      : data.filter((m) => m.approach === approachFilter);

  // Find best model by f1Score
  const bestModel = [...data].sort((a, b) => b.f1Score - a.f1Score)[0];

  // Bar chart data for F1 comparison
  const f1ChartData = filtered.map((m) => ({
    name: m.name.length > 22 ? m.name.slice(0, 20) + "…" : m.name,
    fullName: m.name,
    F1: +(m.f1Score * 100).toFixed(1),
    Accuracy: +(m.accuracy * 100).toFixed(1),
    Precision: +(m.precision * 100).toFixed(1),
    Recall: +(m.recall * 100).toFixed(1),
  }));

  // Radar chart data for top 4 models
  const topModels = [...data].sort((a, b) => b.f1Score - a.f1Score).slice(0, 4);
  const radarData = ["F1", "Accuracy", "Precision", "Recall"].map((metric) => {
    const row: Record<string, string | number> = { metric };
    topModels.forEach((m) => {
      row[m.name.length > 18 ? m.name.slice(0, 16) + "…" : m.name] =
        +((m as Record<string, unknown>)[metric.toLowerCase() === "f1" ? "f1Score" : metric.toLowerCase()] as number * 100).toFixed(1);
    });
    return row;
  });
  const radarColors = ["#22c55e", "#06b6d4", "#f59e0b", "#a78bfa"];

  // Confusion matrix of the best model
  const cm = bestModel.confusionMatrix;
  const classNames = ["Fatal injury", "Serious Injury", "Slight Injury"];

  return (
    <div className="space-y-6">
      {/* Filter Buttons - Pill Style */}
      <div className="flex flex-wrap items-center gap-2 justify-center">
        {approaches.map((a) => (
          <button
            key={a}
            onClick={() => setApproachFilter(a)}
            className={cn(
              "tab-pill",
              approachFilter === a ? "tab-pill-active" : "tab-pill-inactive"
            )}
          >
            {approachLabels[a]}
          </button>
        ))}
      </div>

      {/* Best Model Highlight */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground">{bestModel.name}</p>
              <Badge variant="default" className="text-[10px] bg-primary text-primary-foreground">
                BEST
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              F1: {(bestModel.f1Score * 100).toFixed(1)}% &middot; Accuracy:{" "}
              {(bestModel.accuracy * 100).toFixed(1)}% &middot; Approach:{" "}
              {bestModel.approach.toUpperCase()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Radar Chart + F1 Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart - Top 4 Models */}
        <ChartCard
          title="Top 4 Models — Radar Comparison"
          description="Multi-metric overview"
          icon={Target}
          accentColor="violet"
        >
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={100}>
              <PolarGrid stroke="#334155" opacity={0.4} />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <PolarRadiusAxis tick={{ fill: "#64748b", fontSize: 10 }} domain={[0, 100]} />
              {topModels.map((m, i) => (
                <Radar
                  key={m.name}
                  name={m.name.length > 18 ? m.name.slice(0, 16) + "…" : m.name}
                  dataKey={m.name.length > 18 ? m.name.slice(0, 16) + "…" : m.name}
                  stroke={radarColors[i]}
                  fill={radarColors[i]}
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              ))}
              <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 10 }} />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* F1 Score Comparison Chart - takes 2 cols */}
        <ChartCard
          title="Classification Model Comparison"
          description="F1-Score, Accuracy, Precision & Recall (%)"
          icon={BarChart3}
          accentColor="emerald"
          className="lg:col-span-2"
        >
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={f1ChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
              <XAxis type="number" tick={axisTickStyle} domain={[0, 100]} />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ ...axisTickStyle, fontSize: 11 }}
                width={160}
              />
              <Tooltip contentStyle={tooltipStyle} formatter={(val: number) => `${val}%`} />
              <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
              <Bar dataKey="F1" fill="#22c55e" radius={[0, 3, 3, 0]} />
              <Bar dataKey="Accuracy" fill="#06b6d4" radius={[0, 3, 3, 0]} />
              <Bar dataKey="Precision" fill="#f59e0b" radius={[0, 3, 3, 0]} />
              <Bar dataKey="Recall" fill="#a78bfa" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Metrics Table */}
      <Card className="glass-subtle border-border/30">
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">Detailed Metrics</CardTitle>
              <CardDescription>Showing {filtered.length} model(s)</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">Model</th>
                  <th className="text-center py-3 px-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">Approach</th>
                  <th className="text-center py-3 px-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">Accuracy</th>
                  <th className="text-center py-3 px-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">Precision</th>
                  <th className="text-center py-3 px-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">Recall</th>
                  <th className="text-center py-3 px-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">F1</th>
                  <th className="text-center py-3 px-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">ROC-AUC</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((model) => {
                  const isBest = model.name === bestModel.name;
                  return (
                    <tr
                      key={model.name}
                      className={cn("border-b border-border/20 transition-colors hover:bg-muted/20", isBest && "bg-primary/5")}
                    >
                      <td className="py-3 px-3 font-medium flex items-center gap-1.5">
                        {isBest && (
                          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        )}
                        <span className={isBest ? "text-primary" : ""}>
                          {model.name}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge variant="outline" className="text-[10px] font-normal">
                          {model.approach}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-center">{(model.accuracy * 100).toFixed(1)}%</td>
                      <td className="py-3 px-3 text-center">{(model.precision * 100).toFixed(1)}%</td>
                      <td className="py-3 px-3 text-center">{(model.recall * 100).toFixed(1)}%</td>
                      <td className="py-3 px-3 text-center font-semibold">{(model.f1Score * 100).toFixed(1)}%</td>
                      <td className="py-3 px-3 text-center text-muted-foreground">
                        {model.rocAuc ? (model.rocAuc * 100).toFixed(1) + "%" : "N/A"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Confusion Matrix */}
      <ChartCard
        title={`Confusion Matrix — ${bestModel.name}`}
        description="Predicted vs Actual severity classes"
        icon={ShieldAlert}
        accentColor="red"
      >
        <div className="max-w-md mx-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="p-3" />
                <th colSpan={3} className="text-center p-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                  Predicted
                </th>
              </tr>
              <tr>
                <th className="p-2" />
                {classNames.map((c) => (
                  <th key={c} className="text-center p-2 text-xs text-muted-foreground font-medium">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classNames.map((actual, rowIdx) => (
                <tr key={actual}>
                  <td className="p-2 text-xs text-muted-foreground font-medium text-right">{actual}</td>
                  {cm[rowIdx].map((val, colIdx) => {
                    const maxVal = Math.max(...cm.flat());
                    const intensity = val / maxVal;
                    return (
                      <td key={colIdx} className="p-2">
                        <div
                          className={cn(
                            "rounded-lg px-3 py-2 text-center text-sm font-semibold transition-transform hover:scale-105",
                            rowIdx === colIdx
                              ? "bg-emerald-500/30 text-emerald-300"
                              : intensity > 0.5
                                ? "bg-red-500/20 text-red-300"
                                : "bg-muted text-muted-foreground"
                          )}
                        >
                          {val}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Diagonal values (green) = correct predictions
          </p>
        </div>
      </ChartCard>
    </div>
  );
}

// ─── 3. REGRESSION MODELS ──────────────────────────────────────────

function RegressionModels({ data }: { data: RegModel[] }) {
  const bestModel = [...data].sort((a, b) => b.r2 - a.r2)[0];

  const r2Data = data.map((m) => ({
    name: m.name.length > 25 ? m.name.slice(0, 23) + "…" : m.name,
    fullName: m.name,
    R2: +(m.r2 * 100).toFixed(1),
  }));

  const maeData = data.map((m) => ({
    name: m.name.length > 25 ? m.name.slice(0, 23) + "…" : m.name,
    fullName: m.name,
    MAE: +m.mae.toFixed(4),
    RMSE: +m.rmse.toFixed(4),
  }));

  return (
    <div className="space-y-6">
      {/* Best Model */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground">{bestModel.name}</p>
              <Badge variant="default" className="text-[10px] bg-primary text-primary-foreground">
                BEST R²
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              R²: {bestModel.r2.toFixed(4)} &middot; MAE:{" "}
              {bestModel.mae.toFixed(4)} &middot; RMSE:{" "}
              {bestModel.rmse.toFixed(4)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* R² Chart */}
      <ChartCard
        title="R² Score Comparison"
        description="Coefficient of determination across models"
        icon={TrendingUp}
        accentColor="emerald"
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={r2Data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis dataKey="name" tick={{ ...axisTickStyle, fontSize: 11 }} />
            <YAxis tick={axisTickStyle} domain={[0, "auto"]} />
            <Tooltip contentStyle={tooltipStyle} formatter={(val: number) => `${val}%`} />
            <Bar dataKey="R2" fill="#22c55e" radius={[4, 4, 0, 0]} name="R²" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* MAE / RMSE Chart */}
      <ChartCard
        title="Error Metrics Comparison"
        description="Mean Absolute Error & Root Mean Squared Error"
        icon={AlertTriangle}
        accentColor="red"
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={maeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis dataKey="name" tick={{ ...axisTickStyle, fontSize: 11 }} />
            <YAxis tick={axisTickStyle} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
            <Bar dataKey="MAE" fill="#f59e0b" radius={[4, 4, 0, 0]} name="MAE" />
            <Bar dataKey="RMSE" fill="#ef4444" radius={[4, 4, 0, 0]} name="RMSE" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Metrics Table */}
      <Card className="glass-subtle border-border/30">
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">Detailed Metrics</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">Model</th>
                  <th className="text-center py-3 px-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">Approach</th>
                  <th className="text-center py-3 px-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">MAE</th>
                  <th className="text-center py-3 px-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">RMSE</th>
                  <th className="text-center py-3 px-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider">R²</th>
                </tr>
              </thead>
              <tbody>
                {data.map((model) => {
                  const isBest = model.name === bestModel.name;
                  return (
                    <tr
                      key={model.name}
                      className={cn("border-b border-border/20 transition-colors hover:bg-muted/20", isBest && "bg-primary/5")}
                    >
                      <td className="py-3 px-3 font-medium flex items-center gap-1.5">
                        {isBest && (
                          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        )}
                        <span className={isBest ? "text-primary" : ""}>
                          {model.name}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge variant="outline" className="text-[10px] font-normal">
                          {model.approach}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-center">{model.mae.toFixed(4)}</td>
                      <td className="py-3 px-3 text-center">{model.rmse.toFixed(4)}</td>
                      <td className="py-3 px-3 text-center font-semibold">{model.r2.toFixed(4)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── 4. MODEL PLAYGROUND TAB ───────────────────────────────────────

function ModelPlaygroundTab() {
  const [modelData, setModelData] = useState<ModelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<"classification" | "regression">("classification");

  useEffect(() => {
    fetch("/api/model-comparison")
      .then((r) => r.json())
      .then((data) => {
        setModelData(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  if (loading) return <ModelSkeleton />;
  if (!modelData)
    return (
      <div className="text-center py-10 text-red-400">
        Failed to load model data
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Task Toggle - Pill Style */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setActiveTask("classification")}
          className={cn(
            "tab-pill flex items-center gap-2",
            activeTask === "classification" ? "tab-pill-active" : "tab-pill-inactive"
          )}
        >
          <Target className="h-4 w-4" />
          Classification (Severity)
        </button>
        <button
          onClick={() => setActiveTask("regression")}
          className={cn(
            "tab-pill flex items-center gap-2",
            activeTask === "regression" ? "tab-pill-active" : "tab-pill-inactive"
          )}
        >
          <TrendingUp className="h-4 w-4" />
          Regression (Casualties)
        </button>
      </div>

      {activeTask === "classification" ? (
        <ClassificationModels data={modelData.classification} />
      ) : (
        <RegressionModels data={modelData.regression} />
      )}
    </div>
  );
}

// ─── 5. SEVERITY RESULT ────────────────────────────────────────────

function SeverityResult({
  data,
}: {
  data: {
    severity: string;
    confidence: number;
    probabilities: Record<string, number> | null;
    model: string;
  };
}) {
  const severityColorMap: Record<string, string> = {
    "Slight Injury": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    "Serious Injury": "bg-amber-500/20 text-amber-400 border-amber-500/30",
    "Fatal injury": "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const severityGlowMap: Record<string, string> = {
    "Slight Injury": "glow-emerald",
    "Serious Injury": "glow-amber",
    "Fatal injury": "glow-red",
  };

  const probBarColor: Record<string, string> = {
    "Slight Injury": "bg-emerald-500",
    "Serious Injury": "bg-amber-500",
    "Fatal injury": "bg-red-500",
  };

  const colorClass = severityColorMap[data.severity] || "bg-muted text-muted-foreground border-border";
  const glowClass = severityGlowMap[data.severity] || "";

  const confidenceValue = data.confidence != null ? +(data.confidence * 100).toFixed(1) : 0;

  return (
    <div className="space-y-5">
      {/* Predicted Severity Badge + Confidence Gauge */}
      <div className="flex flex-col items-center gap-4 py-4">
        <div className={cn(
          "inline-flex items-center gap-3 rounded-2xl border-2 px-7 py-4 text-xl font-bold transition-all duration-500",
          colorClass,
          glowClass,
        )}>
          <ShieldAlert className="h-7 w-7" />
          {data.severity}
        </div>
        <div className="flex items-center gap-6">
          <ConfidenceGauge
            value={confidenceValue}
            label="Confidence"
            color={
              data.severity === "Fatal injury" ? "stroke-red-500" :
              data.severity === "Serious Injury" ? "stroke-amber-500" :
              "stroke-emerald-500"
            }
          />
        </div>
      </div>

      {/* Probability Bars */}
      {data.probabilities && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            Class Probabilities
          </p>
          {Object.entries(data.probabilities)
            .sort(([, a], [, b]) => b - a)
            .map(([cls, prob]) => (
              <div key={cls} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{cls}</span>
                  <span className="font-semibold">
                    {(prob * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all duration-1000 ease-out", probBarColor[cls] || "bg-primary")}
                    style={{ width: `${Math.max(prob * 100, 1)}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      )}

      <Separator />
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Info className="h-3.5 w-3.5" />
        Model: {data.model}
      </div>
    </div>
  );
}

// ─── 6. CASUALTY RESULT ────────────────────────────────────────────

function CasualtyResult({
  data,
}: {
  data: {
    predicted_casualties: number;
    predicted_casualties_float: number;
    model: string;
  };
}) {
  const count = data.predicted_casualties;
  const color =
    count === 0
      ? "text-emerald-400"
      : count <= 2
        ? "text-amber-400"
        : "text-red-400";
  const bg =
    count === 0
      ? "bg-emerald-500/20 border-emerald-500/30"
      : count <= 2
        ? "bg-amber-500/20 border-amber-500/30"
        : "bg-red-500/20 border-red-500/30";
  const glow =
    count === 0
      ? "glow-emerald"
      : count <= 2
        ? "glow-amber"
        : "glow-red";

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-4 py-4">
        <div className={cn(
          "inline-flex items-center gap-3 rounded-2xl border-2 px-7 py-5 transition-all duration-500",
          bg,
          glow,
        )}>
          <Users className={cn("h-8 w-8", color)} />
          <span className={cn("text-5xl font-bold animate-count-up", color)}>
            {count}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          Predicted casualties (exact:{" "}
          <span className="font-medium text-foreground">
            {data.predicted_casualties_float}
          </span>
          )
        </p>
        {/* Person icons for visual representation */}
        <div className="flex items-center gap-1 mt-2">
          {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
            <Users key={i} className={cn("h-4 w-4", color)} />
          ))}
          {count > 5 && (
            <span className="text-xs text-muted-foreground ml-1">+{count - 5}</span>
          )}
        </div>
      </div>

      {/* Visual indicator bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0 (No casualties)</span>
          <span>1-2 (Minor)</span>
          <span>3+ (Major)</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden flex">
          <div className="bg-emerald-500 flex-[1]" />
          <div className="bg-amber-500 flex-[1]" />
          <div className="bg-red-500 flex-[1]" />
        </div>
        <div className="relative h-2">
          <div
            className="absolute top-0 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-l-transparent border-r-transparent border-b-foreground transition-all duration-500"
            style={{
              left: `${Math.min(Math.max(count / 5 * 100, 2), 98)}%`,
            }}
          />
        </div>
      </div>

      <Separator />
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Info className="h-3.5 w-3.5" />
        Model: {data.model}
      </div>
    </div>
  );
}

// ─── Feature Section Groups ────────────────────────────────────────

const fieldGroups = [
  {
    title: "Driver Information",
    icon: User,
    color: "text-blue-400",
    borderColor: "border-l-blue-400",
    bgColor: "bg-blue-500/15 text-blue-400",
    fields: ["Day_of_week", "Age_band_of_driver", "Sex_of_driver", "Educational_level", "Vehicle_driver_relation", "Driving_experience"],
  },
  {
    title: "Vehicle Details",
    icon: Truck,
    color: "text-emerald-400",
    borderColor: "border-l-emerald-400",
    bgColor: "bg-emerald-500/15 text-emerald-400",
    fields: ["Type_of_vehicle", "Owner_of_vehicle", "Service_year_of_vehicle", "Defect_of_vehicle"],
  },
  {
    title: "Road & Environment",
    icon: MapPin,
    color: "text-amber-400",
    borderColor: "border-l-amber-400",
    bgColor: "bg-amber-500/15 text-amber-400",
    fields: ["Area_accident_occured", "Lanes_or_Medians", "Road_allignment", "Types_of_Junction", "Road_surface_type", "Road_surface_conditions", "Light_conditions", "Weather_conditions"],
  },
  {
    title: "Accident Details",
    icon: AlertTriangle,
    color: "text-red-400",
    borderColor: "border-l-red-400",
    bgColor: "bg-red-500/15 text-red-400",
    fields: ["Type_of_collision", "Vehicle_movement", "Pedestrian_movement", "Cause_of_accident"],
  },
];

// ─── 7. LIVE PREDICTOR TAB ─────────────────────────────────────────

function LivePredictorTab() {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    classification: {
      severity: string;
      confidence: number;
      probabilities: Record<string, number> | null;
      model: string;
    };
    regression: {
      predicted_casualties: number;
      predicted_casualties_float: number;
      model: string;
    };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (title: string) => {
    setCollapsedSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleChange = useCallback(
    (field: string, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const [classRes, regRes] = await Promise.all([
        fetch("/api/classify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }),
        fetch("/api/regress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }),
      ]);

      const classData = await classRes.json();
      const regData = await regRes.json();

      if (classData.error || regData.error) {
        setError(classData.details || regData.details || classData.error || regData.error);
      } else {
        setResult({
          classification: {
            severity: classData.severity,
            confidence: classData.confidence,
            probabilities: classData.probabilities,
            model: classData.model,
          },
          regression: {
            predicted_casualties: regData.predicted_casualties,
            predicted_casualties_float: regData.predicted_casualties_float,
            model: regData.model,
          },
        });
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Prediction failed");
    }
    setLoading(false);
  };

  const handleReset = () => {
    setFormData({});
    setResult(null);
    setError(null);
  };

  // Count filled fields
  const filledCount = Object.keys(formData).filter((k) => formData[k]).length;
  const totalFields = ALL_FEATURES.length;

  return (
    <div className="space-y-6">
      {/* Form + Results layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Form */}
        <Card className="glass-subtle border-border/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Eye className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold">Accident Parameters</CardTitle>
                  <CardDescription>Enter accident details to predict severity and casualties</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="text-xs font-mono shrink-0">
                {filledCount}/{totalFields} filled
              </Badge>
            </div>
            {/* Progress bar for form completion */}
            <Progress value={(filledCount / totalFields) * 100} className="h-1 mt-2" />
          </CardHeader>
          <CardContent className="space-y-5 max-h-[72vh] overflow-y-auto pr-2">
            {fieldGroups.map((group) => {
              const GroupIcon = group.icon;
              const isCollapsed = collapsedSections[group.title];
              return (
                <div key={group.title} className="space-y-3">
                  {/* Section header */}
                  <button
                    onClick={() => toggleSection(group.title)}
                    className="flex items-center gap-2 w-full text-left group/section cursor-pointer"
                  >
                    <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg shrink-0", group.bgColor)}>
                      <GroupIcon className="h-3.5 w-3.5" />
                    </div>
                    <h4 className={cn("text-sm font-semibold flex-1", group.color)}>
                      {group.title}
                    </h4>
                    <span className="text-xs text-muted-foreground">{group.fields.length}</span>
                    {isCollapsed ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
                    ) : (
                      <ChevronUp className="h-4 w-4 text-muted-foreground transition-transform" />
                    )}
                  </button>

                  {/* Section fields */}
                  {!isCollapsed && (
                    <div className={cn("form-section", group.borderColor)}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {group.fields.map((key) => {
                          const fieldDef = ALL_FEATURE_OPTIONS[key];
                          if (!fieldDef) return null;
                          return (
                            <div key={key} className="space-y-1.5">
                              <Label className="text-xs font-medium text-muted-foreground">
                                {fieldDef.label}
                              </Label>
                              <Select
                                value={formData[key] || ""}
                                onValueChange={(v) => handleChange(key, v)}
                              >
                                <SelectTrigger className="w-full bg-card border-border/50 h-9">
                                  <SelectValue
                                    placeholder={`Select ${fieldDef.label.toLowerCase()}`}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {fieldDef.options.map((opt: string) => (
                                    <SelectItem key={opt} value={opt}>
                                      {opt}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Action buttons */}
            <div className="flex gap-3 pt-4 sticky bottom-0 bg-card/80 backdrop-blur-sm py-3 -mx-6 px-6 border-t border-border/20">
              <Button
                onClick={handleSubmit}
                disabled={loading || filledCount === 0}
                className="flex-1 h-11 bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                {loading ? "Predicting..." : "Predict Severity & Casualties"}
              </Button>
              <Button variant="outline" onClick={handleReset} className="h-11">
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: Results */}
        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium">Prediction Failed</p>
                <p className="text-xs mt-1">{error}</p>
              </AlertDescription>
            </Alert>
          )}

          {result && (
            <>
              {/* Severity Prediction */}
              <Card className="glass-subtle border-border/30 animate-fade-in-up">
                <CardHeader>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/15 text-red-400">
                      <ShieldAlert className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">Severity Prediction</CardTitle>
                      <CardDescription>{result.classification.model}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <SeverityResult data={result.classification} />
                </CardContent>
              </Card>

              {/* Casualty Prediction */}
              <Card className="glass-subtle border-border/30 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                <CardHeader>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">Casualty Estimation</CardTitle>
                      <CardDescription>{result.regression.model}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CasualtyResult data={result.regression} />
                </CardContent>
              </Card>
            </>
          )}

          {!result && !error && (
            <Card className="glass-subtle border-border/30 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                <BrainCircuit className="h-14 w-14 text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground text-sm font-medium">
                  No predictions yet
                </p>
                <p className="text-muted-foreground/60 text-xs mt-1 max-w-xs">
                  Fill in the accident parameters on the left and click
                  &quot;Predict&quot; to see severity and casualty results
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────

function HomePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get("tab") || "dashboard";

  const handleTabChange = (tab: string) => {
    router.push(`/?tab=${tab}`);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      {/* Compact Hero Banner */}
      <section className="relative overflow-hidden border-b border-border/30 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs text-primary mb-3">
                <Activity className="h-3 w-3" />
                <span>ML-Powered Traffic Safety Analytics</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                India Road Accident{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                  Intelligence System
                </span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                Analyze 12,316 accident records with 6+ ML models for severity
                classification and casualty prediction.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Database className="h-3.5 w-3.5" />
              12,316 records &middot; 24 features
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-lg w-fit backdrop-blur-sm">
          {[
            { key: "dashboard", label: "Dashboard", icon: BarChart3 },
            { key: "models", label: "Model Playground", icon: BrainCircuit },
            { key: "predictor", label: "Live Predictor", icon: Zap },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = currentTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-background text-foreground shadow-sm border border-border/50"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <TabIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 pb-16 flex-1">
        {currentTab === "dashboard" && <DashboardTab />}
        {currentTab === "models" && <ModelPlaygroundTab />}
        {currentTab === "predictor" && <LivePredictorTab />}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/20 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldAlert className="h-4 w-4 text-primary" />
              <span>
                IR-AIS &mdash; India Road Accident Intelligence System
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built with Next.js, Recharts & Machine Learning
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
