# Modelo de datos

Este documento define la estructura de los datos persistidos en la aplicación, las entidades que forman el sistema, sus atributos, relaciones y restricciones.

El modelo de datos representa el estado persistente de la aplicación.

No define:

* la interfaz de usuario;
* los casos de uso;
* los algoritmos de cálculo;
* las reglas completas de negocio.

Estos aspectos se describen en documentos independientes.

---

# 1. Visión general

El sistema se organiza alrededor de los siguientes conceptos:

```text
Ingredient
    │
    ├── Product
    │
    ├── Recipe
    │       │
    │       └── RecipeIngredient
    │
    └── InventoryItem

Recipe
    │
    └── MealItem
            │
            └── Meal
                    │
                    └── MealPlan
```

Las necesidades de compra se relacionan con:

```text
MealItem
    ↓
ShoppingItemSource
    ↓
ShoppingItem
```

El inventario representa cantidades disponibles independientemente de la planificación.

---

# 2. Entidades principales

Las entidades principales del sistema son:

```text
Ingredient
Product
Recipe
RecipeIngredient
Meal
MealItem
MealPlan
InventoryItem
ShoppingItem
ShoppingItemSource
```

---

# 3. Tipos compartidos

## 3.1. Unit

Representa una unidad utilizada para expresar cantidades.

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

La lista de unidades disponibles puede ampliarse en el futuro.

---

## 3.2. Nutrition

Representa información nutricional por una cantidad de referencia.

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

### `basisQuantity`

Cantidad sobre la que se expresan los valores nutricionales.

Ejemplo:

```text
basisQuantity: 100
basisUnit: "g"
```

Significa:

```text
Los valores nutricionales corresponden a 100 g.
```

---

## 3.3. UnitEquivalence

Representa la equivalencia entre una unidad de conteo y una unidad medible.

Ejemplo:

```text
1 unidad = 50 g
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

```ts
{
    unit: "unit",
    quantity: 1,
    equivalentQuantity: 50,
    equivalentUnit: "g"
}
```

La equivalencia pertenece al `Ingredient`.

---

# 4. Ingredient

Representa un alimento genérico.

Ejemplos:

```text
Pasta
Huevo
Leche
Manzana
```

No representa una marca o producto comercial concreto.

---

## 4.1. Estructura

```ts
type Ingredient = {
    id: string;

    name: string;

    defaultUnit?: Unit;

    nutrition?: Nutrition;

    equivalences?: UnitEquivalence[];

    createdAt: Date;
    updatedAt: Date;
};
```

---

## 4.2. Campos

### `id`

Identificador único del ingrediente.

```text
string
```

---

### `name`

Nombre del alimento genérico.

```text
string
```

Obligatorio.

---

### `defaultUnit`

Unidad preferida para representar cantidades agrupadas y necesidades de compra.

```text
Unit
```

Opcional.

---

### `nutrition`

Información nutricional genérica del ingrediente.

```text
Nutrition?
```

Opcional.

---

### `equivalences`

Equivalencias entre unidades de conteo y unidades medibles.

Ejemplo:

```text
Huevo
└── 1 unit = 50 g
```

Opcional.

---

# 5. Product

Representa un producto comercial concreto.

Ejemplos:

```text
Leche Entera Hacendado
Pasta Gallo
Yogur Natural Marca X
```

Un producto puede estar relacionado con un ingrediente genérico, pero no es obligatorio.

---

## 5.1. Estructura

```ts
type Product = {
    id: string;

    name: string;

    ingredientId?: string;

    nutrition?: Nutrition;

    createdAt: Date;
    updatedAt: Date;
};
```

---

## 5.2. Relaciones

```text
Product
    │
    └── Ingredient?
