<template>
  <div class="content">
    <h2>Welcome to Nutrition Connect</h2>
    <p>Access simple nutrition resources and recipes.</p>

    <h3 style="margin-top: 20px;">Sample Recipes</h3>

    <div class="recipe" v-for="(recipe, index) in featuredRecipes" :key="index">
      <h3>{{ recipe.title }}</h3>
      <p>{{ recipe.description }}</p>
      <p><strong>Category:</strong> {{ recipe.category }}</p>
      <p><strong>Price:</strong> {{ recipe.price }}</p>
      <button class="recipe-btn" @click="$emit('save-recipe', recipe)">Save Recipe</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      featuredRecipes: [
        {
          id: 1,
          title: 'Lentil Curry',
          description: 'A delicious and nutritious curry that is easy to make and budget-friendly.',
          category: 'Vegetarian',
          price: '$2.50'
        },
        {
          id: 2,
          title: 'Vegetable Biryani',
          description: 'Fragrant rice dish with mixed vegetables and aromatic spices.',
          category: 'Vegan',
          price: '$3.00'
        }
      ]
    }
  }
}
</script>
