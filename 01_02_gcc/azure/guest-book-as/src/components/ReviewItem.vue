<script setup lang="ts">
import { reactive } from 'vue';
import { directive as fullscreen } from 'vue-fullscreen';

interface Props {
  author: string;
  comment: string;
  thumbnailUrl: string;
  imageUrl: string;
  timestamp: Date;
}

const props = defineProps<Props>();

const vFullscreen = fullscreen;
const fullscreenOptions = {
  target: '.fullscreen-wrapper',
  callback(isFullscreen: boolean) {
    state.isFullscreen = isFullscreen;
  },
};

const state = reactive({ isFullscreen: false });
</script>

<template>
  <div v-if="state.isFullscreen" class="fullscreen-wrapper">
    <img class="fullImage" :src="props.imageUrl" />
  </div>
  <div class="item">
    <v-progress-circular
      v-if="!props.thumbnailUrl"
      class="thumbnail"
      indeterminate
      color="primary"
      v-fullscreen.teleport="fullscreenOptions"
    />
    <img
      v-else
      class="thumbnail"
      :src="props.thumbnailUrl"
      v-fullscreen.teleport="fullscreenOptions"
    />
    <div class="details">
      <v-row>
        <h3>{{ props.author }}</h3>
        <v-chip class="ml-4 text-caption" size="small">{{
          props.timestamp
        }}</v-chip>
      </v-row>
      <v-row>
        <p>{{ props.comment }}</p>
      </v-row>
    </div>
  </div>
</template>

<style scoped>
.item {
  margin-top: 2rem;
  display: flex;
}

.details {
  flex: 1;
  margin: 1rem;
}

.thumbnail {
  display: flex;
  place-items: center;
  place-content: center;
  width: 50px;
  height: 50px;
}

h3 {
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 0.4rem;
  color: var(--color-heading);
}

@media (min-width: 1024px) {
  .item {
    margin-top: 0;
    padding: 0.4rem 0 1rem calc(var(--section-gap) / 2);
  }

  .thumbnail {
    top: calc(50% - 25px);
    left: -26px;
    position: absolute;
    border: 1px solid var(--color-border);
    background: var(--color-background);
    border-radius: 8px;
    width: 50px;
    height: 50px;
  }

  .item:before {
    content: ' ';
    border-left: 1px solid var(--color-border);
    position: absolute;
    left: 0;
    bottom: calc(50% + 25px);
    height: calc(50% - 25px);
  }

  .item:after {
    content: ' ';
    border-left: 1px solid var(--color-border);
    position: absolute;
    left: 0;
    top: calc(50% + 25px);
    height: calc(50% - 25px);
  }

  .item:first-of-type:before {
    display: none;
  }

  .item:last-of-type:after {
    display: none;
  }
}

.fullscreen-wrapper {
  width: 100%;
  height: 100%;
  background: #333;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  top: 0;
  z-index: 10000;
  position: absolute;
}
</style>
