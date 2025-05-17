<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <p class="text-h6">Export Data</p>
      </q-card-section>

      <!-- body -->
      <q-card-section>
        <q-checkbox
          v-for="(item, key) in exportProps"
          :key="key"
          :label="item.label"
          v-model="item.value"
          :disable="!item.isActive"
        >
        </q-checkbox>

        <div class="q-mt-md">
          <q-btn @click="exportDataToClipboard" class="w-full" color="positive">
            Copy to Clipboard
          </q-btn>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useStorage } from '@vueuse/core';
import { useQuasar } from 'quasar';

const $q = useQuasar();

type FoodItem = {
  id: number;
  name: string;
  calories: number;
  per: number;
  uom: string;
};

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
    label: 'Intakes',
  },
  food: {
    value: false,
    isActive: true,
    label: 'Food Declarations',
  },
});

function exportDataToClipboard() {
  if (!exportProps.value.food.value) {
    $q.notify({
      message: 'Please select at least one type of data to Export',
      color: 'negative',
      position: 'top',
    });
    return;
  }

  const toBeExported = {
    intakes: foodItems.value,
  };

  const jsonStringExport = JSON.stringify(toBeExported);

  navigator.clipboard
    .writeText(jsonStringExport)
    .then(() => {
      $q.notify({
        message: 'Successfully copied the data to the clipboard',
        color: 'positive',
        position: 'top',
      });
    })
    .catch((err) => {
      console.log(err);
      $q.notify({
        message: 'Failed to copy to clipboard',
        color: 'negative',
        position: 'top',
      });
    });
}
</script>

<style>
.w-full {
  width: 100%;
}
</style>
