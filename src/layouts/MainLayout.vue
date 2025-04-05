<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          Calorie Counter
        </q-toolbar-title>

        <div class="row q-gutter-sm">
          <q-btn @click="router.push('/intake')" dense round icon="restaurant" class="q-ml-md">
      <q-badge v-if="store.intakes.length" color="red" floating>{{ store.intakes.length }}</q-badge>
    </q-btn>
          <span>v.0</span></div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label
          header
        >
          Essential Links
        </q-item-label>

        <q-item
    clickable
    tag="a"
    target="_blank"
    href="/"
  >


    <q-item-section>
      <q-item-label>UOM</q-item-label>
      <q-item-label caption>Units of Measurement</q-item-label>
    </q-item-section>
  </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCounterStore } from 'src/stores/example-store';

const router = useRouter();
const store = useCounterStore();

const leftDrawerOpen = ref(false);

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
