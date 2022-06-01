<script setup lang="ts">
import { ref } from 'vue';

const file = ref<HTMLInputElement>();
const handleFileUpload = async () => {
  if (!file.value) {
    return;
  }
  console.log('selected file', file.value.files);
};
</script>

<template>
  <input ref="file" v-on:change="handleFileUpload()" type="file" />
</template>
