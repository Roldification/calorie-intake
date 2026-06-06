<template>
  <q-page class="q-pa-lg flex flex-center">
    <div style="width: 100%; max-width: 600px">
      <q-card class="glass-card q-pa-lg text-theme-body">
        <q-card-section class="q-pa-none q-mb-md">
          <div class="row items-center q-mb-xs">
            <q-icon name="download" color="primary" size="28px" class="q-mr-sm" />
            <div class="text-h6 text-weight-bold text-theme-title">Export Food Library</div>
          </div>
          <div class="text-caption text-theme-caption">
            Export your custom food database to the clipboard so you can back it up or restore it on
            other devices.
          </div>
        </q-card-section>

        <q-card-section class="q-px-none q-py-sm">
          <div class="q-gutter-y-sm q-mb-lg">
            <q-checkbox
              v-for="(item, key) in exportProps"
              :key="key"
              :label="item.label"
              v-model="item.value"
              :disable="!item.isActive"
              :dark="$q.dark.isActive"
              color="primary"
              class="text-weight-medium"
            >
            </q-checkbox>
          </div>

          <div>
            <q-btn
              unelevated
              color="primary"
              class="w-full q-py-sm text-weight-bold"
              icon="content_copy"
              label="Copy Backup JSON to Clipboard"
              @click="exportDataToClipboard"
              :disabled="foodItems.length === 0"
            />
          </div>

          <div v-if="foodItems.length === 0" class="text-caption text-negative q-mt-sm text-center">
            No food items found in library to export.
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useStorage } from '@vueuse/core';
import { useQuasar } from 'quasar';
import type { FoodItem } from 'src/types/types';

const $q = useQuasar();

const foodItems = useStorage<FoodItem[]>('foodItems', []);

const exportProps = ref<{
  intakes: {
    value: boolean;
    isActive: boolean;
    label: string;
  };
  food: {
    value: boolean;
    isActive: boolean;
    label: string;
  };
}>({
  intakes: {
    value: false,
    isActive: false,
    label: 'Intake History logs (Coming Soon)',
  },
  food: {
    value: true,
    isActive: true,
    label: 'Food Library declarations',
  },
});

function exportDataToClipboard() {
  if (!exportProps.value.food.value) {
    $q.notify({
      message: 'Please select at least one type of data to export.',
      color: 'warning',
      position: 'top',
      icon: 'warning',
    });
    return;
  }

  const toBeExported = {
    intakes: foodItems.value,
  };

  const jsonStringExport = JSON.stringify(toBeExported, null, 2);

  navigator.clipboard
    .writeText(jsonStringExport)
    .then(() => {
      $q.notify({
        message: 'Database backup copied to clipboard!',
        color: 'positive',
        position: 'top',
        icon: 'done',
      });
    })
    .catch((err) => {
      console.error('Clipboard copy failed:', err);
      $q.notify({
        message: 'Failed to copy to clipboard',
        color: 'negative',
        position: 'top',
        icon: 'error',
      });
    });
}
</script>

<style scoped>
.w-full {
  width: 100%;
}
</style>
