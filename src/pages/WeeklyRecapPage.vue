<template>
  <q-page class="q-pa-lg">
    <!-- Header -->
    <div class="row justify-between items-center q-mb-lg">
      <div>
        <h1 class="text-h4 text-weight-bold text-theme-title q-ma-none">Weekly Recap</h1>
        <div class="text-subtitle1 text-theme-caption">Your calorie trends and macro stats for the last 7 days</div>
      </div>
    </div>

    <!-- Summary Metrics Cards -->
    <div class="row q-col-gutter-lg q-mb-lg">
      <!-- Card 1: Average Calories -->
      <div class="col-12 col-md-4">
        <q-card class="glass-card q-pa-md text-center flex flex-col justify-between" style="min-height: 140px">
          <div>
            <div class="text-subtitle2 text-theme-caption text-weight-medium">Daily Calorie Average</div>
            <div class="text-h4 text-weight-bold text-theme-title q-mt-xs">
              {{ averageCalories }} <span class="text-subtitle1 text-theme-caption">kCal</span>
            </div>
          </div>
          <div class="text-caption text-theme-caption q-mt-sm">
            <span :class="averageCalories <= dailyCalorieGoal ? 'text-primary' : 'text-negative'" class="text-weight-bold">
              {{ averageCaloriesPercent }}%
            </span>
            of your {{ dailyCalorieGoal }} kCal daily goal
          </div>
        </q-card>
      </div>

      <!-- Card 2: Total Calories -->
      <div class="col-12 col-md-4">
        <q-card class="glass-card q-pa-md text-center flex flex-col justify-between" style="min-height: 140px">
          <div>
            <div class="text-subtitle2 text-theme-caption text-weight-medium">Weekly Calorie Total</div>
            <div class="text-h4 text-weight-bold text-theme-title q-mt-xs">
              {{ totalCalories }} <span class="text-subtitle1 text-theme-caption">kCal</span>
            </div>
          </div>
          <div class="text-caption text-theme-caption q-mt-sm">
            Across {{ activeLoggingDays }} active logging days this week
          </div>
        </q-card>
      </div>

      <!-- Card 3: Target Adherence -->
      <div class="col-12 col-md-4">
        <q-card class="glass-card q-pa-md text-center flex flex-col justify-between" style="min-height: 140px">
          <div>
            <div class="text-subtitle2 text-theme-caption text-weight-medium">Goal Adherence</div>
            <div class="text-h4 text-weight-bold text-theme-title q-mt-xs">
              {{ adherenceDays }} <span class="text-subtitle1 text-theme-caption">/ 7 Days</span>
            </div>
          </div>
          <div class="text-caption text-theme-caption q-mt-sm text-primary text-weight-bold" v-if="adherenceDays >= 5">
            Excellent consistency! Keep it up.
          </div>
          <div class="text-caption text-theme-caption q-mt-sm" v-else>
            Log daily and try to stay within your targets.
          </div>
        </q-card>
      </div>
    </div>

    <!-- Trend Chart Card -->
    <q-card class="glass-card q-pa-lg relative-position">
      <div class="row justify-between items-center q-mb-md">
        <div class="row items-center q-gutter-x-sm">
          <div>
            <div class="text-h6 text-weight-bold text-theme-title">Calorie Intake Trend</div>
            <div class="text-caption text-theme-caption">Interactive 7-day progress chart</div>
          </div>
          <q-btn
            flat
            round
            dense
            color="primary"
            icon="share"
            @click="shareTrend"
            :loading="isSharing"
            class="q-ml-sm"
          >
            <q-tooltip>Share or download chart</q-tooltip>
          </q-btn>
        </div>
        <!-- Chart Legend -->
        <div class="row q-gutter-x-md text-caption text-theme-caption">
          <div class="row items-center">
            <div class="q-mr-xs" style="width: 12px; height: 3px; background: #10b981; border-radius: 2px;"></div>
            <span>Intake</span>
          </div>
          <div class="row items-center">
            <div class="q-mr-xs" style="width: 12px; height: 1px; border-bottom: 2px dashed #ef4444;"></div>
            <span>Goal</span>
          </div>
        </div>
      </div>

      <!-- Custom SVG Chart Container -->
      <div class="relative-position q-mt-lg" style="width: 100%; min-height: 220px;">
        <svg viewBox="0 0 500 220" class="full-width" style="overflow: visible; display: block;">
          <!-- Gradients -->
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#10b981" stop-opacity="0.25" />
              <stop offset="100%" stop-color="#10b981" stop-opacity="0.0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <!-- Y-Axis Gridlines and Labels -->
          <g v-for="grid in gridLines" :key="grid.value">
            <line
              :x1="45"
              :y1="grid.y"
              :x2="485"
              :y2="grid.y"
              :stroke="$q.dark.isActive ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'"
              stroke-dasharray="2,2"
            />
            <text
              :x="35"
              :y="grid.y + 4"
              text-anchor="end"
              class="text-caption"
              style="font-size: 9px; font-weight: 500;"
              fill="currentColor"
              opacity="0.5"
            >
              {{ grid.value }}
            </text>
          </g>

          <!-- Calorie Goal Reference line -->
          <g>
            <line
              :x1="45"
              :y1="goalY"
              :x2="485"
              :y2="goalY"
              stroke="#ef4444"
              stroke-dasharray="4,4"
              stroke-width="1.5"
              opacity="0.5"
            />
            <text
              :x="480"
              :y="goalY - 6"
              text-anchor="end"
              fill="#ef4444"
              opacity="0.8"
              style="font-size: 8px; font-weight: 700; tracking: 0.5px;"
            >
              TARGET: {{ dailyCalorieGoal }}
            </text>
          </g>

          <!-- Gradient Area Under Curve -->
          <path
            v-if="areaPath"
            :d="areaPath"
            fill="url(#chartGrad)"
          />

          <!-- Glowing Bezier Spline -->
          <path
            v-if="linePath"
            :d="linePath"
            fill="none"
            stroke="#10b981"
            stroke-width="3"
            filter="url(#glow)"
            stroke-linecap="round"
          />

          <!-- Interaction Dots & Guideline -->
          <g v-for="(p, idx) in chartPoints" :key="idx">
            <!-- Active point guideline -->
            <line
              v-if="hoveredIndex === idx"
              :x1="p.x"
              :y1="20"
              :x2="p.x"
              :y2="190"
              stroke="rgba(16, 185, 129, 0.25)"
              stroke-width="1"
              stroke-dasharray="2,2"
            />
            <!-- Outer halo on hover -->
            <circle
              v-if="hoveredIndex === idx"
              :cx="p.x"
              :cy="p.y"
              r="7"
              fill="#10b981"
              opacity="0.4"
            />
            <!-- Dot -->
            <circle
              :cx="p.x"
              :cy="p.y"
              r="4.5"
              fill="#ffffff"
              stroke="#10b981"
              stroke-width="2.5"
            />
            <!-- X-Axis Labels -->
            <text
              :x="p.x"
              :y="220 - 8"
              text-anchor="middle"
              class="text-weight-bold"
              style="font-size: 10px;"
              fill="currentColor"
              opacity="0.6"
            >
              {{ p.label }}
            </text>
          </g>

          <!-- Interaction rectangle overlays -->
          <rect
            v-for="(p, idx) in chartPoints"
            :key="'rect-' + idx"
            :x="p.x - 22"
            :y="20"
            width="44"
            height="170"
            fill="transparent"
            style="cursor: pointer;"
            @mousemove="hoveredIndex = idx"
            @mouseleave="hoveredIndex = null"
          />
        </svg>

        <!-- Dynamic Absolute-Position Tooltip -->
        <div
          v-if="hoveredDay"
          class="absolute q-pa-sm rounded shadow-lg border-theme-light"
          :style="{
            left: tooltipStyle.left,
            top: tooltipStyle.top,
            transform: 'translateX(-50%)',
            background: $q.dark.isActive ? '#1e293b' : '#ffffff',
            color: $q.dark.isActive ? '#f1f5f9' : '#0f172a',
            pointerEvents: 'none',
            zIndex: 10,
            minWidth: '135px',
            borderRadius: '10px'
          }"
        >
          <div class="text-weight-bold text-caption" style="font-size: 11px;">
            {{ hoveredDay.friendlyDate }}
          </div>
          <div class="row justify-between items-center q-mt-xs text-caption">
            <span class="text-primary text-weight-medium">Intake:</span>
            <span class="text-weight-bold">{{ hoveredDay.calories }} kCal</span>
          </div>
          <div class="row justify-between items-center text-grey-6 text-caption" style="font-size: 10px;">
            <span>Target:</span>
            <span>{{ dailyCalorieGoal }} kCal</span>
          </div>
          <div
            class="q-mt-xs text-weight-bold text-center text-caption"
            :class="hoveredDay.calories <= dailyCalorieGoal ? 'text-primary' : 'text-negative'"
            style="font-size: 11px;"
          >
            {{ hoveredDay.calories === 0 ? 'No logs' : (hoveredDay.calories <= dailyCalorieGoal ? 'Under Target' : 'Over Target') }}
          </div>
        </div>
      </div>
    </q-card>

    <!-- Macro Breakdown Averages Card -->
    <q-card class="glass-card q-pa-lg q-mt-lg">
      <div class="text-h6 text-weight-bold text-theme-title q-mb-md">Daily Macro Averages</div>
      <div class="row q-col-gutter-lg">
        <!-- Protein -->
        <div class="col-12 col-sm-4 text-center">
          <div class="text-subtitle2 text-theme-caption text-weight-medium">Protein</div>
          <div class="text-h5 text-weight-bold text-accent q-mt-xs">{{ averageProtein }}g</div>
          <div class="text-caption text-theme-caption">Target: {{ proteinGoal }}g</div>
          <q-linear-progress
            :value="averageProtein / proteinGoal"
            color="accent"
            size="8px"
            rounded
            class="q-mt-sm"
          />
        </div>
        <!-- Carbs -->
        <div class="col-12 col-sm-4 text-center">
          <div class="text-subtitle2 text-theme-caption text-weight-medium">Carbohydrates</div>
          <div class="text-h5 text-weight-bold text-secondary q-mt-xs">{{ averageCarbs }}g</div>
          <div class="text-caption text-theme-caption">Target: {{ carbsGoal }}g</div>
          <q-linear-progress
            :value="averageCarbs / carbsGoal"
            color="secondary"
            size="8px"
            rounded
            class="q-mt-sm"
          />
        </div>
        <!-- Fat -->
        <div class="col-12 col-sm-4 text-center">
          <div class="text-subtitle2 text-theme-caption text-weight-medium">Fat</div>
          <div class="text-h5 text-weight-bold text-warning q-mt-xs">{{ averageFat }}g</div>
          <div class="text-caption text-theme-caption">Target: {{ fatGoal }}g</div>
          <q-linear-progress
            :value="averageFat / fatGoal"
            color="warning"
            size="8px"
            rounded
            class="q-mt-sm"
          />
        </div>
      </div>
    </q-card>

    <!-- Detailed Daily logs List -->
    <q-card class="glass-card q-pa-lg q-mt-lg">
      <div class="text-h6 text-weight-bold text-theme-title q-mb-xs">Daily Intake logs</div>
      <div class="text-caption text-theme-caption q-mb-md">Expand a day below to view individual logs.</div>

      <q-list class="q-gutter-y-sm">
        <q-expansion-item
          v-for="day in reversedDaysData"
          :key="day.dateKey"
          class="border-theme-light rounded-borders overflow-hidden bg-theme-hover"
          header-class="q-py-md text-theme-body"
          style="border-radius: 12px;"
        >
          <template v-slot:header>
            <q-item-section>
              <q-item-label class="text-weight-bold text-theme-title">
                {{ day.friendlyDate }} ({{ day.dateLabel }})
              </q-item-label>
              <q-item-label caption class="text-theme-caption">
                {{ day.logs.length }} logs recorded
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="row items-center q-gutter-x-sm">
                <span class="text-weight-bold" :class="day.calories > dailyCalorieGoal ? 'text-negative' : 'text-primary'">
                  {{ day.calories }} kCal
                </span>
                <span class="text-caption text-theme-caption">/ {{ dailyCalorieGoal }} kCal</span>
              </div>
            </q-item-section>
          </template>

          <q-card style="background: transparent;">
            <q-card-section class="q-px-md q-pb-md q-pt-none">
              <q-separator class="q-mb-md" :dark="$q.dark.isActive" />
              <div v-if="day.logs.length === 0" class="text-caption text-theme-caption text-center q-py-sm">
                No logs recorded for this day.
              </div>
              <q-list v-else separator class="q-gutter-y-xs">
                <q-item v-for="(intake, idx) in day.logs" :key="idx" class="q-px-none q-py-sm">
                  <q-item-section>
                    <q-item-label class="text-weight-bold text-theme-title">{{ intake.food }}</q-item-label>
                    <q-item-label caption class="text-theme-caption">
                      {{ intake.amount }}{{ intake.uom }} • {{ formatTime(intake.timeTaken) }}
                      <span v-if="intake.protein || intake.carbs || intake.fat" class="q-ml-xs">
                        | P: {{ intake.protein || 0 }}g • C: {{ intake.carbs || 0 }}g • F: {{ intake.fat || 0 }}g
                      </span>
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <span class="text-weight-bold text-primary">{{ intake.calories }} kCal</span>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </q-list>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useStorage, StorageSerializers } from '@vueuse/core';
import { useQuasar } from 'quasar';
import type { DailyIntake } from 'src/types/types';

