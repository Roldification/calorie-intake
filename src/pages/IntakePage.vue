<template>
   <q-page class="q-pa-md">
    <div v-if="store.intakes.length" class="q-pa-md items-center justify-center q-gutter-md" style="display: flex; flex-direction: column;">
        <q-btn label="Reset Intake" icon="restart_alt" @click="store.resetIntakes" />
        <q-table
            :rows="store.intakes"
            row-key="id"
            class="q-mb-md"
            bordered
            separator="horizontal"
        />
        <div>
            Total Calories: {{ store.intakes.reduce((acc, item) => acc + item.calories, 0) }} kCal
        </div>
    </div>
    <div v-else class="row q-pa-md items-center justify-center q-gutter-md">
        No intakes yet. Please add food items to your intake.
    </div>
</q-page>
    
</template>

<script setup lang="ts">
import { useCounterStore } from 'src/stores/example-store';
const store = useCounterStore();
</script>
