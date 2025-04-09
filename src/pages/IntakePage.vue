<template>
   <q-page class="q-pa-md">
    
    <div v-if="store.intakes.length" class="q-pa-md items-center justify-center q-gutter-md" style="display: flex; flex-direction: column;">
        <q-btn label="Reset Intake" icon="restart_alt" @click="store.resetIntakes" />
        <q-table
        style="width: 100%;"
            :rows="store.intakes"
            row-key="id"
            class="q-mb-md"
            bordered
            separator="horizontal"
            :columns="columns"
        >


            <template v-slot:body="props">
                <q-tr :props="props">
                    <q-td key="food" :props="props" class="text-left">
                       {{ props.row.food }} sdf
                       <div style="font-size: smaller;">{{ props.row.amount }}{{ props.row.uom }}</div>
                    </q-td>
                    <q-td key="calories" :props="props" class="text-right">
                        {{ props.row.calories }} kCal
                        
                    </q-td>
                    <q-td key="actions" :props="props" class="text-center">
                        <q-btn color="negative" icon="delete" @click="store.removeIntake(props.row.id)" flat round size="md" />
                    </q-td>
                </q-tr>
            </template>
        </q-table>
        <div>
            Total Calories: {{ (store.intakes.reduce((acc, item) => acc + item.calories, 0)).toFixed(2) }} kCal
        </div>
        <div>
            <q-btn @click="saveDailyIntake" label="Record Intake" icon="save" class="q-mt-md" color="primary" />
        </div>
    </div>
    <div v-else class="row q-pa-md items-center justify-center q-gutter-md">
        No intakes yet. Please add food items to your intake.
    </div>
</q-page>
    
</template>

<script setup lang="ts">
import { useCounterStore } from 'src/stores/example-store';
import type { Column, DailyIntake } from 'src/types/types';
import { StorageSerializers, useStorage } from '@vueuse/core';

const columns:  Column[] = [
    { name: 'food', label: 'Food Item', align: 'left', field: 'food', style: 'max-width: 35vw; overflow: hidden; text-overflow: ellipsis !important; ' },
    { name: 'calories', label: 'Calories', field: 'calories' },
    { name: 'actions', label: 'Actions',  field: 'actions' }
]

const dailyIntake = useStorage<DailyIntake | null>('dailyIntake', null, undefined, {serializer: StorageSerializers.object}) ;

function saveDailyIntake() {

    if (!store.intakes.length) return; // No intakes to save

    const dateKey = formatDateForKey(new Date());
    console.log('date key:', dateKey);
    const intakes = store.intakes.map(intake => ({
        timeTaken: new Date(),
        food: intake.food,
        amount: intake.amount,
        uom: intake.uom,
        calories: intake.calories,
    }));
    const dailyIntakeData: DailyIntake = {
        [dateKey]: intakes
    };

    if (dailyIntake.value) {
        // If the date key already exists, append the new intake data to it
        if (dailyIntake.value[dateKey])
            dailyIntake.value[dateKey].push(...intakes);
        else 
            dailyIntake.value[dateKey] = intakes; // Add new date key with intakes
    } else {
        // If the date key doesn't exist, create a new entry
        console.log('Adding new daily intake data:', dailyIntakeData);
        dailyIntake.value = dailyIntakeData;
    }

    // Reset the intakes in the store after saving
    store.resetIntakes();

}

function formatDateForKey(date: Date) {
    // format the date to YYYYMMDD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

const store = useCounterStore();
</script>