const $q = useQuasar();

// Get local storage stats
const dailyIntake = useStorage<DailyIntake | null>('dailyIntake', null, undefined, {
  serializer: StorageSerializers.object,
});
const dailyCalorieGoal = useStorage('dailyCalorieGoal', 2000);

// Macro Goals
const proteinGoal = ref(130);
const carbsGoal = ref(220);
const fatGoal = ref(70);

// Helper to format date keys
function formatDateForKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

// Hover State index
const hoveredIndex = ref<number | null>(null);

const hoveredDay = computed(() => {
  if (hoveredIndex.value === null) return null;
  return last7DaysData.value[hoveredIndex.value] || null;
});

// Get the last 7 calendar days data
const last7DaysData = computed(() => {
  const data = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateKey = formatDateForKey(date);

    const logs = (dailyIntake.value && dailyIntake.value[dateKey]) || [];
    const calories = Number(logs.reduce((sum, item) => sum + item.calories, 0).toFixed(2));
    const protein = Number(logs.reduce((sum, item) => sum + (item.protein || 0), 0).toFixed(2));
    const carbs = Number(logs.reduce((sum, item) => sum + (item.carbs || 0), 0).toFixed(2));
    const fat = Number(logs.reduce((sum, item) => sum + (item.fat || 0), 0).toFixed(2));

    data.push({
      dateKey,
      dateLabel: date.toLocaleDateString('en-US', { weekday: 'short' }),
      friendlyDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      calories,
      protein,
      carbs,
      fat,
      logs,
    });
  }

  return data;
});

