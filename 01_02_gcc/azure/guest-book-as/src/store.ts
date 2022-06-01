import { reactive } from 'vue';
import type { Review } from './models/review';
import { get } from './services/review';

export const store = reactive<{
  loading: boolean;
  reviews: Review[];
  loadReviews: () => void;
}>({
  loadReviews() {
    this.loading = true;
    get().then((reviews) => {
      this.reviews = reviews;
      this.loading = false;
    });
  },
  loading: false,
  reviews: [],
});