```

Un `Product` puede existir sin `Ingredient`.

Un `Ingredient` puede tener múltiples `Products`.

```text
Ingredient 1 ──────── N Product
```

---

# 6. Recipe

Representa una preparación compuesta por ingredientes.

---

## 6.1. Estructura

```ts
type Recipe = {
    id: string;

    name: string;

    servings: number;

    createdAt: Date;
    updatedAt: Date;
};
```

La relación con los ingredientes se representa mediante:

```text
RecipeIngredient
```

---

# 7. RecipeIngredient

Representa el uso de un ingrediente dentro de una receta.

Es una entidad de relación porque contiene información propia:

```text
quantity
unit
```

---

## 7.1. Estructura

```ts
type RecipeIngredient = {
    id: string;

    recipeId: string;
    ingredientId: string;

    quantity: number;
    unit: Unit;

    createdAt: Date;
    updatedAt: Date;
};
```

---

## 7.2. Relaciones

```text
Recipe 1 ──────── N RecipeIngredient N ──────── 1 Ingredient
```

Conceptualmente:

```text
Recipe
    │
    ├── RecipeIngredient
    │       └── Ingredient
    │
    └── RecipeIngredient
            └── Ingredient
```

---

# 8. Meal

Representa un conjunto de elementos consumidos juntos.

Un `Meal` puede contener:

```text
Recipe
Ingredient
Product
```

La relación se representa mediante:

```text
MealItem
```

---

## 8.1. Estructura

```ts
type Meal = {
    id: string;

    name?: string;

    createdAt: Date;
    updatedAt: Date;
};
```

Un `Meal` puede existir sin estar asignado a un `MealPlan`.

---

# 9. MealItem

Representa un elemento dentro de un `Meal`.

Cada `MealItem` referencia exactamente uno de los siguientes tipos:

```text
Recipe
Ingredient
Product
```

---

## 9.1. Estructura conceptual

```ts
type MealItem = {
    id: string;

    mealId: string;

    type: "recipe" | "ingredient" | "product";

    recipeId?: string;
    ingredientId?: string;
    productId?: string;

    quantity?: number;
    unit?: Unit;

    servings?: number;

    createdAt: Date;
    updatedAt: Date;
};
```

---

## 9.2. Restricciones

Si:

```text
type = "recipe"
```

debe existir:

```text
recipeId
servings
```

Y no debe utilizarse:

```text
quantity
unit
```

---

Si:

```text
type = "ingredient"
```

debe existir:

```text
ingredientId
quantity
unit
```

---

Si:

```text
type = "product"
```

debe existir:

```text
productId
quantity
unit
```

---

## 9.3. Relaciones

```text
Meal 1 ──────── N MealItem
```

Un `MealItem` pertenece a un único `Meal`.

---

# 10. MealPlan

Representa una planificación de comidas.

---

## 10.1. Estructura

```ts
type MealPlan = {
    id: string;

    name?: string;

    createdAt: Date;
    updatedAt: Date;
};
```

La asignación de un `Meal` a una fecha y momento concreto se representa mediante:

```text
MealPlanItem
```

---

# 11. MealPlanItem

Representa la asignación de un `Meal` a una fecha y momento del día.

Esta entidad se separa de `Meal` porque la misma comida puede reutilizarse en diferentes fechas.

---

## 11.1. Estructura

```ts
type MealPlanItem = {
    id: string;

    mealPlanId: string;
    mealId: string;

    date: string;

    moment:
        | "breakfast"
        | "lunch"
        | "dinner"
        | "snack";

    createdAt: Date;
    updatedAt: Date;
};
```

---

## 11.2. Relaciones

```text
MealPlan 1 ──────── N MealPlanItem N ──────── 1 Meal
```

Ejemplo:

```text
MealPlan
    │
    ├── MealPlanItem
    │       ├── 2026-07-25
    │       └── lunch
    │
    └── MealPlanItem
            ├── 2026-07-26
            └── dinner
