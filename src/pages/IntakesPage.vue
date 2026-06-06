<template>
  <q-page class="q-pa-lg flex flex-center">
    <div style="width: 100%; max-width: 600px">
      <!-- Daily Goal Banner -->
      <q-card class="glass-card q-pa-md q-mb-lg text-theme-body">
        <div class="row items-center justify-between">
          <div class="row items-center">
            <q-icon name="track_changes" color="primary" size="28px" class="q-mr-sm" />
            <div>
              <div class="text-subtitle2 text-theme-caption">Daily Calorie Target</div>
              <div class="text-h6 text-weight-bold text-theme-title">{{ dailyCalorieGoal }} kCal</div>
            </div>
          </div>
          <q-btn
            flat
            color="primary"
            icon="edit"
            @click="openGoalDialog"
            label="Change Target"
            class="q-px-sm"
          />
        </div>
      </q-card>

      <!-- Goal Editing Dialog -->
      <q-dialog v-model="isEditingGoal" persistent>
        <q-card
          class="theme-dialog-card q-pa-md"
          style="
            width: 100%;
            max-width: 400px;
          "
        >
          <q-card-section>
            <div class="text-h6 text-weight-bold text-theme-title">Set Daily Calorie Target</div>
            <div class="text-caption text-theme-caption q-mb-md">
              Adjust your target to fit your fitness goals.
            </div>
            <q-input
              filled
              :dark="$q.dark.isActive"
              type="number"
              v-model.number="tempGoal"
              label="Calories (kCal)"
              autofocus
              dense
            />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Cancel" color="grey-6" v-close-popup />
            <q-btn unelevated label="Save" color="primary" @click="saveGoal" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- History List -->
      <div v-if="dailyIntake && Object.keys(dailyIntake).length > 0">
        <div v-for="key of sortedDateKeys" :key="key">
          <q-card class="glass-card q-pa-lg q-mb-lg text-theme-body">
            <!-- Card Header -->
            <div class="row items-center justify-between q-mb-md">
              <div>
                <div class="text-h6 text-weight-bold text-theme-title">{{ formatFriendlyDate(key) }}</div>
                <div class="text-caption text-theme-caption">{{ formatDateSublabel(key) }}</div>
              </div>
              <div class="text-right">
                <div class="text-subtitle1 text-weight-bold text-primary">
                  {{ getCalorieTotal(dailyIntake[key]) }}
                  <span class="text-caption text-theme-caption">/ {{ dailyCalorieGoal }} kCal</span>
                </div>
              </div>
            </div>

            <!-- Progress Bar -->
            <q-linear-progress
              :value="getProgress(getCalorieTotal(dailyIntake[key]))"
              :color="getProgressColor(getCalorieTotal(dailyIntake[key]))"
              class="q-mb-md"
              size="8px"
              rounded
            />

            <!-- Macros summary badge line -->
            <div class="row q-col-gutter-xs text-caption text-theme-subtitle q-mb-md">
              <div class="col-4">
                <div
                  class="bg-theme-card-preview q-pa-xs rounded text-center"
                >
                  <span class="text-accent text-weight-bold">P:</span>
                  {{ getNutrientTotal(dailyIntake[key], 'protein') }}g
                </div>
              </div>
              <div class="col-4">
                <div
                  class="bg-theme-card-preview q-pa-xs rounded text-center"
                >
                  <span class="text-secondary text-weight-bold">C:</span>
                  {{ getNutrientTotal(dailyIntake[key], 'carbs') }}g
                </div>
              </div>
              <div class="col-4">
                <div
                  class="bg-theme-card-preview q-pa-xs rounded text-center"
                >
                  <span class="text-warning text-weight-bold">F:</span>
                  {{ getNutrientTotal(dailyIntake[key], 'fat') }}g
                </div>
              </div>
            </div>

            <q-separator class="q-my-md" :dark="$q.dark.isActive" />

            <!-- Items List -->
            <q-list class="q-gutter-y-xs">
              <q-item
                v-for="(intake, index) in dailyIntake[key]"
                :key="index"
                class="q-pa-sm border-theme-light bg-theme-card-preview"
                style="
                  border-radius: 8px;
                "
              >
                <q-item-section>
                  <q-item-label class="text-weight-bold text-theme-title">{{ intake.food }}</q-item-label>
                  <q-item-label caption class="text-theme-caption q-mt-xs">
                    {{ intake.amount }}{{ intake.uom }} • {{ formatTime(intake.timeTaken) }}
                    <span
                      v-if="intake.protein || intake.carbs || intake.fat"
                      class="q-ml-xs text-theme-caption"
                    >
                      | P: {{ intake.protein || 0 }}g • C: {{ intake.carbs || 0 }}g • F:
                      {{ intake.fat || 0 }}g
                    </span>
                  </q-item-label>
                </q-item-section>

                <q-item-section side class="row items-center">
                  <div class="row items-center q-gutter-x-sm">
                    <span class="text-weight-bold text-primary">{{ intake.calories }} kCal</span>
                    <q-btn
                      flat
                      round
                      dense
                      color="negative"
                      icon="delete_outline"
                      size="sm"
                      @click="deleteSingleItem(key, index)"
                    />
                  </div>
                </q-item-section>
              </q-item>
            </q-list>

            <!-- Card Actions (Wipe Day) -->
            <q-card-actions align="right" class="q-mt-sm q-pa-none">
              <q-btn
                flat
                color="negative"
                icon="delete"
                label="Clear Day logs"
                size="sm"
                @click="confirmDeleteIntake(key)"
              />
            </q-card-actions>
          </q-card>
        </div>
      </div>

      <!-- Empty State -->
      <q-card
        v-else
        class="glass-card q-pa-xl text-center text-theme-body flex flex-center flex-col"
        style="min-height: 300px"
      >
        <q-icon name="history" size="64px" :color="$q.dark.isActive ? 'grey-8' : 'grey-4'" class="q-mb-md" />
        <div class="text-h6 text-weight-bold text-theme-title">No History Found</div>
        <div class="text-caption text-theme-caption q-mt-xs q-mb-lg" style="max-width: 300px">
          Once you record your draft logs, your daily tracking summaries will appear here.
        </div>
        <q-btn unelevated color="primary" label="Go to Dashboard" to="/" icon="dashboard" />
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { DailyIntake, Intakes } from 'src/types/types';
import { StorageSerializers, useStorage } from '@vueuse/core';
import { useQuasar } from 'quasar';

