<script setup lang="ts">
import ReviewItem from './ReviewItem.vue';
import { store } from '@/store';
</script>

<template>
  <v-container v-if="store.loading" class="d-flex">
    <v-progress-circular class="mx-auto" indeterminate color="primary" />
  </v-container>
  <review-item
    v-else
    v-for="review in store.reviews"
    :key="review.rowKey"
    :author="review.author"
    :comment="review.comment"
    :thumbnailUrl="review.thumbnailUrl"
    :imageUrl="review.imageUrl"
    :timestamp="review.timestamp"
  />
</template>
