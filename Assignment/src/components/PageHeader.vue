<template>
  <div class="page-header">
    <div class="container">
      <h1>{{ title }}</h1>
      <p v-if="description">{{ description }}</p>
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
})
</script>

<style scoped>
.page-header {
  background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
  color: white;
  padding: 3rem 0 2rem;
  margin-bottom: 3rem;
}

.page-header h1 {
  color: white;
  margin-bottom: 0.5rem;
  font-size: 2.5rem;
  font-weight: 700;
}

.page-header p {
  opacity: 0.9;
  margin-bottom: 0;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .page-header {
    padding: 2rem 0 1.5rem;
    margin-bottom: 2rem;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .page-header p {
    font-size: 1rem;
  }
}
</style>

