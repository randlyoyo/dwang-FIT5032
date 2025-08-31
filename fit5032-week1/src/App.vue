<template>
  <div id="app">
    <!-- Header -->
    <div class="header">
      <h1>Nutrition Connect</h1>
      <p>Simple nutrition education platform</p>
    </div>

    <!-- Navigation -->
    <div class="nav">
      <button class="nav-btn" :class="{ active: activePage === 'home' }" @click="setActivePage('home')">Home</button>
      <button class="nav-btn" :class="{ active: activePage === 'signup' }" @click="setActivePage('signup')">Sign Up</button>
    </div>

    <!-- Page Content -->
    <Home v-if="activePage === 'home'" @save-recipe="saveRecipe" />
    <SignUp v-else-if="activePage === 'signup'" />
  </div>
</template>

<script>
import Home from './components/Home.vue'
import SignUp from './components/SignUp.vue'

export default {
  name: 'App',
  components: {
    Home,
    SignUp
  },
  data() {
    return {
      activePage: 'home',
      savedRecipes: []
    }
  },
  methods: {
    setActivePage(page) {
      this.activePage = page
    },
    saveRecipe(recipe) {
      if (!this.savedRecipes.some(r => r.id === recipe.id)) {
        this.savedRecipes.push(recipe)
        localStorage.setItem('savedRecipes', JSON.stringify(this.savedRecipes))
        alert(`Saved "${recipe.title}" to your recipes!`)
      } else {
        alert('This recipe is already saved.')
      }
    }
  },
  mounted() {
    // Load saved recipes from localStorage
    const saved = localStorage.getItem('savedRecipes')
    if (saved) {
      this.savedRecipes = JSON.parse(saved)
    }
  }
}
</script>
