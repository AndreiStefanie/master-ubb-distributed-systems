<script setup lang="ts">
import ReviewList from '../components/ReviewList.vue';
import ReviewForm from '../components/ReviewForm.vue';
import { store } from '@/store';

store.loadReviews();
</script>

<template>
  <main>
    <ReviewList />
    <v-divider class="my-4" />
    <ReviewForm />
  </main>
</template>
