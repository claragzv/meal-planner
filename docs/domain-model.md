# Modelo de dominio

Este documento define las entidades principales de la aplicación, sus responsabilidades y las relaciones entre ellas.

El modelo distingue entre:

```text
Ingredient
= alimento genérico

Product
= producto comercial concreto

Recipe
= preparación compuesta por ingredientes

RecipeIngredient
= uso de un ingrediente dentro de una receta

Meal
= conjunto de elementos consumidos juntos

MealItem
= elemento concreto dentro de un Meal

MealPlan
= planificación temporal de Meals

InventoryItem
= cantidad actualmente disponible

ShoppingItem
= necesidad de compra

ShoppingItemSource
= origen de una necesidad de compra
```

---
## Índice

* [1. Ingredient](#1-ingredient)

  * [Modelo](#modelo)
  * [Responsabilidades](#responsabilidades)

* [2. Nutrition](#2-nutrition)

* [3. Unit](#3-unit)

* [4. UnitEquivalence](#4-unitequivalence)

* [5. defaultUnit](#5-defaultunit)

* [6. Product](#6-product)

* [7. Recipe](#7-recipe)

* [8. RecipeIngredient](#8-recipeingredient)

* [9. Meal](#9-meal)

* [10. MealItem](#10-mealitem)

* [11. MealPlan](#11-mealplan)

* [12. InventoryItem](#12-inventoryitem)

* [13. ShoppingItem](#13-shoppingitem)

* [14. ShoppingItemSource](#14-shoppingitemsource)

* [15. Relación entre las entidades](#15-relación-entre-las-entidades)

* [16. Datos calculados](#16-datos-calculados)

  * [Nutrición de Recipe](#nutrición-de-recipe)
  * [Nutrición de Meal](#nutrición-de-meal)
  * [Nutrición diaria](#nutrición-diaria)
  * [Necesidades de compra](#necesidades-de-compra)

* [Principio central](#principio-central)
---

# 1. Ingredient

Un `Ingredient` representa un alimento genérico.

Ejemplos:

```text
Pasta
Huevo
Leche
Manzana
Tomate
```

No representa un producto comercial concreto.

```text
Ingredient
└── Pasta
```

```text
Product
└── Pasta Gallo 500 g
```

## Modelo

```ts
type Ingredient = {
    id: string;

    name: string;

    nutrition?: Nutrition;

    defaultUnit: Unit;

    unitEquivalences?: UnitEquivalence[];
};
```

## Responsabilidades

Un `Ingredient`:

* puede utilizarse en una `Recipe`;
* puede aparecer directamente en un `Meal`;
* puede formar parte del `Inventory`;
* puede aparecer en necesidades de compra;
* puede tener productos comerciales relacionados;
* puede tener información nutricional genérica.

---

# 2. Nutrition

La nutrición representa valores nutricionales por una cantidad de referencia.

```ts
type Nutrition = {
    basisQuantity: number;

    basisUnit: "g" | "ml";

    calories: number;

    protein: number;

    carbohydrates: number;

    fat: number;

    fiber?: number;

    sugar?: number;

    saturatedFat?: number;

    salt?: number;
};
```

Los campos necesarios para considerar una nutrición completa son:

```text
calories
protein
carbohydrates
fat
```

`fiber` puede utilizarse como información adicional, pero no es necesaria para considerar que la nutrición básica está completa.

Por tanto:

```text
Nutrition completa
=
calories ✓
protein ✓
carbohydrates ✓
fat ✓
```

La nutrición puede ser incompleta:

```text
Nutrition
├── calories ✓
├── protein ✓
├── carbohydrates ✓
└── fat ✗
```

La nutrición incompleta puede seguir existiendo y utilizarse parcialmente, pero cualquier cálculo que dependa de datos ausentes debe indicarse como incompleto.

---

# 3. Unit

Las unidades representan cómo se expresa una cantidad.

```ts
type Unit =
    | "g"
    | "kg"
    | "ml"
    | "l"
    | "unit"
    | "package"
    | "slice"
    | "clove"
    | "can"
    | "bottle"
    | "glass"
    | "tablespoon"
    | "teaspoon";
```

La aplicación no intenta determinar automáticamente qué unidades son semánticamente correctas para cada ingrediente.

El usuario puede elegir la unidad que considere apropiada.

Sin embargo, las unidades utilizadas en cálculos deben poder convertirse entre sí.

---

# 4. UnitEquivalence

Una equivalencia define cuánto representa una unidad contable en una unidad medible.

Ejemplo:

```text
1 huevo = 50 g
```

```ts
type UnitEquivalence = {
    unit: Unit;

    quantity: number;

    equivalentQuantity: number;

    equivalentUnit: "g" | "ml";
};
```

Ejemplo:

```text
Ingredient: Huevo

UnitEquivalence
├── unit: "unit"
├── quantity: 1
├── equivalentQuantity: 50
└── equivalentUnit: "g"
```

Esto permite calcular:

```text
2 huevos
=
100 g
```

La equivalencia no es obligatoria.

Tiene sentido para ingredientes como:

```text
Huevo
Manzana
Plátano
```

Pero puede no tener sentido para:

```text
Pasta
Arroz
Harina
```

---

# 5. defaultUnit

`defaultUnit` representa la unidad preferida para expresar las cantidades de un ingrediente.

```ts
type Ingredient = {
    id: string;

    name: string;

    nutrition?: Nutrition;

    defaultUnit: Unit;

    unitEquivalences?: UnitEquivalence[];
};
```

Ejemplo:

```text
Ingredient
└── Leche
    └── defaultUnit: l
```

Si diferentes necesidades utilizan:

```text
500 ml
1 l
```

la aplicación puede convertir ambas a la unidad predeterminada:

```text
500 ml
+
1 l
=
1.5 l
```

El resultado agrupado sería:

```text
Leche: 1.5 l
```

`defaultUnit` no obliga a utilizar siempre esa unidad.

Por ejemplo, un ingrediente cuyo valor predeterminado sea:

```text
g
```

puede utilizarse en una receta como:

```text
2 units
```

si existe una equivalencia válida:

```text
1 unit = 50 g
```

Si el usuario intenta utilizar una unidad que requiere equivalencia y esta no existe, la aplicación debe impedir el uso de esa unidad o solicitar primero la equivalencia necesaria.

---

# 6. Product

Un `Product` representa un producto comercial concreto.

Ejemplos:

```text
Leche Entera Hacendado
Pasta Gallo 500 g
Yogur Danone Natural
```

```ts
type Product = {
    id: string;

    name: string;

    brand?: string;

    ingredientId?: string;

    nutrition?: Nutrition;
};
```

Un `Product`:

* puede estar relacionado con un `Ingredient`;
* puede existir sin `Ingredient`;
* puede tener nutrición propia;
* puede utilizarse directamente en un `Meal`;
* puede formar parte del `Inventory`;
* puede aparecer en necesidades de compra.

La nutrición de un `Product` es específica del producto comercial.

```text
Product
└── Pasta Gallo
    └── 353 kcal / 100 g
```

Puede ser diferente de:

```text
Ingredient
└── Pasta
    └── 350 kcal / 100 g
```

---

# 7. Recipe

Una `Recipe` representa una preparación compuesta por ingredientes.

```ts
type Recipe = {
    id: string;

    name: string;

    servings: number;

    ingredients: RecipeIngredient[];
};
```

Una receta no utiliza productos comerciales concretos.

```text
Recipe
└── Pasta carbonara
    ├── Pasta
    ├── Huevo
    └── Bacon
```

---

# 8. RecipeIngredient

`RecipeIngredient` representa el uso de un ingrediente dentro de una receta.

```ts
type RecipeIngredient = {
    id: string;

    recipeId: string;

    ingredientId: string;

    quantity: number;

    unit: Unit;
};
```

La cantidad pertenece a esta relación, no al `Ingredient`.

Ejemplo:

```text
RecipeIngredient
├── recipeId: carbonara
├── ingredientId: pasta
├── quantity: 200
└── unit: g
```

El mismo ingrediente puede utilizarse en varias recetas con cantidades diferentes.

---

# 9. Meal

Un `Meal` representa un conjunto de elementos consumidos juntos.

Puede contener:

```text
Recipe
Ingredient
Product
```

Ejemplo:

```text
Meal
├── Recipe: Pasta carbonara
├── Ingredient: Manzana
└── Product: Yogur Danone
```

Un `Meal` no tiene un estado de consumido.

La planificación y el consumo son conceptos independientes.

```text
Meal
≠
ConsumptionState
```

El `Meal` representa únicamente lo que se ha planificado consumir.

---

# 10. MealItem

Un `MealItem` representa un elemento concreto dentro de un `Meal`.

```ts
type MealItem =
    | {
        id: string;

        mealId: string;

        type: "recipe";

        recipeId: string;

        servings: number;
    }
    | {
        id: string;

        mealId: string;

        type: "ingredient";

        ingredientId: string;

        quantity: number;

        unit: Unit;
    }
    | {
        id: string;

        mealId: string;

        type: "product";

        productId: string;

        quantity: number;

        unit: Unit;
    };
```

Cada `MealItem` referencia exactamente un tipo de elemento.

```text
Recipe
```

o:

```text
Ingredient
```

o:

```text
Product
```

Nunca los tres simultáneamente.

---

# 11. MealPlan

Un `MealPlan` representa una planificación temporal.

```ts
type MealPlan = {
    id: string;

    name?: string;

    meals: Meal[];
};
```

Cada `Meal` se asocia a una fecha y un momento concreto.

Ejemplo:

```text
2026-07-25
├── breakfast
├── lunch
├── snack
└── dinner
```

El `MealPlan` representa:

```text
¿Qué quiero consumir?
```

No representa:

```text
¿Qué he consumido?
```

ni:

```text
¿Qué tengo disponible?
```

---

# 12. InventoryItem

Un `InventoryItem` representa una cantidad disponible.

```ts
type InventoryItem = {
    id: string;

    ingredientId?: string;

    productId?: string;

    name: string;

    quantity: number;

    unit: Unit;
};
```

Debe referenciar un `Ingredient` o un `Product`.

Ejemplo:

```text
InventoryItem
└── Ingredient: Pasta
    └── 500 g
```

o:

```text
InventoryItem
└── Product: Yogur Danone
    └── 4 units
```

Los elementos equivalentes deben consolidarse cuando las unidades sean compatibles.

```text
500 g
+
200 g
=
700 g
```

---

# 13. ShoppingItem

Un `ShoppingItem` representa una necesidad de compra agrupada.

```ts
type ShoppingItem = {
    id: string;

    ingredientId?: string;

    productId?: string;

    name: string;

    quantity: number;

    unit: Unit;

    checked: boolean;

    sources?: ShoppingItemSource[];
};
```

Un `ShoppingItem` puede:

* representar una necesidad automática;
* representar un elemento manual;
* referenciar un `Ingredient`;
* referenciar un `Product`;
* existir únicamente con un nombre libre.

Ejemplo:

```text
ShoppingItem
└── name: "Papel de cocina"
```

---

# 14. ShoppingItemSource

Las fuentes representan de dónde procede la necesidad de compra.

```ts
type ShoppingItemSource =
    | {
        type: "manual";

        quantity: number;

        unit: Unit;
    }
    | {
        type: "meal-plan";

        mealItemId: string;

        quantity: number;

        unit: Unit;
    };
```

Un `ShoppingItem` puede tener múltiples fuentes.

Ejemplo:

```text
ShoppingItem
└── Leche: 1.5 l
    ├── MealItem A: 500 ml
    └── MealItem B: 1 l
```

El `ShoppingItem.quantity` representa la cantidad actualmente pendiente de compra.

Las fuentes representan las necesidades originales.

Estas cantidades pueden diferir.

---

# 15. Relación entre las entidades

```text
Ingredient
    │
    ├────────────── Product
    │
    ├────────────── RecipeIngredient
    │                       │
    │                       ▼
    │                    Recipe
    │                       │
    │                       ▼
    │                    MealItem
    │                       │
    ├────────────── Meal ───┘
    │                       │
    │                       ▼
    │                    MealPlan
    │
    ├────────────── InventoryItem
    │
    └────────────── ShoppingItem
                            │
                            ▼
                    ShoppingItemSource
```

---

# 16. Datos calculados

La aplicación no necesita persistir todos los datos derivados.

## Nutrición de Recipe

```text
Recipe
    ↓
RecipeIngredient
    ↓
Ingredient
    ↓
Nutrition
```

## Nutrición de Meal

```text
Meal
    ↓
MealItem
    ↓
Recipe / Ingredient / Product
    ↓
Nutrition
```

## Nutrición diaria

```text
MealPlan
    ↓
Meals
    ↓
Nutrition
```

## Necesidades de compra

```text
MealPlan
    ↓
MealItems
    ↓
Necesidades
    ↓
Agrupación
    ↓
Comparación con Inventory
    ↓
ShoppingItems
```

La nutrición propagada y las necesidades calculadas deben recalcularse a partir de los datos actuales.

---

# Principio central

El sistema mantiene separados:

```text
PLANIFICADO
```

Representado por:

```text
MealPlan
```

```text
DISPONIBLE
```

Representado por:

```text
Inventory
```

```text
PENDIENTE DE COMPRAR
```

Representado por:

```text
ShoppingList
```

Estos estados no se modifican automáticamente entre sí.

Las transiciones requieren una acción explícita del usuario.