// Reverse day list to show today first
const reversedDaysData = computed(() => [...last7DaysData.value].reverse());

// Weekly averages and totals
const totalCalories = computed(() => {
  return Number(last7DaysData.value.reduce((sum, d) => sum + d.calories, 0).toFixed(1));
});

const averageCalories = computed(() => {
  return Number((totalCalories.value / 7).toFixed(1));
});

const averageCaloriesPercent = computed(() => {
  if (dailyCalorieGoal.value <= 0) return 0;
  return Math.round((averageCalories.value / dailyCalorieGoal.value) * 100);
});

const activeLoggingDays = computed(() => {
  return last7DaysData.value.filter((d) => d.logs.length > 0).length;
});

const adherenceDays = computed(() => {
  // Days where logs exist and calories are within goal bounds
  return last7DaysData.value.filter(
    (d) => d.logs.length > 0 && d.calories <= dailyCalorieGoal.value,
  ).length;
});

const averageProtein = computed(() => {
  const sum = last7DaysData.value.reduce((acc, d) => acc + d.protein, 0);
  return Number((sum / 7).toFixed(1));
});

const averageCarbs = computed(() => {
  const sum = last7DaysData.value.reduce((acc, d) => acc + d.carbs, 0);
  return Number((sum / 7).toFixed(1));
});