```

---

# 12. InventoryItem

Representa una cantidad actualmente disponible.

Puede estar relacionado con:

```text
Ingredient
```

o:

```text
Product
```

---

## 12.1. Estructura conceptual

```ts
type InventoryItem = {
    id: string;

    ingredientId?: string;
    productId?: string;

    quantity: number;
    unit: Unit;

    createdAt: Date;
    updatedAt: Date;
};
```

---

## 12.2. Restricciones

Debe existir exactamente una referencia:

```text
ingredientId
```

o:

```text
productId
```

No deben existir ambas simultáneamente.

---

## 12.3. Relaciones

```text
Ingredient 1 ──────── N InventoryItem
```

o:

```text
Product 1 ──────── N InventoryItem
```

---

# 13. ShoppingItem

Representa una necesidad de compra pendiente.

Puede proceder de:

```text
MealPlan
```

o ser creada manualmente.

---

## 13.1. Estructura conceptual

```ts
type ShoppingItem = {
    id: string;

    name: string;

    ingredientId?: string;
    productId?: string;

    quantity: number;
    unit: Unit;

    checked: boolean;

    createdAt: Date;
    updatedAt: Date;
};
```

---

## 13.2. Tipos de ShoppingItem

Un elemento puede ser:

### Relacionado con un Ingredient

```text
ingredientId
```

---

### Relacionado con un Product

```text
productId
```

---

### Manual

Sin referencia a:

```text
Ingredient
```

ni:

```text
Product
```

Ejemplo:

```text
Papel de cocina
```

---

# 14. ShoppingItemSource

Representa el origen de una necesidad de compra.

Una fuente puede proceder de un `MealItem`.

---

## 14.1. Estructura

```ts
type ShoppingItemSource = {
    id: string;

    shoppingItemId: string;

    type: "meal-plan";

    mealItemId: string;

    quantity: number;
    unit: Unit;

    createdAt: Date;
    updatedAt: Date;
};
```

---

## 14.2. Relaciones

```text
ShoppingItem 1 ──────── N ShoppingItemSource
```

```text
MealItem 1 ──────── N ShoppingItemSource
```

Conceptualmente:

```text
MealItem
    │
    └── ShoppingItemSource
            │
            └── ShoppingItem
```

---

# 15. Relaciones entre entidades

## 15.1. Ingredient y Product

```text
Ingredient 1 ──────── N Product
```

Un ingrediente puede tener múltiples productos.

Un producto puede estar relacionado con cero o un ingrediente.

---

## 15.2. Recipe y Ingredient

Relación muchos a muchos:

```text
Recipe N ──────── N Ingredient
```

Se implementa mediante:

```text
RecipeIngredient
```

---

## 15.3. Meal y Recipe / Ingredient / Product

Un `Meal` puede contener múltiples elementos.

Se implementa mediante:

```text
MealItem
```

```text
Meal 1 ──────── N MealItem
```

Cada `MealItem` referencia exactamente un tipo de entidad.

---

## 15.4. MealPlan y Meal

```text
MealPlan N ──────── N Meal
```

Se implementa mediante:

```text
MealPlanItem
```

Esto permite reutilizar el mismo `Meal` en diferentes fechas.

---

## 15.5. Ingredient / Product y InventoryItem

```text
Ingredient 1 ──────── N InventoryItem
```

o:

```text
Product 1 ──────── N InventoryItem
```

---

## 15.6. ShoppingItem y ShoppingItemSource

```text
ShoppingItem 1 ──────── N ShoppingItemSource
```

Un `ShoppingItem` puede tener múltiples fuentes.

---

# 16. Diagrama general

```text
┌──────────────┐
│  Ingredient  │
└──────┬───────┘
       │
       ├──────────────────┐
       │                  │
       ▼                  ▼
┌──────────────┐   ┌──────────────┐
│   Product    │   │   Recipe     │
└──────────────┘   └──────┬───────┘
                          │
                          ▼
                  ┌──────────────────┐
                  │ RecipeIngredient │
                  └────────┬─────────┘
                           │
                           ▼
                      Ingredient


