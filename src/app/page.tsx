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

const tooltipStyle = {
  backgroundColor: "#1e293b",
  border: "1px solid #334155",
  borderRadius: "8px",
  color: "#f1f5f9",
};

const axisTickStyle = { fill: "#94a3b8" };

// ─── Helper Components ──────────────────────────────────────────────

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <Card className="border-border/50 bg-card/50">
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted ${color}`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
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
            <th className="text-left py-2 px-2 text-muted-foreground font-medium">
              Weather
            </th>
            {severities.map((s) => (
              <th
                key={s}
                className="text-center py-2 px-2 text-muted-foreground font-medium"
              >
                {s}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weathers.map((w) => (
            <tr key={w} className="border-t border-border/30">
              <td className="py-2 px-2 text-sm">{w}</td>
              {severities.map((s) => {
                const item = data.find(
                  (d) => d.weather === w && d.severity === s
                );
                const count = item?.count || 0;
                return (
                  <td key={s} className="py-2 px-1.5">
                    <div
                      className={`rounded px-2 py-1 text-center text-xs font-medium ${getColor(count)}`}
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
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis dataKey="age" tick={{ fill: "#94a3b8" }} />
        <YAxis tick={{ fill: "#94a3b8" }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend
          wrapperStyle={{ color: "#94a3b8", fontSize: 12 }}
        />
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border/50">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-7 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-border/50">
            <CardHeader>
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full rounded-md" />
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
      <div className="flex justify-center gap-4">
        <Skeleton className="h-9 w-44" />
        <Skeleton className="h-9 w-44" />
      </div>
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-border/50">
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full rounded-md" />
          </CardContent>
        </Card>
      ))}
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
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Database}
          label="Total Records"
          value={edaData.total_records.toLocaleString()}
          color="text-blue-400"
        />
        <StatCard
          icon={Layers}
          label="Features"
          value={edaData.total_features}
          color="text-emerald-400"
        />
        <StatCard
          icon={AlertTriangle}
          label="Fatal Accidents"
          value={fatalCount.toLocaleString()}
          color="text-red-400"
        />
        <StatCard
          icon={Users}
          label="Serious Injuries"
          value={seriousCount.toLocaleString()}
          color="text-amber-400"
        />
      </div>

      {/* Row 1: Severity Pie + Peak Hours Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Accident Severity Distribution"
          description="Class imbalance visualization"
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
        >
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={edaData.peak_hours}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="hour"
                tick={{ ...axisTickStyle, fontSize: 11 }}
                interval={1}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={axisTickStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar
                dataKey="count"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
                name="Accidents"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2: Day Distribution + Weather Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Accidents by Day of Week"
          description="Weekly distribution pattern"
        >
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={edaData.day_distribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
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
        >
          <WeatherHeatmapChart data={edaData.weather_severity} />
        </ChartCard>
      </div>

      {/* Row 3: Vehicle Type + Top Causes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Vehicle Types Involved"
          description="Distribution by vehicle type"
        >
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={edaData.vehicle_type_distribution}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
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
        >
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={edaData.cause_distribution}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
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

  // Confusion matrix of the best model
  const cm = bestModel.confusionMatrix;
  const classNames = ["Fatal injury", "Serious Injury", "Slight Injury"];

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <div className="flex flex-wrap items-center gap-2 justify-center">
        {approaches.map((a) => (
          <Button
            key={a}
            size="sm"
            variant={approachFilter === a ? "default" : "outline"}
            onClick={() => setApproachFilter(a)}
          >
            {approachLabels[a]}
          </Button>
        ))}
      </div>

      {/* Best Model Highlight */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground">{bestModel.name}</p>
              <Badge variant="default" className="text-[10px]">
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

      {/* F1 Score Comparison Chart */}
      <ChartCard
        title="Classification Model Comparison"
        description="F1-Score, Accuracy, Precision & Recall (%)"
      >
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={f1ChartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis type="number" tick={axisTickStyle} domain={[0, 100]} />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ ...axisTickStyle, fontSize: 11 }}
              width={160}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(val: number) => `${val}%`}
            />
            <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
            <Bar
              dataKey="F1"
              fill="#22c55e"
              radius={[0, 3, 3, 0]}
            />
            <Bar
              dataKey="Accuracy"
              fill="#06b6d4"
              radius={[0, 3, 3, 0]}
            />
            <Bar
              dataKey="Precision"
              fill="#f59e0b"
              radius={[0, 3, 3, 0]}
            />
            <Bar
              dataKey="Recall"
              fill="#a78bfa"
              radius={[0, 3, 3, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Metrics Table */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Detailed Metrics
          </CardTitle>
          <CardDescription>
            Showing {filtered.length} model(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">
                    Model
                  </th>
                  <th className="text-center py-3 px-3 text-muted-foreground font-medium">
                    Approach
                  </th>
                  <th className="text-center py-3 px-3 text-muted-foreground font-medium">
                    Accuracy
                  </th>
                  <th className="text-center py-3 px-3 text-muted-foreground font-medium">
                    Precision
                  </th>
                  <th className="text-center py-3 px-3 text-muted-foreground font-medium">
                    Recall
                  </th>
                  <th className="text-center py-3 px-3 text-muted-foreground font-medium">
                    F1
                  </th>
                  <th className="text-center py-3 px-3 text-muted-foreground font-medium">
                    ROC-AUC
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((model) => {
                  const isBest = model.name === bestModel.name;
                  return (
                    <tr
                      key={model.name}
                      className={`border-b border-border/20 ${isBest ? "bg-primary/5" : ""}`}
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
                        <Badge
                          variant="outline"
                          className="text-[10px] font-normal"
                        >
                          {model.approach}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {(model.accuracy * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-3 text-center">
                        {(model.precision * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-3 text-center">
                        {(model.recall * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-3 text-center font-semibold">
                        {(model.f1Score * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-3 text-center text-muted-foreground">
                        {model.rocAuc
                          ? (model.rocAuc * 100).toFixed(1) + "%"
                          : "N/A"}
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
      >
        <div className="max-w-md mx-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="p-3" />
                <th
                  colSpan={3}
                  className="text-center p-3 text-muted-foreground font-medium text-xs uppercase tracking-wider"
                >
                  Predicted
                </th>
              </tr>
              <tr>
                <th className="p-2" />
                {classNames.map((c) => (
                  <th
                    key={c}
                    className="text-center p-2 text-xs text-muted-foreground"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {classNames.map((actual, rowIdx) => (
                <tr key={actual}>
                  <td className="p-2 text-xs text-muted-foreground font-medium text-right">
                    {actual}
                  </td>
                  {cm[rowIdx].map((val, colIdx) => {
                    const maxVal = Math.max(...cm.flat());
                    const intensity = val / maxVal;
                    return (
                      <td key={colIdx} className="p-2">
                        <div
                          className={`rounded-md px-3 py-2 text-center text-sm font-medium ${
                            rowIdx === colIdx
                              ? "bg-emerald-500/30 text-emerald-300"
                              : intensity > 0.5
                                ? "bg-red-500/20 text-red-300"
                                : "bg-muted text-muted-foreground"
                          }`}
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
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground">{bestModel.name}</p>
              <Badge variant="default" className="text-[10px]">
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
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={r2Data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" tick={{ ...axisTickStyle, fontSize: 11 }} />
            <YAxis tick={axisTickStyle} domain={[0, "auto"]} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(val: number) => `${val}%`}
            />
            <Bar dataKey="R2" fill="#22c55e" radius={[4, 4, 0, 0]} name="R²" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* MAE / RMSE Chart */}
      <ChartCard
        title="Error Metrics Comparison"
        description="Mean Absolute Error & Root Mean Squared Error"
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={maeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" tick={{ ...axisTickStyle, fontSize: 11 }} />
            <YAxis tick={axisTickStyle} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
            <Bar
              dataKey="MAE"
              fill="#f59e0b"
              radius={[4, 4, 0, 0]}
              name="MAE"
            />
            <Bar
              dataKey="RMSE"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
              name="RMSE"
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Metrics Table */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Detailed Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-3 text-muted-foreground font-medium">
                    Model
                  </th>
                  <th className="text-center py-3 px-3 text-muted-foreground font-medium">
                    Approach
                  </th>
                  <th className="text-center py-3 px-3 text-muted-foreground font-medium">
                    MAE
                  </th>
                  <th className="text-center py-3 px-3 text-muted-foreground font-medium">
                    RMSE
                  </th>
                  <th className="text-center py-3 px-3 text-muted-foreground font-medium">
                    R²
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((model) => {
                  const isBest = model.name === bestModel.name;
                  return (
                    <tr
                      key={model.name}
                      className={`border-b border-border/20 ${isBest ? "bg-primary/5" : ""}`}
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
                        <Badge
                          variant="outline"
                          className="text-[10px] font-normal"
                        >
                          {model.approach}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {model.mae.toFixed(4)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {model.rmse.toFixed(4)}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold">
                        {model.r2.toFixed(4)}
                      </td>
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
  const [activeTask, setActiveTask] = useState<
    "classification" | "regression"
  >("classification");

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
      {/* Task Toggle */}
      <div className="flex items-center gap-4 justify-center">
        <Button
          onClick={() => setActiveTask("classification")}
          variant={activeTask === "classification" ? "default" : "outline"}
          className="gap-2"
        >
          <Target className="h-4 w-4" />
          Classification (Severity)
        </Button>
        <Button
          onClick={() => setActiveTask("regression")}
          variant={activeTask === "regression" ? "default" : "outline"}
          className="gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          Regression (Casualties)
        </Button>
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

  const probBarColor: Record<string, string> = {
    "Slight Injury": "bg-emerald-500",
    "Serious Injury": "bg-amber-500",
    "Fatal injury": "bg-red-500",
  };

  const colorClass = severityColorMap[data.severity] || "bg-muted text-muted-foreground border-border";

  return (
    <div className="space-y-5">
      {/* Predicted Severity Badge */}
      <div className="flex flex-col items-center gap-3 py-4">
        <div
          className={`inline-flex items-center gap-2 rounded-xl border-2 px-6 py-3 text-xl font-bold ${colorClass}`}
        >
          <ShieldAlert className="h-6 w-6" />
          {data.severity}
        </div>
        <p className="text-sm text-muted-foreground">
          Confidence:{" "}
          <span className="font-semibold text-foreground">
            {data.confidence != null
              ? (data.confidence * 100).toFixed(1)
              : "N/A"}
            %
          </span>
        </p>
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
                  <span className="font-medium">
                    {(prob * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      probBarColor[cls] || "bg-primary"
                    }`}
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

  return (
    <div className="space-y-5">
      <div className="flex flex-col items-center gap-3 py-4">
        <div
          className={`inline-flex items-center gap-3 rounded-xl border-2 px-6 py-4 ${bg}`}
        >
          <Users className={`h-7 w-7 ${color}`} />
          <span className={`text-4xl font-bold ${color}`}>
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

// ─── Feature Section Group ─────────────────────────────────────────

const FEATURE_GROUPS: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: string[];
}[] = [
  {
    title: "Driver Information",
    icon: User,
    fields: [
      "Day_of_week",
      "Age_band_of_driver",
      "Sex_of_driver",
      "Educational_level",
      "Vehicle_driver_relation",
      "Driving_experience",
    ],
  },
  {
    title: "Vehicle Information",
    icon: Car,
    fields: [
      "Type_of_vehicle",
      "Owner_of_vehicle",
      "Service_year_of_vehicle",
      "Defect_of_vehicle",
    ],
  },
  {
    title: "Road & Environment",
    icon: MapPin,
    fields: [
      "Area_accident_occured",
      "Lanes_or_Medians",
      "Road_allignment",
      "Types_of_Junction",
      "Road_surface_type",
      "Road_surface_conditions",
      "Light_conditions",
      "Weather_conditions",
    ],
  },
  {
    title: "Accident Details",
    icon: Wrench,
    fields: [
      "Type_of_collision",
      "Vehicle_movement",
      "Pedestrian_movement",
      "Cause_of_accident",
    ],
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

  return (
    <div className="space-y-6">
      {/* Form + Results layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Form */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Accident Parameters
            </CardTitle>
            <CardDescription>
              Enter accident details to predict severity and casualties
              <span className="ml-2 text-xs text-muted-foreground">
                ({filledCount}/{ALL_FEATURES.length} filled)
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 max-h-[72vh] overflow-y-auto pr-2">
            {FEATURE_GROUPS.map((group) => {
              const GroupIcon = group.icon;
              return (
                <div key={group.title}>
                  <div className="flex items-center gap-2 mb-3">
                    <GroupIcon className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-semibold text-foreground">
                      {group.title}
                    </h4>
                    <Separator className="flex-1" />
                  </div>
                  <div className="space-y-3 pl-6">
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
              );
            })}

            <div className="flex gap-3 pt-4 sticky bottom-0 bg-card/80 backdrop-blur-sm py-3 -mx-6 px-6">
              <Button
                onClick={handleSubmit}
                disabled={loading || filledCount === 0}
                className="flex-1"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                {loading ? "Predicting..." : "Predict Severity & Casualties"}
              </Button>
              <Button variant="outline" onClick={handleReset}>
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
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-red-400" />
                    Severity Prediction
                  </CardTitle>
                  <CardDescription>{result.classification.model}</CardDescription>
                </CardHeader>
                <CardContent>
                  <SeverityResult data={result.classification} />
                </CardContent>
              </Card>

              {/* Casualty Prediction */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-amber-400" />
                    Casualty Estimation
                  </CardTitle>
                  <CardDescription>{result.regression.model}</CardDescription>
                </CardHeader>
                <CardContent>
                  <CasualtyResult data={result.regression} />
                </CardContent>
              </Card>
            </>
          )}

          {!result && !error && (
            <Card className="border-border/50 border-dashed">
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
    <div className="min-h-[calc(100vh-64px)]">
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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit">
          {[
            {
              key: "dashboard",
              label: "Dashboard",
              icon: BarChart3,
            },
            {
              key: "models",
              label: "Model Playground",
              icon: BrainCircuit,
            },
            {
              key: "predictor",
              label: "Live Predictor",
              icon: Zap,
            },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = currentTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-background text-foreground shadow-sm border border-border/50"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <TabIcon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 pb-16">
        {currentTab === "dashboard" && <DashboardTab />}
        {currentTab === "models" && <ModelPlaygroundTab />}
        {currentTab === "predictor" && <LivePredictorTab />}
      </div>

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