const averageFat = computed(() => {
  const sum = last7DaysData.value.reduce((acc, d) => acc + d.fat, 0);
  return Number((sum / 7).toFixed(1));
});

// Chart Scale configuration
const maxChartValue = computed(() => {
  const maxVal = Math.max(...last7DaysData.value.map((d) => d.calories), dailyCalorieGoal.value);
  // Pad the chart so the line never hits the absolute ceiling
  return maxVal > 0 ? maxVal * 1.15 : 2500;
});

// Goal line Y coordinate
const goalY = computed(() => {
  const goal = Number(dailyCalorieGoal.value);
  const maxVal = maxChartValue.value;
  if (isNaN(goal) || isNaN(maxVal) || maxVal <= 0) return 0;
  return 220 - 30 - (goal / maxVal) * 170;
});

// X/Y Coordinates for data plotting
const chartPoints = computed(() => {
  return last7DaysData.value.map((d, i) => {
    const x = 45 + i * (440 / 6);
    const y = 220 - 30 - (d.calories / maxChartValue.value) * 170;
    return {
      x,
      y,
      label: d.dateLabel,
    };
  });
});

// Gridlines Y mapping
const gridLines = computed(() => {
  const maxVal = maxChartValue.value;
  const steps = 4;
  const lines = [];
  for (let i = 0; i <= steps; i++) {
    const val = Math.round((maxVal / steps) * i);
    const y = 220 - 30 - (val / maxVal) * 170;
    lines.push({ value: val, y });
  }
  return lines;
});

