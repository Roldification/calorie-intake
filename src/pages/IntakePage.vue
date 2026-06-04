<template>
  <q-page class="q-pa-lg flex flex-center">
    <div style="width: 100%; max-width: 600px">
      <q-card v-if="store.intakes.length" class="glass-card q-pa-lg text-white">
        <div class="row items-center justify-between q-mb-md">
          <div>
            <div class="text-h6 text-weight-bold">Current Draft Intake</div>
            <div class="text-caption text-grey-5">These items are unsaved draft logs</div>
          </div>
          <q-btn
            flat
            dense
            color="negative"
            label="Reset All"
            icon="restart_alt"
            @click="confirmReset"
          />
        </div>

        <q-table
          flat
          style="background: transparent"
          :rows="store.intakes"
          row-key="id"
          class="q-mb-md text-white hide-header-borders"
          separator="none"
          :columns="columns"
          hide-pagination
          :pagination="{ rowsPerPage: 0 }"
          dark
        >
          <template v-slot:body="props">
            <q-tr :props="props" class="hover-bg-opacity">
              <q-td key="food" :props="props" class="text-left">
                <div class="text-weight-bold text-white">{{ props.row.food }}</div>
                <div class="text-caption text-grey-5">
                  {{ props.row.amount }} {{ props.row.uom }}
                  <span
                    v-if="props.row.protein || props.row.carbs || props.row.fat"
                    class="text-grey-6 q-ml-xs"
                  >
                    • P: {{ props.row.protein || 0 }}g | C: {{ props.row.carbs || 0 }}g | F:
                    {{ props.row.fat || 0 }}g
                  </span>
                </div>
              </q-td>
              <q-td key="calories" :props="props" class="text-right text-weight-bold text-primary">
                {{ props.row.calories }} kCal
              </q-td>
              <q-td key="actions" :props="props" class="text-center">
                <q-btn
                  color="negative"
                  icon="delete_outline"
                  @click="store.removeIntake(props.rowIndex)"
                  flat
                  round
                  size="sm"
                />
              </q-td>
            </q-tr>
          </template>
        </q-table>

        <q-separator class="q-my-md" style="background: rgba(255, 255, 255, 0.08)" />

        <div class="row items-center justify-between q-pt-sm">
          <div>
            <div class="text-subtitle2 text-grey-5">Subtotal Calories</div>
            <div class="text-h5 text-weight-bold text-white">
              {{ store.intakes.reduce((acc, item) => acc + item.calories, 0).toFixed(2) }}
              <span class="text-subtitle1 text-grey-5">kCal</span>
            </div>
            <div class="text-caption text-grey-5 q-mt-xs">
              P: {{ store.intakes.reduce((acc, item) => acc + (item.protein || 0), 0).toFixed(2) }}g
              | C: {{ store.intakes.reduce((acc, item) => acc + (item.carbs || 0), 0).toFixed(2) }}g
              | F: {{ store.intakes.reduce((acc, item) => acc + (item.fat || 0), 0).toFixed(2) }}g
            </div>
          </div>
          <q-btn
            unelevated
            @click="saveDailyIntake"
            label="Save Intake Log"
            icon="check"
            color="primary"
            class="q-px-lg q-py-sm"
          />
        </div>
      </q-card>

      <!-- Empty State -->
      <q-card
        v-else
        class="glass-card q-pa-xl text-center text-white flex flex-center flex-col"
        style="min-height: 300px"
      >
        <q-icon name="dining" size="64px" color="grey-8" class="q-mb-md" />
        <div class="text-h6 text-weight-bold">No Active Draft Intakes</div>
        <div class="text-caption text-grey-5 q-mt-xs q-mb-lg" style="max-width: 300px">
          Go to the Dashboard page, tap any food from your library, and enter an amount to draft an
          intake.
        </div>
        <q-btn unelevated color="primary" label="Go to Dashboard" to="/" icon="dashboard" />
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useCounterStore } from 'src/stores/example-store';
import type { Column, DailyIntake } from 'src/types/types';
import { StorageSerializers, useStorage } from '@vueuse/core';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const store = useCounterStore();

const columns: Column[] = [
  {
    name: 'food',
    label: 'Food Item',
    align: 'left',
    field: 'food',
    style: 'max-width: 40vw; overflow: hidden; text-overflow: ellipsis !important; ',
  },
  { name: 'calories', label: 'Calories', field: 'calories', align: 'right' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' },
];

const dailyIntake = useStorage<DailyIntake | null>('dailyIntake', null, undefined, {
  serializer: StorageSerializers.object,
});

function confirmReset() {
  $q.dialog({
    title: '<span class="text-white text-weight-bold">Reset Intake?</span>',
    message:
      '<span class="text-grey-4">Are you sure you want to clear your current draft intake log?</span>',
    cancel: { flat: true, color: 'grey-5' },
    ok: { unelevated: true, color: 'negative', label: 'Clear' },
    html: true,
    class: 'glass-card bg-dark text-white',
  }).onOk(() => {
    store.resetIntakes();
  });
}

function saveDailyIntake() {
  if (!store.intakes.length) return;

  const dateKey = formatDateForKey(new Date());
  console.log('date key:', dateKey);
  const intakes = store.intakes.map((intake) => ({
    timeTaken: new Date(),
    food: intake.food,
    amount: intake.amount,
    uom: intake.uom,
    calories: intake.calories,
    protein: intake.protein || 0,
    carbs: intake.carbs || 0,
    fat: intake.fat || 0,
  }));
  const dailyIntakeData: DailyIntake = {
    [dateKey]: intakes,
  };

  if (dailyIntake.value) {
    if (dailyIntake.value[dateKey]) dailyIntake.value[dateKey].push(...intakes);
    else dailyIntake.value[dateKey] = intakes;
  } else {
    console.log('Adding new daily intake data:', dailyIntakeData);
    dailyIntake.value = dailyIntakeData;
  }

  store.resetIntakes();
  $q.notify({
    message: 'Intake recorded successfully!',
    color: 'positive',
    icon: 'done',
    position: 'top',
  });
}

function formatDateForKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}
</script>

<style scoped>
.hover-bg-opacity:hover {
  background: rgba(255, 255, 255, 0.02);
}
</style>
