<template>
  <q-page class="q-pa-lg flex flex-center">
    <div style="width: 100%; max-width: 600px">
      <q-card class="glass-card q-pa-lg text-theme-body">
        <q-card-section class="q-pa-none q-mb-md">
          <div class="row items-center q-mb-xs">
            <q-icon name="upload_file" color="primary" size="28px" class="q-mr-sm" />
            <div class="text-h6 text-weight-bold text-theme-title">Import Food Library</div>
          </div>
          <div class="text-caption text-theme-caption">
            Paste a backup JSON configuration below to restore your custom food database library.
          </div>
        </q-card-section>

        <q-card-section class="q-px-none q-py-sm">
          <q-input
            type="textarea"
            filled
            :dark="$q.dark.isActive"
            v-model="importedData"
            label="JSON Data String"
            rows="8"
            class="q-mb-md"
            style="font-family: monospace"
          />
          <div class="row justify-between items-center q-mt-sm">
            <div class="text-caption text-theme-caption">
              Detected Size: <span class="text-weight-bold text-theme-title">{{ charSize }}</span>
            </div>
            <q-btn
              unelevated
              color="primary"
              label="Import Database"
              icon="publish"
              class="q-px-lg q-py-sm"
              @click="validateSchema"
              :disabled="!importedData"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { z, ZodError } from 'zod';
import { useQuasar } from 'quasar';
import { useStorage } from '@vueuse/core';
import type { FoodItem } from 'src/types/types';

const $q = useQuasar();
const importedData = ref<string | null>(null);
const foodItems = useStorage<FoodItem[]>('foodItems', []);

const charSize = computed(() => {
  let size = 0;
  if (importedData.value) {
    size = computeSize(importedData.value);
  }
  return translateSize(size);
});

function computeSize(chars: string): number {
  return new TextEncoder().encode(chars).length;
}

function translateSize(size: number): string {
  if (size < 1024) return size + ' B';
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB';
  return (size / (1024 * 1024)).toFixed(2) + ' MB';
}

function validateSchema() {
  let parsedJson = null;

  if (!importedData.value) return;

  try {
    parsedJson = JSON.parse(importedData.value);
  } catch (err: unknown) {
    let errorMessage = 'Failed to parse JSON string';

    if (err instanceof Error) errorMessage = err.message;
    else if (typeof err === 'string') errorMessage = err;

    $q.notify({
      message: errorMessage,
      color: 'negative',
      position: 'top',
      icon: 'error',
    });

    return;
  }

  const schema = z.object({
    intakes: z.array(
      z
        .object({
          id: z.number(),
          name: z.string(),
          calories: z.coerce.number(),
          per: z.coerce.number(),
          uom: z.string(),
          protein: z.coerce.number().optional(),
          carbs: z.coerce.number().optional(),
          fat: z.coerce.number().optional(),
        })
        .strict(),
    ),
  });

  try {
    const parsedData = schema.parse(parsedJson);
    foodItems.value = parsedData?.intakes as FoodItem[];
    importedData.value = '';

    $q.notify({
      message: `Successfully imported ${parsedData?.intakes.length} food items!`,
      position: 'top',
      color: 'positive',
      icon: 'done',
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof ZodError
        ? 'JSON format validation failed. Ensure correct field names and data types.'
        : 'Something went wrong during import';
    console.error('Validation error:', error);
    $q.notify({
      message: errorMessage,
      position: 'top',
      color: 'negative',
      icon: 'error',
    });
  }
}
</script>