// SVG Line path definition using smooth cubic bezier segments
const linePath = computed(() => {
  const pts = chartPoints.value;
  if (pts.length === 0) return '';

  const pStart = pts[0];
  if (!pStart) return '';

  let path = `M ${pStart.x} ${pStart.y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    if (!p0 || !p1) continue;

    const cpX1 = p0.x + (p1.x - p0.x) / 3;
    const cpY1 = p0.y;
    const cpX2 = p0.x + (2 * (p1.x - p0.x)) / 3;
    const cpY2 = p1.y;

    path += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
  }
  return path;
});

// SVG Gradient area definition
const areaPath = computed(() => {
  const lPath = linePath.value;
  if (!lPath) return '';

  const startX = 45;
  const endX = 45 + 6 * (440 / 6);
  const bottomY = 220 - 30;

  return `${lPath} L ${endX} ${bottomY} L ${startX} ${bottomY} Z`;
});

// Tooltip absolute placement style
const tooltipStyle = computed(() => {
  if (hoveredIndex.value === null) return { left: '0px', top: '0px' };

  const i = hoveredIndex.value;
  const xPercent = ((45 + i * (440 / 6)) / 500) * 100;
  const d = last7DaysData.value[i];
  if (!d) return { left: '0px', top: '0px' };

  const yPercent = ((220 - 30 - (d.calories / maxChartValue.value) * 170) / 220) * 100;

  return {
    left: `${xPercent}%`,
    top: `calc(${yPercent}% - 85px)`,
  };
});

const isSharing = ref(false);

async function exportChartAsPNG(): Promise<{ blob: Blob; dataUrl: string } | null> {
  const svgEl = document.querySelector('svg');
  if (!svgEl) return null;

  try {
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgEl);

    const isDark = $q.dark.isActive;
    const bgColor = isDark ? '#0f172a' : '#ffffff';
    const textColor = isDark ? '#f8fafc' : '#0f172a';
    const subtextColor = isDark ? 'rgba(248, 250, 252, 0.6)' : 'rgba(15, 23, 42, 0.6)';

    // Parse the SVG string to XML DOM
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');
    const svg = doc.querySelector('svg');
    if (!svg) return null;

    // Set attributes for the new 500x290 export format
    svg.setAttribute('width', '500');
    svg.setAttribute('height', '290');
    svg.setAttribute('viewBox', '0 0 500 290');
    svg.setAttribute('style', `background-color: ${bgColor}; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;`);

    // Ingest Style tag for fonts, overrides, and theme consistency
    const style = doc.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
      text { 
        fill: ${textColor} !important; 
        font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important; 
      }
      .grid-line { 
        stroke: ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.08)'} !important; 
      }
    `;
    svg.insertBefore(style, svg.firstChild);

    // Ingest background rect
    const rect = doc.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', '100%');
    rect.setAttribute('height', '100%');
    rect.setAttribute('fill', bgColor);
    rect.setAttribute('rx', '16');
    svg.insertBefore(rect, style.nextSibling);

    // Create Title text node
    const title = doc.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('x', '45');
    title.setAttribute('y', '32');
    title.setAttribute('fill', textColor);
    title.style.fontSize = '16px';
    title.style.fontWeight = '800';
    title.style.letterSpacing = '-0.5px';
    title.textContent = 'Calorie Intake Trend';

    // Create Subtitle text node
    const subtitle = doc.createElementNS('http://www.w3.org/2000/svg', 'text');
    subtitle.setAttribute('x', '45');
    subtitle.setAttribute('y', '49');
    subtitle.setAttribute('fill', subtextColor);
    subtitle.style.fontSize = '11px';
    subtitle.style.fontWeight = '500';
    subtitle.textContent = 'Interactive 7-day progress chart';

    svg.appendChild(title);
    svg.appendChild(subtitle);

    // Create a group that shifts all the original chart graphics down by 60px
    const chartGroup = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
    chartGroup.setAttribute('transform', 'translate(0, 60)');

    // Move all original elements (except defs, style, rect, title, subtitle) into the translated chartGroup
    const children = Array.from(svg.childNodes);
    children.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const tagName = (child as Element).tagName.toLowerCase();
        if (
          tagName !== 'defs' &&
          tagName !== 'style' &&
          child !== rect &&
          child !== title &&
          child !== subtitle
        ) {
          chartGroup.appendChild(child);
        }
      }
    });
    svg.appendChild(chartGroup);

    // Serialize back to final string
    const finalSvgString = serializer.serializeToString(doc);

    const svgBlob = new Blob([finalSvgString], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1000;
        canvas.height = 580; // 290 * 2 for 2x scale crispness
        const context = canvas.getContext('2d');
        if (!context) {
          resolve(null);
          return;
        }

        context.drawImage(image, 0, 0, 1000, 580);
        URL.revokeObjectURL(blobURL);

        canvas.toBlob((blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          const dataUrl = canvas.toDataURL('image/png');
          resolve({ blob, dataUrl });
        }, 'image/png');
      };
      image.onerror = () => {
        URL.revokeObjectURL(blobURL);
        resolve(null);
      };
      image.src = blobURL;
    });
  } catch (error) {
    console.error('Error exporting chart:', error);
    return null;
  }
}

async function shareTrend() {
  isSharing.value = true;

  try {
    const exportResult = await exportChartAsPNG();
    if (!exportResult) {
      throw new Error('Export failed');
    }

    const { blob, dataUrl } = exportResult;
    const file = new File([blob], 'calorie-trend.png', { type: 'image/png' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'Weekly Calorie Progress',
        text: `Here is my calorie intake trend this week! Average: ${averageCalories.value} kCal.`,
      });
    } else {
      const link = document.createElement('a');
      link.download = `calorie-trend-${formatDateForKey(new Date())}.png`;
      link.href = dataUrl;
      link.click();

      $q.notify({
        message: 'Share sheet not supported. Chart downloaded as PNG!',
        color: 'info',
        icon: 'download',
        position: 'top',
      });
    }
  } catch (error) {
    console.error('Failed to share:', error);
    $q.notify({
      message: 'Failed to share chart. Please try again.',
      color: 'negative',
      icon: 'error',
      position: 'top',
    });
  } finally {
    isSharing.value = false;
  }
}

function formatTime(dateVal: Date | string | undefined | null): string {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
    return d.toLocaleTimeString('en-US', options);
  } catch {
    return '';
  }
}
</script>
