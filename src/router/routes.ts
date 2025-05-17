import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: 'intake', component: () => import('pages/IntakePage.vue') },
      { path: 'my-intakes', component: () => import('pages/IntakesPage.vue') },
      { path: 'import-food', component: () => import('pages/ImportFood.vue') },
      { path: 'export-data', component: () => import('pages/ExportDataPage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
