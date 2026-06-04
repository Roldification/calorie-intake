<template>
  <q-layout view="lHh Lpr lFf">
    <q-header
      flat
      class="glass-header text-white"
      style="
        background: rgba(15, 23, 42, 0.65);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      "
    >
      <q-toolbar class="q-py-sm">
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title class="text-weight-bold text-h6 tracking-tight flex items-center q-pl-md">
          <q-icon name="local_fire_department" color="primary" size="28px" class="q-mr-xs" />
          <span>Calorie<span class="text-primary">Counter</span></span>
        </q-toolbar-title>

        <div class="row items-center q-gutter-sm">
          <q-btn @click="router.push('/intake')" flat dense round icon="restaurant" color="primary">
            <q-badge
              v-if="store.intakes.length"
              color="negative"
              floating
              rounded
              class="text-weight-bold"
              >{{ store.intakes.length }}</q-badge
            >
          </q-btn>
          <q-btn
            flat
            dense
            round
            :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
            @click="$q.dark.toggle()"
            class="q-ml-sm"
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-dark"
      style="border-right: 1px solid rgba(255, 255, 255, 0.08)"
    >
      <q-list class="q-px-sm q-py-md">
        <q-item-label header class="text-weight-bold text-grey-5 q-mb-md">
          Navigation
        </q-item-label>

        <q-item
          clickable
          v-ripple
          @click="router.push('/')"
          :active="router.currentRoute.value.path === '/'"
          active-class="text-primary bg-grey-9 rounded-borders"
          class="q-mb-sm"
          style="border-radius: 12px"
        >
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-medium">Dashboard</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          @click="router.push('/my-intakes')"
          :active="router.currentRoute.value.path === '/my-intakes'"
          active-class="text-primary bg-grey-9 rounded-borders"
          class="q-mb-sm"
          style="border-radius: 12px"
        >
          <q-item-section avatar>
            <q-icon name="history" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-medium">My Intakes</q-item-label>
            <q-item-label caption class="text-grey-6">Record of your daily Intakes</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          @click="router.push('/import-food')"
          :active="router.currentRoute.value.path === '/import-food'"
          active-class="text-primary bg-grey-9 rounded-borders"
          class="q-mb-sm"
          style="border-radius: 12px"
        >
          <q-item-section avatar>
            <q-icon name="upload_file" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-medium">Import Data</q-item-label>
            <q-item-label caption class="text-grey-6"
              >Import Data from external sources</q-item-label
            >
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          @click="router.push('/export-data')"
          :active="router.currentRoute.value.path === '/export-data'"
          active-class="text-primary bg-grey-9 rounded-borders"
          class="q-mb-sm"
          style="border-radius: 12px"
        >
          <q-item-section avatar>
            <q-icon name="download" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-medium">Export Data</q-item-label>
            <q-item-label caption class="text-grey-6">Export Data to external devices</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <div class="row justify-start q-px-md q-pt-sm" v-if="router.currentRoute.value.path !== '/'">
        <q-btn
          flat
          dense
          color="primary"
          @click="router.back"
          icon="arrow_back"
          label="Back"
          class="q-px-sm"
        ></q-btn>
      </div>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCounterStore } from 'src/stores/example-store';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const router = useRouter();
const store = useCounterStore();

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