┌──────────────┐
│     Meal     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   MealItem   │
└──────┬───────┘
       │
       ├── Recipe
       ├── Ingredient
       └── Product
       │
       ▼
┌────────────────┐
│ MealPlanItem   │
└───────┬────────┘
        │
        ▼
   ┌──────────┐
   │ MealPlan │
   └──────────┘


┌────────────────┐
│  InventoryItem │
└───────┬────────┘
        │
        ├── Ingredient
        └── Product


┌────────────────┐
│  ShoppingItem  │
└───────┬────────┘
        │
        ▼
┌──────────────────────┐
│ ShoppingItemSource   │
└──────────┬───────────┘
           │
           ▼
       MealItem
```

---

# 17. Restricciones de integridad

## 17.1. Identificadores

Todas las entidades deben tener un identificador único.

```text
id: string
```

---

## 17.2. Cantidades

Las cantidades deben ser mayores que cero cuando representan:

```text
quantity
```

---

## 17.3. Raciones

El número de raciones debe ser mayor que cero.

```text
servings > 0
```

---

## 17.4. Referencias polimórficas

Las entidades que pueden referenciar diferentes tipos deben mantener exactamente una referencia válida.

Por ejemplo:

```text
MealItem
```

debe referenciar exactamente uno de:

```text
Recipe
Ingredient
Product
```

---

## 17.5. Integridad referencial

No se debe eliminar una entidad si existen entidades dependientes que todavía la referencian.

Ejemplos:

```text
Ingredient
    ↓
RecipeIngredient
```

```text
Recipe
    ↓
MealItem
```

```text
Meal
    ↓
MealPlanItem
```

Antes de eliminar una entidad se deben resolver sus dependencias.

---

# 18. Datos derivados

Los siguientes valores no necesitan almacenarse como datos independientes:

```text
Nutrition de Recipe
Nutrition de Meal
Nutrition diaria
Necesidades de compra
```

Se calculan a partir de los datos persistidos.

---

## 18.1. Dependencias

```text
Ingredient.nutrition
        ↓
RecipeIngredient
        ↓
Recipe Nutrition
        ↓
MealItem
        ↓
Meal Nutrition
        ↓
MealPlanItem
        ↓
Daily Nutrition
```

---

## 18.2. Necesidades de compra

```text
MealPlan
    ↓
MealPlanItem
    ↓
Meal
    ↓
MealItem
    ↓
Necesidades planificadas
    ↓
InventoryItem
    ↓
ShoppingItem
```

---

# 19. Consideraciones sobre persistencia

Las entidades persistentes son:

```text
Ingredient
Product
Recipe
RecipeIngredient
Meal
MealItem
MealPlan
MealPlanItem
InventoryItem
ShoppingItem
ShoppingItemSource
```

Los siguientes datos pueden calcularse bajo demanda:

```text
Nutrition de Recipe
Nutrition de Meal
Nutrition diaria
Necesidades de compra
Desglose de fuentes
```

---

# 20. Resumen del modelo

El modelo de datos mantiene separadas las responsabilidades principales:

```text
Ingredient
```

representa el alimento genérico.

```text
Product
```

representa el producto comercial.

```text
Recipe
```

representa una preparación.

```text
Meal
```

representa un conjunto de elementos consumidos juntos.

```text
MealPlan
```

representa lo planificado.

```text
InventoryItem
```

representa lo disponible.

```text
ShoppingItem
```

representa lo pendiente de comprar.

```text
ShoppingItemSource
```

representa el origen de una necesidad.

El modelo evita mezclar:

```text
lo planificado;
```

```text
lo disponible;
```

```text
lo comprado;
```

y:

```text
lo pendiente de comprar.
```

Cada entidad representa un concepto independiente y las relaciones que contienen información propia se modelan mediante entidades de relación independientes.
