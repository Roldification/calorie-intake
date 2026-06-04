<template>
  <q-page class="q-pa-lg">
    <div class="row q-col-gutter-lg justify-center">
      <!-- Left / Top: Dashboard Stats -->
      <div class="col-12 col-md-5">
        <q-card
          class="glass-card q-pa-lg flex flex-center flex-col text-center"
          style="min-height: 380px"
        >
          <div class="text-h6 text-weight-bold q-mb-xs text-white">Today's Progress</div>
          <div class="text-caption text-grey-5 q-mb-md">Calorie & Macro Intake</div>

          <q-circular-progress
            show-value
            class="text-white q-my-md font-weight-bold"
            :value="getProgress(todayTotalCalories) * 100"
            size="170px"
            :thickness="0.12"
            :color="getProgressColor(todayTotalCalories)"
            track-color="grey-9"
          >
            <div class="text-center">
              <div class="text-h4 text-weight-bold text-white">{{ todayTotalCalories }}</div>
              <div class="text-caption text-grey-5">/ {{ dailyCalorieGoal }} kCal</div>
            </div>
          </q-circular-progress>

          <!-- Macro bars grid -->
          <div class="row q-col-gutter-md q-mt-md justify-center" style="width: 100%">
            <!-- Protein -->
            <div class="col-4 text-center">
              <div class="text-caption text-grey-4 text-weight-bold">Protein</div>
              <q-linear-progress
                :value="todayTotalProtein / proteinGoal"
                color="accent"
                size="6px"
                rounded
                class="q-mt-xs"
              />
              <div class="text-caption text-weight-medium q-mt-xs text-accent">
                {{ todayTotalProtein }}g<span class="text-grey-6">/{{ proteinGoal }}g</span>
              </div>
            </div>
            <!-- Carbs -->
            <div class="col-4 text-center">
              <div class="text-caption text-grey-4 text-weight-bold">Carbs</div>
              <q-linear-progress
                :value="todayTotalCarbs / carbsGoal"
                color="secondary"
                size="6px"
                rounded
                class="q-mt-xs"
              />
              <div class="text-caption text-weight-medium q-mt-xs text-secondary">
                {{ todayTotalCarbs }}g<span class="text-grey-6">/{{ carbsGoal }}g</span>
              </div>
            </div>
            <!-- Fat -->
            <div class="col-4 text-center">
              <div class="text-caption text-grey-4 text-weight-bold">Fat</div>
              <q-linear-progress
                :value="todayTotalFat / fatGoal"
                color="warning"
                size="6px"
                rounded
                class="q-mt-xs"
              />
              <div class="text-caption text-weight-medium q-mt-xs text-warning">
                {{ todayTotalFat }}g<span class="text-grey-6">/{{ fatGoal }}g</span>
              </div>
            </div>
          </div>
        </q-card>

        <!-- Actions Card -->
        <q-card class="glass-card q-pa-md q-mt-lg text-center">
          <div class="row q-gutter-sm justify-center">
            <q-btn
              color="primary"
              label="Add New Food"
              @click="isAddingFood = true"
              icon="add"
              class="q-px-md"
            />
            <q-btn
              v-show="!isRemovingFood && foodItems.length"
              color="negative"
              outline
              label="Remove Food"
              @click="isRemovingFood = true"
              icon="delete"
              class="q-px-md"
            />
            <q-btn
              v-show="isRemovingFood && foodItems.length"
              color="warning"
              label="Done Removing"
              @click="isRemovingFood = false"
              icon="check"
              class="q-px-md"
            />
          </div>
        </q-card>
      </div>

      <!-- Right / Bottom: Food List Database -->
      <div class="col-12 col-md-7">
        <q-card class="glass-card q-pa-lg" style="height: 100%; min-height: 480px">
          <div class="text-h6 text-weight-bold text-white q-mb-xs">Food Library</div>
          <div class="text-caption text-grey-5 q-mb-md">Tap an item below to log an intake</div>

          <div
            v-if="!foodItems.length"
            class="flex flex-center q-pa-xl text-grey-5"
            style="height: 350px"
          >
            <div class="text-center">
              <q-icon name="restaurant_menu" size="64px" color="grey-8" class="q-mb-md" />
              <div class="text-subtitle1 text-weight-medium">Your Library is Empty</div>
              <div class="text-caption q-mt-xs">
                Add custom foods or import a library using the sidebar.
              </div>
            </div>
          </div>
          <div v-else>
            <q-input
              filled
              v-model="foodItemName"
              label="Search Food Library"
              debounce="300"
              class="q-mb-md"
              dense
              dark
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
              <template v-slot:append v-if="foodItemName">
                <q-icon name="close" @click="foodItemName = ''" class="cursor-pointer" />
              </template>
            </q-input>

            <q-scroll-area style="height: 360px" dark class="q-pr-sm">
              <q-list separator>
                <q-item
                  clickable
                  v-ripple
                  v-for="item in filteredFoodItems"
                  :key="item.id"
                  @click="isRemovingFood ? removeFoodItem(item) : addIntake(item)"
                  class="q-py-md q-my-xs text-white"
                  style="
                    border-radius: 12px;
                    transition: all 0.2s;
                    border: 1px solid rgba(255, 255, 255, 0.03);
                  "
                  :class="isRemovingFood ? 'bg-red-10 bg-opacity-20 border-red' : 'hover-bg-grey-9'"
                >
                  <q-item-section>
                    <q-item-label
                      class="text-weight-bold"
                      :class="isRemovingFood ? 'text-red' : 'text-white'"
                    >
                      {{ item.name }}
                      <q-badge v-if="isRemovingFood" color="red" class="q-ml-sm">-</q-badge>
                    </q-item-label>
                    <q-item-label caption class="text-grey-5 q-mt-xs">
                      <span class="text-primary text-weight-bold">{{ item.calories }} kCal</span>
                      per {{ item.per }}{{ item.uom }}
                      <span
                        v-if="item.protein || item.carbs || item.fat"
                        class="q-ml-xs text-grey-6"
                      >
                        • P: {{ item.protein || 0 }}g | C: {{ item.carbs || 0 }}g | F:
                        {{ item.fat || 0 }}g
                      </span>
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      v-if="isRemovingFood"
                      color="negative"
                      icon="remove_circle"
                      flat
                      round
                      dense
                    />
                    <q-icon v-else name="chevron_right" color="grey-6" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-scroll-area>
          </div>
        </q-card>
      </div>
    </div>

    <!-- Dialogs -->
    <q-dialog v-model="isAddingFood" persistent>
      <q-card
        class="glass-card q-pa-md text-white"
        style="
          width: 100%;
          max-width: 450px;
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.1);
        "
      >
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">Add Custom Food</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-form class="q-gutter-md q-mt-xs" @submit="addFoodItem()" @reset="resetFoodItem">
          <q-card-section class="q-py-xs q-gutter-y-sm">
            <q-input
              filled
              dark
              v-model="foodItem.name"
              label="Food Name"
              lazy-rules
              :rules="[(val) => !!val || 'Please type something']"
              dense
            />
            <q-input
              filled
              dark
              type="number"
              :min="0"
              v-model.number="foodItem.calories"
              label="Calories"
              lazy-rules
              :rules="[(val) => (val !== null && val !== undefined) || 'Please type something']"
              dense
            />
            <div class="row q-col-gutter-sm">
              <div class="col-4">
                <q-input
                  filled
                  dark
                  type="number"
                  step="0.1"
                  :min="0"
                  v-model.number="foodItem.protein"
                  label="Protein (g)"
                  lazy-rules
                  :rules="[(val) => validateMacros()]"
                  dense
                />
              </div>
              <div class="col-4">
                <q-input
                  filled
                  dark
                  type="number"
                  step="0.1"
                  :min="0"
                  v-model.number="foodItem.carbs"
                  label="Carbs (g)"
                  lazy-rules
                  :rules="[(val) => validateMacros()]"
                  dense
                />
              </div>
              <div class="col-4">
                <q-input
                  filled
                  dark
                  type="number"
                  step="0.1"
                  :min="0"
                  v-model.number="foodItem.fat"
                  label="Fat (g)"
                  lazy-rules
                  :rules="[(val) => validateMacros()]"
                  dense
                />
              </div>
            </div>
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-input
                  filled
                  dark
                  type="number"
                  :min="0"
                  v-model.number="foodItem.per"
                  label="Serving Size"
                  lazy-rules
                  :rules="[(val) => !!val || 'Please type something', (val) => validateMacros()]"
                  dense
                />
              </div>
              <div class="col-6">
                <q-select
                  filled
                  dark
                  v-model="foodItem.uom"
                  :options="store.uoms"
                  label="Unit"
                  lazy-rules
                  :rules="[(val) => !!val || 'Please type something', (val) => validateMacros()]"
                  emit-value
                  dense
                />
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-pt-none">
            <q-btn flat label="Cancel" color="grey-5" v-close-popup />
            <q-btn unelevated label="Save Food" color="primary" type="submit" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="isAddingIntake" persistent>
      <q-card
        class="glass-card q-pa-md text-white"
        style="
          width: 100%;
          max-width: 400px;
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.1);
        "
      >
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">{{ intakeProps.food }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-py-md">
          <div class="text-caption text-grey-5 q-mb-md">
            Enter the intake quantity relative to the default serving.
          </div>
          <q-input
            filled
            dark
            type="number"
            :min="0"
            v-model.number="intakeProps.amount"
            :label="`Amount (${intakeProps.uom})`"
            lazy-rules
            autofocus
            dense
          />

          <!-- Live Preview -->
          <div
            class="row q-col-gutter-xs text-center q-mt-md"
            v-if="intakeProps.amount && intakeProps.amount > 0"
          >
            <div class="col-12 q-mb-sm text-subtitle2 text-grey-4 text-left">
              Nutritional Preview:
            </div>
            <div class="col-3">
              <div
                class="q-pa-xs rounded text-primary text-weight-bold"
                style="background: rgba(255, 255, 255, 0.03)"
              >
                {{ previewCalories }}
                <div class="text-caption text-grey-5 font-size-xs">kCal</div>
              </div>
            </div>
            <div class="col-3">
              <div
                class="q-pa-xs rounded text-accent text-weight-bold"
                style="background: rgba(255, 255, 255, 0.03)"
              >
                {{ previewProtein }}g
                <div class="text-caption text-grey-5 font-size-xs">Pro</div>
              </div>
            </div>
            <div class="col-3">
              <div
                class="q-pa-xs rounded text-secondary text-weight-bold"
                style="background: rgba(255, 255, 255, 0.03)"
              >
                {{ previewCarbs }}g
                <div class="text-caption text-grey-5 font-size-xs">Carb</div>
              </div>
            </div>
            <div class="col-3">
              <div
                class="q-pa-xs rounded text-warning text-weight-bold"
                style="background: rgba(255, 255, 255, 0.03)"
              >
                {{ previewFat }}g
                <div class="text-caption text-grey-5 font-size-xs">Fat</div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pt-none">
          <q-btn flat label="Close" color="grey-5" v-close-popup />
          <q-btn unelevated label="Add to Intake" color="primary" @click="saveIntake" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useCounterStore } from 'src/stores/example-store';
