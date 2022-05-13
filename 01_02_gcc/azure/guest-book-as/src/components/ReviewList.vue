<script setup lang="ts">
import ReviewItem from './ReviewItem.vue';
</script>

<template>
  <ReviewItem
    author="Andrei"
    content="Salut"
    thumbnailUrl="https://stfincorpprod.blob.core.windows.net/images/min-taycan_blue_turbo_025.jpeg"
    imageUrl="https://stfincorpprod.blob.core.windows.net/images/taycan_blue_turbo_025.jpeg"
    :date="new Date()"
  />
  <ReviewItem
    author="Andrei"
    content="Salut"
    thumbnailUrl="https://stfincorpprod.blob.core.windows.net/images/min-taycan_blue_turbo_025.jpeg"
    imageUrl="https://stfincorpprod.blob.core.windows.net/images/taycan_blue_turbo_025.jpeg"
    :date="new Date()"
  />
  <ReviewItem
    author="Andrei"
    content="Salut"
    thumbnailUrl="https://stfincorpprod.blob.core.windows.net/images/min-taycan_blue_turbo_025.jpeg"
    imageUrl="https://stfincorpprod.blob.core.windows.net/images/taycan_blue_turbo_025.jpeg"
    :date="new Date()"
  />
</template>
