import { Flame, Zap, Wheat, Droplets, Activity, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { FuelResult } from '@/lib/fuelCalculations';

interface FuelResultsProps {
  result: FuelResult;
}

export function FuelResults({ result }: FuelResultsProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Target Calories - Matches Speed Calculator Hero Card */}
      <Card className=" border-border overflow-hidden border-border bg-card">
        <div className="bg-primary/10 border-b border-border px-6 py-4">
          <h3 className="font-display text-lg text-muted-foreground uppercase tracking-wider">
            DAILY CALORIE TARGET
          </h3>
        </div>
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Flame className="w-10 h-10 text-primary" />
            <div className="font-display text-7xl text-primary">
              {result.targetCalories.toLocaleString()}
            </div>
          </div>
          <p className="text-muted-foreground">
            calories per day
          </p>
        </CardContent>
      </Card>

      {/* Macro Breakdown - Matches Speed Performance Level Card */}
      <Card className=" border-border overflow-hidden border-border bg-card">
        <div className="bg-primary/10 border-b border-border px-6 py-4">
          <h3 className="font-display text-lg text-muted-foreground uppercase tracking-wider">
            MACRO BREAKDOWN
          </h3>
        </div>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Protein */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="font-display text-xl text-foreground tracking-wide">Protein</span>
                </div>
                <div className="text-right">
                  <span className="font-display text-2xl text-primary">{result.protein}g</span>
                  <span className="text-muted-foreground ml-2 text-sm">{result.proteinPercent}%</span>
                </div>
              </div>
              <Progress value={result.proteinPercent} className="h-3" />
            </div>

            {/* Carbs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wheat className="w-5 h-5 text-muted-foreground" />
                  <span className="font-display text-xl text-foreground tracking-wide">Carbohydrates</span>
                </div>
                <div className="text-right">
                  <span className="font-display text-2xl text-muted-foreground">{result.carbs}g</span>
                  <span className="text-muted-foreground ml-2 text-sm">{result.carbPercent}%</span>
                </div>
              </div>
              <Progress value={result.carbPercent} className="h-3" />
            </div>

            {/* Fat */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-foreground/70" />
                  <span className="font-display text-xl text-foreground tracking-wide">Fat</span>
                </div>
                <div className="text-right">
                  <span className="font-display text-2xl text-foreground">{result.fat}g</span>
                  <span className="text-muted-foreground ml-2 text-sm">{result.fatPercent}%</span>
                </div>
              </div>
              <Progress value={result.fatPercent} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BMR/TDEE Stats - Matches Speed Pace Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className=" border-border border-border bg-card">
          <CardContent className="p-6 text-center">
            <Activity className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="font-display text-3xl text-primary mb-1">
              {result.bmr.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">BMR cal/day</p>
          </CardContent>
        </Card>
        <Card className=" border-border border-border bg-card">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="font-display text-3xl text-primary mb-1">
              {result.tdee.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">TDEE cal/day</p>
          </CardContent>
        </Card>
      </div>

      {/* Calorie Distribution Stats - Matches Speed Percentile Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className=" border-border border-border bg-card">
          <CardContent className="p-6 text-center">
            <div className="font-display text-4xl text-primary mb-1">
              {Math.round(result.protein * 4)}
            </div>
            <p className="text-sm text-muted-foreground">Protein Calories</p>
          </CardContent>
        </Card>
        <Card className=" border-border border-border bg-card">
          <CardContent className="p-6 text-center">
            <div className="font-display text-4xl text-primary mb-1">
              {Math.round(result.carbs * 4 + result.fat * 9)}
            </div>
            <p className="text-sm text-muted-foreground">Energy Calories</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Reference - Matches Speed Age-Adjusted Card */}
      <Card className=" border-border overflow-hidden border-border bg-card">
        <div className="bg-primary/10 border-b border-border px-6 py-4">
          <h3 className="font-display text-lg text-muted-foreground uppercase tracking-wider">
            FUEL REFERENCE
          </h3>
        </div>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm mb-1">Basal Metabolic Rate</p>
              <p className="font-display text-2xl text-foreground tracking-wide">
                {result.bmr.toLocaleString()} cal
              </p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-sm mb-1">Daily Energy Expenditure</p>
              <div className="font-display text-4xl text-primary">
                {result.tdee.toLocaleString()}
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-4 italic">
            BMR is your resting calorie burn. TDEE includes all daily activity — fuel smart for life.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
