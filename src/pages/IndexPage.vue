<template>
  <q-page class="q-pa-md">
      <div class="flex flex-col items-center justify-center q-gutter-md">
        <q-btn
          class="q-mb-md"
          color="primary"
          label="Add Food"
          @click="isAddingFood = true"
          icon="add"
          />
          <q-btn
          v-show="!isRemovingFood"
          class="q-mb-md"
          color="negative"
          outline 
          label="Remove Food"
          @click="isRemovingFood = true"
          icon="delete"
          />
          <q-btn
          v-show="isRemovingFood"
          class="q-mb-md"
          color="warning"
          label="Cancel"
          @click="isRemovingFood = false"
          icon="cancel"
          />
      </div>
      <div v-if="!foodItems.length" class="row q-pa-md items-center justify-center q-gutter-md">
        No food items yet. Please add food items to your list.
      </div>
      <div v-else class="" style="width: 100%;">
        <q-input
          filled
          v-model="foodItemName"
          label="Search Food"
          debounce="300"
          class="q-mb-md"
        >
        <template v-slot:prepend>
          <q-icon name="search" />
        </template>
        </q-input>
        <q-list bordered separator>
          <q-item clickable v-ripple v-for="item in filteredFoodItems" :key="item.id" @click="isRemovingFood ? removeFoodItem(item) : addIntake(item)">
            <q-item-section>
              <q-item-label :style="{color: isRemovingFood ? 'red' : ''}">{{item.name}}

                <q-badge v-if="isRemovingFood" color="red" floating>-</q-badge>
              </q-item-label> 
              <q-item-label caption>{{ item.calories }}kCal per {{ item.per }}{{ item.uom }}</q-item-label>
            </q-item-section>
           </q-item>
        </q-list>
      </div>
      <q-dialog v-model="isAddingFood" persistent >
      <q-card style="width: 95%">
        <q-form class="q-gutter-md" @submit="addFoodItem()" @reset="resetFoodItem">
        <div>
          
            <q-card-section>
              <q-input
                filled
                v-model="foodItem.name"
                label="Food Name"
                lazy-rules
                :rules="[ val => !!val || 'Please type something' ]"
              />
              <q-input
                filled
                v-model="foodItem.calories"
                label="Calories"
                lazy-rules
                :rules="[ val => !!val || 'Please type something' ]"
              />
              <q-input
                filled
                v-model="foodItem.per"
                label="Per"
                lazy-rules
                :rules="[ val => !!val || 'Please type something' ]"
              />
              <q-select
                filled
                v-model="foodItem.uom"
                :options = "store.uoms"
                label="UOM"
                lazy-rules
                :rules="[ val => !!val || 'Please type something' ]"
                emit-value
              />
            </q-card-section>

          
        </div>

        <q-card-actions align="right">
          <q-btn flat label="Save" color="primary" type="submit" />
          <q-btn flat label="Cancel" color="" v-close-popup />
        </q-card-actions>
      </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="isAddingIntake" persistent>
      <q-card style="width: 95%">
        <q-card-section>
          <div class="text-h6">{{ intakeProps.food }}</div>
          <div>
            <q-input
              filled
              v-model="intakeProps.amount"
              :label="`Amount (${intakeProps.uom})`"
              lazy-rules
            />
           
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Save" color="primary" @click="saveIntake" />
          <q-btn flat label="Close" color="" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCounterStore } from 'src/stores/example-store';
import { useStorage } from '@vueuse/core';
import { useQuasar } from 'quasar';

const $q = useQuasar();

const store = useCounterStore();

const isRemovingFood = ref(false);



type FoodItem = {
  id: number;
  name: string;
  calories: number;
  per: number;
  uom: string;
};

const foodItems = useStorage<FoodItem[]>('foodItems',[]);
const foodItemName = ref('');

const foodItem = ref<FoodItem>({
  id: 0,
  name: '',
  calories: 0,
  per: 0,
  uom: '',
});

const filteredFoodItems = computed(() => {
  return foodItems.value.filter((item) => {
    return item.name.toLowerCase().includes(foodItemName.value.toLowerCase());
  });
});

function removeFoodItem(item: FoodItem) {

  $q.dialog({
        title: `Remove ${item.name}?`,
        message: 'Removing this food item will delete it from the list. This action will also reset the intake.',
        cancel: true,
      }).onOk(() => {
         const index = foodItems.value.findIndex((food) => food.id === item.id);
  if (index !== -1) {
    foodItems.value.splice(index, 1);
  }

    store.resetIntakes();
      })

 
}


function addFoodItem() {
  console.log('Adding food item:', foodItem.value);
  foodItems.value.push({
    id: foodItems.value.length + 1,
    name: foodItem.value.name,
    calories: foodItem.value.calories,
    per: foodItem.value.per,
    uom: foodItem.value.uom,
  });
  isAddingFood.value = false;
  resetFoodItem();
}

function resetFoodItem() {
  foodItem.value.calories = 0;
  foodItem.value.name = '';
  foodItem.value.per = 0;
  foodItem.value.uom = '';
  foodItem.value.id = 0;
}


const isAddingFood = ref(false);
const isAddingIntake = ref(false);

const intakeProps = ref<{
  food: string;
  amount: number | null;
  uom: string;
  calories: number | null;
  per: number;
}>({
  food: "",
  amount: null,
  uom: "",
  calories: null,
  per: 0,
})

function addIntake(row: FoodItem) {
  isAddingIntake.value = true;
  intakeProps.value.food = row.name;
  intakeProps.value.uom = row.uom;
  intakeProps.value.calories = row.calories;
  intakeProps.value.per = row.per;
}

function saveIntake() {
  console.log('Saving intake:', intakeProps.value);
  store.addIntake({
    food: intakeProps.value.food,
    amount: Number(intakeProps.value.amount) || 0,
    uom: intakeProps.value.uom,
    calories: computeCalories(intakeProps.value.calories || 0, intakeProps.value.amount || 0, intakeProps.value.per),
  });
  isAddingIntake.value = false;
}

function computeCalories(kCal: number, amount: number, per: number) : number {
  const result = (kCal / per) * amount;
  return Number(result.toFixed(2));
}

</script>