import { useStorage, StorageSerializers } from '@vueuse/core';
import { useQuasar } from 'quasar';
import type { DailyIntake, FoodItem } from 'src/types/types';

const $q = useQuasar();
const store = useCounterStore();

const dailyCalorieGoal = useStorage('dailyCalorieGoal', 2000);
const dailyIntake = useStorage<DailyIntake | null>('dailyIntake', null, undefined, {
  serializer: StorageSerializers.object,
});

const proteinGoal = ref(130);
const carbsGoal = ref(220);
const fatGoal = ref(70);

function formatDateForKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

const todayTotalCalories = computed(() => {
  let total = 0;
  const dateKey = formatDateForKey(new Date());

  if (dailyIntake.value && dailyIntake.value[dateKey]) {
    total += dailyIntake.value[dateKey].reduce((sum, item) => sum + item.calories, 0);
  }

  total += store.intakes.reduce((sum, item) => sum + item.calories, 0);

  return Number(total.toFixed(2));
});

const todayTotalProtein = computed(() => {
  let total = 0;
  const dateKey = formatDateForKey(new Date());

  if (dailyIntake.value && dailyIntake.value[dateKey]) {
    total += dailyIntake.value[dateKey].reduce((sum, item) => sum + (item.protein || 0), 0);
  }

  total += store.intakes.reduce((sum, item) => sum + (item.protein || 0), 0);

  return Number(total.toFixed(2));
});