const $q = useQuasar();

const dailyIntake = useStorage<DailyIntake | null>('dailyIntake', null, undefined, {
  serializer: StorageSerializers.object,
});

const dailyCalorieGoal = useStorage('dailyCalorieGoal', 2000);
const isEditingGoal = ref(false);
const tempGoal = ref(dailyCalorieGoal.value);

// Sort date keys descending (newest first)
const sortedDateKeys = computed(() => {
  if (!dailyIntake.value) return [];
  return Object.keys(dailyIntake.value).sort((a, b) => b.localeCompare(a));
});

function openGoalDialog() {
  tempGoal.value = dailyCalorieGoal.value;
  isEditingGoal.value = true;
}

function saveGoal() {
  if (tempGoal.value > 0) {
    dailyCalorieGoal.value = tempGoal.value;
  }
  isEditingGoal.value = false;
}

function getProgress(currentCalories: number): number {
  if (dailyCalorieGoal.value <= 0) return 0;
  const ratio = currentCalories / dailyCalorieGoal.value;
  return ratio > 1 ? 1 : ratio;
}

function getProgressColor(currentCalories: number): string {
  const ratio = currentCalories / dailyCalorieGoal.value;
  if (ratio > 1) return 'negative';
  if (ratio > 0.8) return 'warning';
  return 'primary';
}

function formatFriendlyDate(key: string): string {
  if (key.length !== 8) return key;
  const year = parseInt(key.substring(0, 4));
  const month = parseInt(key.substring(4, 6)) - 1;
  const day = parseInt(key.substring(6, 8));
  const date = new Date(year, month, day);

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatDateSublabel(key: string): string {
  if (key.length !== 8) return '';
  const year = parseInt(key.substring(0, 4));
  const month = parseInt(key.substring(4, 6)) - 1;
  const day = parseInt(key.substring(6, 8));
  const date = new Date(year, month, day);

  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
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

function getCalorieTotal(intake: Intakes[] | undefined): number {
  if (!intake) return 0;
  return Number(intake.reduce((total, item) => total + item.calories, 0).toFixed(2));
}

function getNutrientTotal(
  intake: Intakes[] | undefined,
  nutrient: 'protein' | 'carbs' | 'fat',
): number {
  if (!intake) return 0;
  return Number(intake.reduce((total, item) => total + (item[nutrient] || 0), 0).toFixed(2));
}

function confirmDeleteIntake(dateKey: string) {
  $q.dialog({
    title: `Clear Day Logs?`,
    message: `Are you sure you want to clear all recorded calorie intakes for <strong>${formatFriendlyDate(dateKey)}</strong>?`,
    cancel: { flat: true, color: 'grey-6' },
    ok: { unelevated: true, color: 'negative', label: 'Clear' },
    html: true,
    class: 'theme-dialog-card',
  }).onOk(() => {
    deleteIntake(dateKey);
  });
}

function deleteIntake(dateKey: string) {
  if (dailyIntake.value && dailyIntake.value[dateKey]) {
    delete dailyIntake.value[dateKey];
  }
}

function deleteSingleItem(dateKey: string, index: number) {
  if (dailyIntake.value && dailyIntake.value[dateKey]) {
    $q.dialog({
      title: 'Delete Entry?',
      message: 'Are you sure you want to delete this specific log entry?',
      cancel: { flat: true, color: 'grey-6' },
      ok: { unelevated: true, color: 'negative', label: 'Delete' },
      class: 'theme-dialog-card',
    }).onOk(() => {
      if (dailyIntake.value && dailyIntake.value[dateKey]) {
        dailyIntake.value[dateKey].splice(index, 1);
        if (dailyIntake.value[dateKey].length === 0) {
          delete dailyIntake.value[dateKey];
        }
      }
    });
  }
}
</script>
