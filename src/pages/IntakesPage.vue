<template>
    <q-page class="q-pa-md">
       <div v-for="(value, keyx) of Object.keys(dailyIntake ?? {})" :key="keyx" >
            <q-card v-if="dailyIntake" class="q-mb-md" style="width: 100%; max-width: 400px;">
                <q-card-section>
                    <div class="" style="display: flex; width: 100%; flex-direction: row;  justify-content: space-between; "><span class="text-h6">{{ value }}</span> <span>{{ getCalorieTotal(dailyIntake[value]) }} kCal</span></div>
                    <div v-for="(intake, index) in dailyIntake[value]" :key="index" class="q-mb-md">
                        <div class="text-h6">{{ intake.food }}</div>
                        <div class="text-subtitle2">Calories: {{ intake.calories }} kCal</div>
                        <div class="text-subtitle2">Amount: {{ intake.amount }} {{ intake.uom }}</div>
                        <div class="text-subtitle2">Time: {{ formatDateTime(intake.timeTaken) }}</div>
                    </div>
                </q-card-section>
            </q-card>
        </div>

        <div v-if="!dailyIntake" class="row q-pa-md items-center justify-center q-gutter-md">
            No intakes yet. Please add food items to your intake.
       </div>
    </q-page>
</template>

<script setup lang="ts">
import type { DailyIntake, Intakes } from 'src/types/types';
import { StorageSerializers, useStorage } from '@vueuse/core';

const dailyIntake = useStorage<DailyIntake | null>('dailyIntake', null, undefined, {serializer: StorageSerializers.object}) ;
console.log('Daily Intakes:', dailyIntake.value);

function formatDateTime(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(date).toLocaleString('en-US', options);
}

function getCalorieTotal(intake: Intakes[] | undefined): number {
    if (!intake) return 0; // Return 0 if intake is undefined or empty
    return Number(intake.reduce((total, item) => total + item.calories, 0).toFixed(2));
}



</script>