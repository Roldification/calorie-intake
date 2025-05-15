<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <p class="text-h6">Import Data</p>
      </q-card-section>

      <!-- the card body -->
      <q-card-section>
        <q-input type="textarea" v-model="importedData" label="Data"> </q-input>
        <div class="q-pa-sm">size: {{ charSize }}</div>
        <q-btn label="Import" @click="validateSchema"></q-btn>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { z, ZodError } from 'zod';
import { useQuasar } from 'quasar';
import { useStorage } from '@vueuse/core';

type FoodItem = {
  id: number;
  name: string;
  calories: string;
  per: string;
  uom: string;
};

const $q = useQuasar();
const importedData = ref<string | null>(null);
const foodItems = useStorage<FoodItem[]>('foodItems', []);

// watch(importedData, (value) => {
//   console.log('something2', value);
//   if (value) computeSize(value);
// });

const charSize = computed(() => {
  let size = 0;
  if (importedData.value) {
    size = computeSize(importedData.value);
  }
  return translateSize(size);
});

function computeSize(chars: string): number {
  const bytes = new TextEncoder().encode(chars).length;

  return bytes;
}

function translateSize(size: number): string {
  if (size < 1024) return size + 'bytes';
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + 'KB';
  return (size / (1024 * 1024)).toFixed(2) + 'MB';
}

function validateSchema() {
  let parsedJson = null;

  if (!importedData.value) return;

  try {
    parsedJson = JSON.parse(importedData.value);
  } catch (err: unknown) {
    let errorMessage = 'Something went wrong';

    if (err instanceof Error) errorMessage = err.message;
    else if (typeof err === 'string') errorMessage = err;

    $q.notify({
      message: errorMessage,
      color: 'negative',
      position: 'top',
    });

    return;
  }

  const schema = z.object({
    intakes: z.array(
      z
        .object({
          id: z.number(),
          name: z.string(),
          calories: z.string(),
          per: z.string(),
          uom: z.string(),
        })
        .strict(),
    ),
  });

  try {
    const parsedData = schema.parse(parsedJson);
    $q.notify({
      message: 'good!',
      position: 'top',
      color: 'positive',
    });
    console.log('parsedData', parsedData);

    foodItems.value = parsedData?.intakes;
  } catch (error: unknown) {
    const errorMessage = error instanceof ZodError ? error?.message : 'Something went wrong';

    $q.notify({
      message: errorMessage,
      position: 'top',
      color: 'negative',
    });
  }
}
</script>
