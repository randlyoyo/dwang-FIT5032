# 🌐 REST API Documentation

## ✅ Public REST API Endpoints

Two public REST API endpoints have been implemented to allow third parties to fetch recipe data using the REST protocol.

---

## 📍 API Endpoints

### Base URL

```
https://us-central1-assignment-cfc8f.cloudfunctions.net
```

---

## 🔗 Endpoint 1: Get All Recipes

### URL

```
https://us-central1-assignment-cfc8f.cloudfunctions.net/apiRecipes
```

### Description

Retrieve a list of recipes with optional filtering and sorting capabilities.

### Method

`GET`

### Query Parameters

- `limit` (integer, default: 50, max: 100) - Number of recipes to return
- `category` (string, optional) - Filter by category (Breakfast, Lunch, Dinner, Snack)
- `difficulty` (string, optional) - Filter by difficulty (Easy, Medium, Hard)
- `sortBy` (string, default: createdAt) - Sort field
- `order` (string, default: desc) - Sort order (asc or desc)

### Example Usage

```bash
# Get 10 recipes
curl "https://us-central1-assignment-cfc8f.cloudfunctions.net/apiRecipes?limit=10"

# Get Breakfast recipes sorted by rating
curl "https://us-central1-assignment-cfc8f.cloudfunctions.net/apiRecipes?category=Breakfast&sortBy=rating&order=desc"
```

### Response Format

```json
{
  "success": true,
  "data": [
    {
      "id": "abc123",
      "name": "Healthy Breakfast Bowl",
      "category": "Breakfast",
      "difficulty": "Easy",
      "prepTime": 10,
      "cookTime": 5,
      "calories": 350,
      "rating": 4.5,
      "ingredients": ["oats", "banana", "honey"],
      "instructions": ["Mix ingredients", "Serve"]
    }
  ],
  "total": 10,
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

---

## 🔗 Endpoint 2: Get Recipe by ID

### URL

```
https://us-central1-assignment-cfc8f.cloudfunctions.net/apiRecipeById/{recipeId}
```

or

```
https://us-central1-assignment-cfc8f.cloudfunctions.net/apiRecipeById?id={recipeId}
```

### Description

Retrieve detailed information about a specific recipe by its unique ID. This endpoint also automatically increments the recipe's view count.

### Method

`GET`

### Parameters

- `id` (string, required) - Unique recipe identifier

### Example Usage

```bash
# Get recipe by ID (path parameter)
curl "https://us-central1-assignment-cfc8f.cloudfunctions.net/apiRecipeById/abc123"

# Get recipe by ID (query parameter)
curl "https://us-central1-assignment-cfc8f.cloudfunctions.net/apiRecipeById?id=abc123"
```

### Response Format

```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "name": "Healthy Breakfast Bowl",
    "description": "A nutritious breakfast...",
    "category": "Breakfast",
    "difficulty": "Easy",
    "prepTime": 10,
    "cookTime": 5,
    "totalTime": 15,
    "servings": 2,
    "calories": 350,
    "protein": 15,
    "rating": 4.5,
    "views": 121,
    "likes": 45,
    "ingredients": ["1 cup oats", "1 banana", "2 tbsp honey"],
    "instructions": ["Mix oats", "Add banana", "Drizzle honey"],
    "tags": ["healthy", "quick", "vegetarian"],
    "chef": "Chef John",
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

---

## 🔒 Features

- ✅ **CORS Enabled** - Accessible from any origin
- ✅ **No Authentication Required** - Public access
- ✅ **JSON Response Format** - Standard REST format
- ✅ **Error Handling** - Proper HTTP status codes (200, 400, 404, 500)
- ✅ **Real-time Data** - Fetches from Firestore database

---

## 📖 Interactive Documentation

Visit the interactive documentation page to test the API:

```
http://localhost:5173/api-docs
```

---

## ✅ Assignment Requirements Met

**Requirement:** Provide API access to others using REST protocol with at least 2 routes

**Implementation:**

1. ✅ GET /apiRecipes - List recipes with filtering and sorting
2. ✅ GET /apiRecipeById/:id - Get detailed recipe information

**Status:** ✅ Deployed and Active