const todayTotalCarbs = computed(() => {
  let total = 0;
  const dateKey = formatDateForKey(new Date());

  if (dailyIntake.value && dailyIntake.value[dateKey]) {
    total += dailyIntake.value[dateKey].reduce((sum, item) => sum + (item.carbs || 0), 0);
  }

  total += store.intakes.reduce((sum, item) => sum + (item.carbs || 0), 0);

  return Number(total.toFixed(2));
});

const todayTotalFat = computed(() => {
  let total = 0;
  const dateKey = formatDateForKey(new Date());

  if (dailyIntake.value && dailyIntake.value[dateKey]) {
    total += dailyIntake.value[dateKey].reduce((sum, item) => sum + (item.fat || 0), 0);
  }

  total += store.intakes.reduce((sum, item) => sum + (item.fat || 0), 0);

  return Number(total.toFixed(2));
});

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

const isRemovingFood = ref(false);

const foodItems = useStorage<FoodItem[]>('foodItems', []);
const foodItemName = ref('');

const foodItem = ref<FoodItem>({
  id: 0,
  name: '',
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  per: 100,
  uom: 'g',
});

const filteredFoodItems = computed(() => {
  return foodItems.value.filter((item) => {
    return item.name.toLowerCase().includes(foodItemName.value.toLowerCase());
  });
});

