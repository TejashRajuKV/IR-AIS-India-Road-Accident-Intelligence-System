import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const classMetrics = JSON.parse(
      fs.readFileSync(
        path.join(
          process.cwd(),
          "ml-service/models/classification_metrics.json"
        ),
        "utf-8"
      )
    );
    const regMetrics = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), "ml-service/models/regression_metrics.json"),
        "utf-8"
      )
    );

    // Transform classification models into array
    const classificationModels = Object.entries(classMetrics).map(
      ([name, metrics]: [string, Record<string, unknown>]) => ({
        name,
        accuracy: metrics.accuracy as number,
        precision: metrics.precision_weighted as number,
        recall: metrics.recall_weighted as number,
        f1Score: metrics.f1_weighted as number,
        approach: metrics.approach as string,
        rocAuc: (metrics.roc_auc_ovr as number) || null,
        confusionMatrix: metrics.confusion_matrix as number[][],
        bestParams: (metrics.best_params as Record<string, unknown>) || null,
      })
    );

    // Transform regression models into array
    const regressionModels = Object.entries(regMetrics).map(
      ([name, metrics]: [string, Record<string, unknown>]) => ({
        name,
        mae: metrics.mae as number,
        mse: metrics.mse as number,
        rmse: metrics.rmse as number,
        r2: metrics.r2 as number,
        approach: metrics.approach as string,
        bestParams: (metrics.best_params as Record<string, unknown>) || null,
      })
    );

    return NextResponse.json({
      classification: classificationModels,
      regression: regressionModels,
    });
  } catch (error) {
    console.error("Model comparison error:", error);
    return NextResponse.json(
      { error: "Failed to load model data" },
      { status: 500 }
    );
  }
}
