<script setup lang="ts">
import { create } from '@/services/review';
import { ref } from 'vue';
import { store } from '@/store';

const MAX_NAME_SIZE = 25;
const MAX_COMMENT_SIZE = 200;

const currentFile = ref<File[]>([]);
const valid = ref<boolean>(false);
const author = ref<string>('');
const authorRules = ref([
  (v: string) => !!v || 'Name is required',
  (v: string) =>
    v.length <= MAX_NAME_SIZE ||
    `Name must be less than ${MAX_NAME_SIZE} characters`,
]);
const comment = ref<string>('');
const commentRules = ref([
  (v: string) => !!v || 'Comment is required',
  (v: string) =>
    v.length <= MAX_COMMENT_SIZE ||
    `Name must be less than ${MAX_COMMENT_SIZE} characters`,
]);
const progress = ref<number>(0);

const onSubmit = async () => {
  if (!currentFile.value) {
    return;
  }

  try {
    await create(author.value, comment.value, currentFile.value[0], (event) => {
      progress.value = Math.round((100 * event.loaded) / event.total);
    });
  } catch (error) {
    progress.value = 0;
    currentFile.value = [];
    author.value = '';
    comment.value = '';
    store.loadReviews();
  }
};
</script>

<template>
  <v-form v-model="valid" @submit.prevent="onSubmit">
    <v-card-text>
      <v-row>
        <v-text-field
          v-model="author"
          :rules="authorRules"
          :counter="MAX_NAME_SIZE"
          label="Name"
          required
        ></v-text-field>
      </v-row>
      <v-row>
        <v-textarea
          v-model="comment"
          :rules="commentRules"
          :counter="MAX_COMMENT_SIZE"
          label="Comment"
          required
        />
      </v-row>
      <v-row>
        <v-file-input
          chips
          show-size
          prepend-icon="mdi-camera"
          accept="image/*"
          label="Image"
          v-model="currentFile"
        ></v-file-input>
        <div v-if="currentFile">
          <div>
            <v-progress-linear
              v-model="progress"
              color="light-blue"
              height="25"
              reactive
            >
              <strong>{{ progress }}%</strong>
            </v-progress-linear>
          </div>
        </div>
      </v-row>
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn type="submit" color="primary" :disabled="!valid">Send</v-btn>
    </v-card-actions>
  </v-form>
</template>