function removeFoodItem(item: FoodItem) {
  $q.dialog({
    title: `<span class="text-white text-weight-bold">Remove ${item.name}?</span>`,
    message: `<span class="text-grey-4">Removing this food item will delete it from your library. Past daily intake records are unaffected.</span>`,
    cancel: { flat: true, color: 'grey-5' },
    ok: { unelevated: true, color: 'negative', label: 'Delete' },
    html: true,
    class: 'glass-card bg-dark text-white',
  }).onOk(() => {
    const index = foodItems.value.findIndex((food) => food.id === item.id);
    if (index !== -1) {
      foodItems.value.splice(index, 1);
      if (foodItems.value.length === 0) isRemovingFood.value = false;
    }
  });
}

function addFoodItem() {
  console.log('Adding food item:', foodItem.value);
  foodItems.value.push({
    id: Date.now(), // Use unique timestamp
    name: foodItem.value.name,
    calories: Number(foodItem.value.calories) || 0,
    protein: foodItem.value.protein || 0,
    carbs: foodItem.value.carbs || 0,
    fat: foodItem.value.fat || 0,
    per: Number(foodItem.value.per) || 100,
    uom: foodItem.value.uom || 'g',
  });
  isAddingFood.value = false;
  resetFoodItem();
}

function resetFoodItem() {
  foodItem.value.calories = 0;
  foodItem.value.protein = 0;
  foodItem.value.carbs = 0;
  foodItem.value.fat = 0;
  foodItem.value.name = '';
  foodItem.value.per = 100;
  foodItem.value.uom = 'g';
  foodItem.value.id = 0;
}

function validateMacros(): boolean | string {
  if (foodItem.value.uom !== 'g' && foodItem.value.uom !== 'ml') return true;

  const protein = Number(foodItem.value.protein) || 0;
  const carbs = Number(foodItem.value.carbs) || 0;
  const fat = Number(foodItem.value.fat) || 0;
  const totalMacros = Number((protein + carbs + fat).toFixed(2));
  const perValue = Number(foodItem.value.per) || 0;

  if (totalMacros > perValue) {
    return `Macros total (${totalMacros}g) cannot exceed serving size (${perValue}${foodItem.value.uom})`;
  }
  return true;
}

const isAddingFood = ref(false);
const isAddingIntake = ref(false);

const intakeProps = ref<{
  food: string;
  amount: number | null;
  uom: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  per: number;
}>({
  food: '',
  amount: null,
  uom: '',
  calories: null,
  protein: null,
  carbs: null,
  fat: null,
  per: 0,
});

const previewCalories = computed(() => {
  if (!intakeProps.value.amount || !intakeProps.value.per) return 0;
  return computeNutrient(
    intakeProps.value.calories || 0,
    intakeProps.value.amount,
    intakeProps.value.per,
  );
});

const previewProtein = computed(() => {
  if (!intakeProps.value.amount || !intakeProps.value.per) return 0;
  return computeNutrient(
    intakeProps.value.protein || 0,
    intakeProps.value.amount,
    intakeProps.value.per,
  );
});

const previewCarbs = computed(() => {
  if (!intakeProps.value.amount || !intakeProps.value.per) return 0;
  return computeNutrient(
    intakeProps.value.carbs || 0,
    intakeProps.value.amount,
    intakeProps.value.per,
  );
});

const previewFat = computed(() => {
  if (!intakeProps.value.amount || !intakeProps.value.per) return 0;
  return computeNutrient(
    intakeProps.value.fat || 0,
    intakeProps.value.amount,
    intakeProps.value.per,
  );
});

function addIntake(row: FoodItem) {
  isAddingIntake.value = true;
  intakeProps.value.food = row.name;
  intakeProps.value.uom = row.uom;
  intakeProps.value.calories = row.calories;
  intakeProps.value.protein = row.protein || 0;
  intakeProps.value.carbs = row.carbs || 0;
  intakeProps.value.fat = row.fat || 0;
  intakeProps.value.per = row.per;
}

function saveIntake() {
  store.addIntake({
    food: intakeProps.value.food,
    amount: Number(intakeProps.value.amount) || 0,
    uom: intakeProps.value.uom,
    calories: computeNutrient(
      intakeProps.value.calories || 0,
      intakeProps.value.amount || 0,
      intakeProps.value.per,
    ),
    protein: computeNutrient(
      intakeProps.value.protein || 0,
      intakeProps.value.amount || 0,
      intakeProps.value.per,
    ),
    carbs: computeNutrient(
      intakeProps.value.carbs || 0,
      intakeProps.value.amount || 0,
      intakeProps.value.per,
    ),
    fat: computeNutrient(
      intakeProps.value.fat || 0,
      intakeProps.value.amount || 0,
      intakeProps.value.per,
    ),
  });
  isAddingIntake.value = false;
  intakeProps.value.amount = null;
}

function computeNutrient(nutrientAmount: number, amount: number, per: number): number {
  const result = (nutrientAmount / per) * amount;
  return Number(result.toFixed(2));
}
</script>

<style scoped>
.hover-bg-grey-9:hover {
  background: rgba(255, 255, 255, 0.04);
}
</style>
