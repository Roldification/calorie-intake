<template>
  <q-layout view="lHh Lpr lFf">
    <q-header
      flat
      class="glass-header"
    >
      <q-toolbar class="q-py-sm">
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title class="text-weight-bold text-h6 tracking-tight flex items-center q-pl-md">
          <q-icon name="local_fire_department" color="primary" size="28px" class="q-mr-xs" />
          <span>Calorie<span class="text-primary">Counter</span></span>
        </q-toolbar-title>

        <div class="row items-center q-gutter-sm">
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
      class="theme-drawer"
    >
      <q-list class="q-px-sm q-py-md">
        <q-item-label header class="text-weight-bold text-theme-caption q-mb-md">
          Navigation
        </q-item-label>

        <q-item
          clickable
          v-ripple
          @click="router.push('/')"
          :active="router.currentRoute.value.path === '/'"
          active-class="text-primary rounded-borders"
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
          active-class="text-primary rounded-borders"
          class="q-mb-sm"
          style="border-radius: 12px"
        >
          <q-item-section avatar>
            <q-icon name="history" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-medium">My Intakes</q-item-label>
            <q-item-label caption class="text-theme-caption">Record of your daily Intakes</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          @click="router.push('/weekly-recap')"
          :active="router.currentRoute.value.path === '/weekly-recap'"
          active-class="text-primary rounded-borders"
          class="q-mb-sm"
          style="border-radius: 12px"
        >
          <q-item-section avatar>
            <q-icon name="insert_chart" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-medium">Weekly Recap</q-item-label>
            <q-item-label caption class="text-theme-caption">Calorie trends over the last 7 days</q-item-label>
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          @click="router.push('/import-food')"
          :active="router.currentRoute.value.path === '/import-food'"
          active-class="text-primary rounded-borders"
          class="q-mb-sm"
          style="border-radius: 12px"
        >
          <q-item-section avatar>
            <q-icon name="upload_file" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-medium">Import Data</q-item-label>
            <q-item-label caption class="text-theme-caption"
              >Import Data from external sources</q-item-label
            >
          </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          @click="router.push('/export-data')"
          :active="router.currentRoute.value.path === '/export-data'"
          active-class="text-primary rounded-borders"
          class="q-mb-sm"
          style="border-radius: 12px"
        >
          <q-item-section avatar>
            <q-icon name="download" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-medium">Export Data</q-item-label>
            <q-item-label caption class="text-theme-caption">Export Data to external devices</q-item-label>
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
import { useQuasar } from 'quasar';

const $q = useQuasar();
const router = useRouter();

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
