# Algoritmos de negocio

Este documento define los algoritmos que implementan los cálculos y comportamientos principales de la aplicación.

Los algoritmos describen cómo se calculan los datos derivados y cómo se actualizan las entidades cuando el usuario realiza acciones o cuando cambian los datos de los que dependen.

---
## Índice

* [1. Principios generales](#1-principios-generales)

  * [1.1. Los datos derivados no se persisten](#11-los-datos-derivados-no-se-persisten)

* [2. Algoritmos de unidades y conversiones](#2-algoritmos-de-unidades-y-conversiones)

  * [2.1. Unidades disponibles](#21-unidades-disponibles)
  * [2.2. Unidad por defecto del Ingredient](#22-unidad-por-defecto-del-ingredient)
  * [2.3. Equivalencia de unidades de conteo](#23-equivalencia-de-unidades-de-conteo)
  * [2.4. Uso de una unidad sin equivalencia](#24-uso-de-una-unidad-sin-equivalencia)
  * [2.5. Conversión de unidades](#25-conversión-de-unidades)

* [3. Algoritmos de nutrición](#3-algoritmos-de-nutrición)

  * [3.1. Nutrición completa](#31-nutrición-completa)
  * [3.2. Cálculo de nutrición de un Ingredient](#32-cálculo-de-nutrición-de-un-ingredient)
  * [3.3. Cálculo de nutrición utilizando unidades de conteo](#33-cálculo-de-nutrición-utilizando-unidades-de-conteo)
  * [3.4. Nutrición incompleta de un Ingredient](#34-nutrición-incompleta-de-un-ingredient)

* [4. Cálculo de nutrición de una Recipe](#4-cálculo-de-nutrición-de-una-recipe)

  * [4.1. Proceso general](#41-proceso-general)
  * [4.2. Ejemplo](#42-ejemplo)
  * [4.3. Nutrición incompleta de una Recipe](#43-nutrición-incompleta-de-una-recipe)

* [5. Cálculo de nutrición de un Meal](#5-cálculo-de-nutrición-de-un-meal)

* [6. Cálculo de nutrición diaria](#6-cálculo-de-nutrición-diaria)

* [7. Cálculo de necesidades del MealPlan](#7-cálculo-de-necesidades-del-mealplan)

  * [7.1. Obtener necesidades individuales](#71-obtener-necesidades-individuales)

* [8. Comparación entre necesidades e inventario](#8-comparación-entre-necesidades-e-inventario)

  * [8.1. El inventario cubre completamente la necesidad](#81-el-inventario-cubre-completamente-la-necesidad)
  * [8.2. El inventario cubre parcialmente la necesidad](#82-el-inventario-cubre-parcialmente-la-necesidad)
  * [8.3. No existe inventario](#83-no-existe-inventario)

* [9. Creación y sincronización de ShoppingItems](#9-creación-y-sincronización-de-shoppingitems)

  * [9.1. ShoppingItem automático](#91-shoppingitem-automático)
  * [9.2. Creación inicial](#92-creación-inicial)
  * [9.3. Cambio en un MealItem](#93-cambio-en-un-mealitem)

* [10. Sincronización de necesidades con ShoppingItems](#10-sincronización-de-necesidades-con-shoppingitems)

  * [10.1. ShoppingItem no comprado](#101-shoppingitem-no-comprado)
  * [10.2. ShoppingItem ya comprado](#102-shoppingitem-ya-comprado)
  * [10.3. Cuando se compra la nueva necesidad](#103-cuando-se-compra-la-nueva-necesidad)

* [11. ShoppingItem y sus sources](#11-shoppingitem-y-sus-sources)

  * [11.1. Source de MealItem](#111-source-de-mealitem)
  * [11.2. Source manual](#112-source-manual)
  * [11.3. Desglose de un ShoppingItem](#113-desglose-de-un-shoppingitem)
  * [11.4. Cantidad extra](#114-cantidad-extra)

* [12. Transferir una compra al inventario](#12-transferir-una-compra-al-inventario)

* [13. Marcar un ShoppingItem como comprado](#13-marcar-un-shoppingitem-como-comprado)

* [14. Añadir un ShoppingItem al inventario](#14-añadir-un-shoppingitem-al-inventario)

  * [14.1. Si no existe InventoryItem equivalente](#141-si-no-existe-inventoryitem-equivalente)
  * [14.2. Si ya existe InventoryItem equivalente](#142-si-ya-existe-inventoryitem-equivalente)

* [15. Consumo desde un MealItem](#15-consumo-desde-un-mealitem)

  * [15.1. Abrir el diálogo de consumo](#151-abrir-el-diálogo-de-consumo)
  * [15.2. Límite máximo](#152-límite-máximo)
  * [15.3. Confirmación](#153-confirmación)

* [16. Eliminar cantidad del inventario](#16-eliminar-cantidad-del-inventario)

* [17. Consolidación del inventario](#17-consolidación-del-inventario)

* [18. Propagación de cambios](#18-propagación-de-cambios)

  * [18.1. Cambiar la nutrición de un Ingredient](#181-cambiar-la-nutrición-de-un-ingredient)
  * [18.2. Cambiar la equivalencia de unidades](#182-cambiar-la-equivalencia-de-unidades)
  * [18.3. Cambiar el defaultUnit](#183-cambiar-el-defaultunit)

* [19. Eliminación de entidades utilizadas](#19-eliminación-de-entidades-utilizadas)

* [20. Eliminación de una Recipe](#20-eliminación-de-una-recipe)

* [21. Eliminación de un Product o Ingredient](#21-eliminación-de-un-product-o-ingredient)

* [22. Resumen de los principales algoritmos](#22-resumen-de-los-principales-algoritmos)

  * [Nutrición](#nutrición)
  * [Necesidades](#necesidades)
  * [ShoppingList](#shoppinglist)
  * [Compra](#compra)
  * [Consumo](#consumo)
  * [Propagación](#propagación)

* [Principio central](#principio-central)

---

# 1. Principios generales

## 1.1. Los datos derivados no se persisten

Los siguientes datos se calculan a partir de otras entidades:

* nutrición de una `Recipe`;
* nutrición de un `Meal`;
* nutrición diaria;
* necesidades del `MealPlan`;
* diferencias entre necesidades e inventario;
* cantidades de `ShoppingItems` automáticos;
* información derivada del desglose de un `ShoppingItem`.

Estos datos no deben persistirse como fuente de verdad independiente.

La fuente de verdad son las entidades originales:

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

# 2. Algoritmos de unidades y conversiones

## 2.1. Unidades disponibles

La aplicación dispone de un conjunto común de unidades:

```text
g
kg
ml
l
unit
```

No se restringen globalmente las unidades que pueden utilizarse para cualquier ingrediente.

La unidad válida depende del contexto y de la configuración del propio `Ingredient`.

---

## 2.2. Unidad por defecto del Ingredient

Un `Ingredient` puede definir una unidad por defecto:

```text
Ingredient
├── name: "Leche"
└── defaultUnit: "ml"
```

Esta unidad se utiliza como unidad de referencia preferida para:

* mostrar necesidades de compra;
* agrupar cantidades;
* convertir cantidades equivalentes;
* mostrar el total de un `ShoppingItem`.

La unidad por defecto no obliga a utilizar siempre esa unidad en:

* recetas;
* comidas;
* inventario;
* lista de la compra.

Por ejemplo:

```text
Ingredient
└── Leche
    └── defaultUnit: ml
```

Puede utilizarse en una receta como:

```text
500 ml
```

y en otra como:

```text
1 l
```

Las cantidades se convierten internamente a la unidad por defecto para poder compararlas y sumarlas.

---

## 2.3. Equivalencia de unidades de conteo

Un ingrediente puede definir una equivalencia entre una unidad de conteo y una unidad medible:

```text
Ingredient
└── Huevo
    ├── defaultUnit: g
    └── unitEquivalence:
        ├── unit: unit
        ├── equivalentQuantity: 50
        └── equivalentUnit: g
```

Esto significa:

```text
1 unit = 50 g
```

La equivalencia no es obligatoria.

Por ejemplo:

```text
Pasta
└── defaultUnit: g
```

no necesita necesariamente:

```text
1 unit = X g
```

Sin embargo, si el usuario quiere utilizar:

```text
1 unit
```

para ese ingrediente en un cálculo que requiera conversión, la aplicación debe solicitar una equivalencia.

---

## 2.4. Uso de una unidad sin equivalencia

Si un usuario intenta utilizar una unidad de conteo:

```text
Huevo: 2 units
```

y el ingrediente no tiene una equivalencia:

```text
1 unit = ? g
```

la aplicación no puede realizar conversiones dependientes de esa equivalencia.

Por tanto:

* no puede convertir correctamente la cantidad a la unidad por defecto;
* no puede calcular correctamente la nutrición;
* no puede comparar correctamente esa cantidad con otra expresada en gramos;
* no puede calcular correctamente una necesidad de compra combinada.

La aplicación debe impedir el uso de la unidad cuando el cálculo requiera la equivalencia.

Debe mostrar, por ejemplo:

```text
Para utilizar este ingrediente en unidades necesitas indicar
a cuánto equivale una unidad.
```

---

## 2.5. Conversión de unidades

Cuando dos cantidades utilizan unidades diferentes:

```text
500 ml
1 l
```

la aplicación convierte ambas a la unidad por defecto:

```text
500 ml → 500 ml
1 l → 1000 ml
```

Después puede realizar operaciones:

```text
500 ml + 1000 ml = 1500 ml
```

Resultado:

```text
1.5 l
```

o:

```text
1500 ml
```

según el formato de presentación elegido.

---

# 3. Algoritmos de nutrición

## 3.1. Nutrición completa

Una nutrición se considera completa cuando contiene todos los valores necesarios para realizar los cálculos nutricionales principales:

```text
calories
protein
carbohydrates
fat
```

La fibra puede incluirse como dato nutricional adicional:

```text
fiber
```

pero su ausencia no impide calcular:

* calorías;
* proteínas;
* carbohidratos;
* grasas.

Por tanto, la información puede diferenciarse entre:

```text
Nutritional data complete
```

cuando están presentes todos los valores principales:

```text
calories
protein
carbohydrates
fat
```

y:

```text
Additional nutritional data available
```

cuando además existen datos como:

```text
fiber
sugar
saturatedFat
salt
```

---

## 3.2. Cálculo de nutrición de un Ingredient

La nutrición de un `Ingredient` se define para una cantidad de referencia:

```text
Nutrition
├── basisQuantity: 100
├── basisUnit: g
├── calories
├── protein
├── carbohydrates
└── fat
```

Ejemplo:

```text
100 g de pasta
├── 350 kcal
├── 12 g protein
├── 70 g carbohydrates
└── 2 g fat
```

Para calcular la nutrición de una cantidad diferente:

```text
cantidad utilizada
------------------
cantidad de referencia
```

Ejemplo:

```text
200 g / 100 g = 2
```

Por tanto:

```text
350 kcal × 2 = 700 kcal
```

---

## 3.3. Cálculo de nutrición utilizando unidades de conteo

Si existe una equivalencia:

```text
1 huevo = 50 g
```

y la nutrición es:

```text
100 g de huevo
├── 140 kcal
└── ...
```

para:

```text
2 huevos
```

se calcula:

```text
2 huevos × 50 g = 100 g
```

y después:

```text
100 g / 100 g = 1
```

Por tanto:

```text
2 huevos
= nutrición de 100 g
```

---

## 3.4. Nutrición incompleta de un Ingredient

Si falta cualquiera de los valores principales:

```text
calories
protein
carbohydrates
fat
```

la nutrición se considera incompleta.

El ingrediente puede seguir utilizándose para:

* recetas;
* comidas;
* planes;
* necesidades de compra;
* inventario.

Sin embargo, cualquier cálculo nutricional que dependa de él debe marcarse como incompleto.

---

# 4. Cálculo de nutrición de una Recipe

## 4.1. Proceso general

Para cada:

```text
RecipeIngredient
```

se obtiene:

```text
Ingredient
    ↓
Nutrition
    ↓
Quantity utilizada
    ↓
Nutrition proporcional
```

Después se suman los resultados.

```text
Recipe
├── Ingredient A → Nutrition
├── Ingredient B → Nutrition
└── Ingredient C → Nutrition

        ↓

Nutrition total de la Recipe
```

---

## 4.2. Ejemplo

```text
Recipe: Tostadas
servings: 2
```

Ingredientes:

```text
Pan
└── 100 g

Leche
└── 500 ml
```

El algoritmo:

1. obtiene la nutrición del pan;
2. calcula la nutrición correspondiente a 100 g;
3. obtiene la nutrición de la leche;
4. calcula la nutrición correspondiente a 500 ml;
5. suma todos los valores.

Resultado:

```text
Nutrition de la Recipe
=
Nutrition del pan
+
Nutrition de la leche
```

---

## 4.3. Nutrición incompleta de una Recipe

Si uno o varios ingredientes no tienen nutrición completa:

```text
Recipe
├── Ingredient A → complete
├── Ingredient B → complete
└── Ingredient C → incomplete
```

el algoritmo:

1. calcula los valores disponibles;
2. suma los valores que pueden calcularse;
3. marca el resultado como incompleto;
4. identifica los ingredientes que provocan la incompletitud.

Resultado conceptual:

```text
RecipeNutrition
├── calories: partial value
├── protein: partial value
├── carbohydrates: partial value
├── fat: partial value
└── complete: false
```

La aplicación no debe presentar los valores parciales como si fueran valores completos.

---

# 5. Cálculo de nutrición de un Meal

Un `Meal` puede contener:

```text
Recipe
Ingredient
Product
```

Para cada `MealItem`:

1. se obtiene su cantidad;
2. se calcula su nutrición;
3. se aplica la cantidad correspondiente;
4. se suma al total.

```text
Meal
├── Recipe
├── Ingredient
└── Product

        ↓

Nutrition total del Meal
```

Si cualquiera de los elementos tiene nutrición incompleta:

```text
complete: false
```

El `Meal` sigue siendo completamente válido para:

* planificación;
* compras;
* inventario.

La incompletitud solo afecta al cálculo nutricional.

---

# 6. Cálculo de nutrición diaria

Para una fecha:

```text
2026-07-25
```

se obtienen todos los `Meals` planificados:

```text
Breakfast
Lunch
Snack
Dinner
```

Después:

```text
Nutrition diaria
=
Nutrition Breakfast
+
Nutrition Lunch
+
Nutrition Snack
+
Nutrition Dinner
```

Si algún `Meal` tiene nutrición incompleta:

```text
DailyNutrition.complete = false
```

El resultado debe indicar qué `Meal` contiene la información incompleta.

---

# 7. Cálculo de necesidades del MealPlan

## 7.1. Obtener necesidades individuales

Se recorren todos los:

```text
Meal
```

del período analizado.

Para cada `Meal`:

```text
Meal
    ↓
MealItem
```

se obtiene el elemento consumido.

---

### Si el MealItem es una Recipe

Se obtienen sus:

```text
RecipeIngredients
```

y se multiplica la cantidad de cada ingrediente por la cantidad de raciones utilizadas.

Ejemplo:

```text
Recipe
└── 2 servings
```

Ingredientes:

```text
Pasta: 200 g
Huevo: 2 units
```

Si el MealItem utiliza:

```text
4 servings
```

el factor es:

```text
4 / 2 = 2
```

Necesidad:

```text
Pasta: 400 g
Huevo: 4 units
```

---

### Si el MealItem es un Ingredient

Se utiliza directamente:

```text
Ingredient
└── quantity
```

---

### Si el MealItem es un Product

Se utiliza directamente:

```text
Product
└── quantity
```

---

## 7.2. Agrupar necesidades equivalentes

Todas las necesidades se agrupan por el elemento que representan.

Ejemplo:

```text
Meal A
└── Leche: 1 l

Meal B
└── Leche: 500 ml
```

Se convierten a la unidad de referencia:

```text
1000 ml
+
500 ml
=
1500 ml
```

Resultado:

```text
Necesidad total de Leche: 1500 ml
```

---

# 8. Comparación entre necesidades e inventario

Para cada necesidad:

```text
Necesidad
```

se obtiene:

```text
InventoryItem equivalente
```

Si existe.

---

## 8.1. El inventario cubre completamente la necesidad

```text
Necesidad: 500 g
Inventario: 700 g
```

Resultado:

```text
Necesidad de compra: 0 g
```

No se crea una nueva necesidad de compra.

---

## 8.2. El inventario cubre parcialmente la necesidad

```text
Necesidad: 500 g
Inventario: 200 g
```

Resultado:

```text
Necesidad de compra: 300 g
```

---

## 8.3. No existe inventario

```text
Necesidad: 500 g
Inventario: 0 g
```

Resultado:

```text
Necesidad de compra: 500 g
```

---

# 9. Creación y sincronización de ShoppingItems

## 9.1. ShoppingItem automático

Un `ShoppingItem` automático contiene:

```text
ShoppingItem
├── ingredientId / productId
├── quantity
├── unit
├── checked
└── sources
```

Sus fuentes representan el origen de la necesidad:

```text
ShoppingItemSource
└── mealItemId
```

---

## 9.2. Creación inicial

Cuando se crea un `ShoppingItem` automático:

```text
sources
├── Source A: 1 l
└── Source B: 500 ml
```

se calcula:

```text
ShoppingItem.quantity
=
sum(sources.quantity)
```

Resultado:

```text
ShoppingItem
└── quantity: 1.5 l
```

---

## 9.3. Cambio en un MealItem

Si cambia la cantidad de un `MealItem`:

```text
MealItem
└── Leche: 500 ml
```

pasa a:

```text
MealItem
└── Leche: 1 l
```

se actualiza únicamente la fuente correspondiente:

```text
ShoppingItemSource
└── quantity: 1 l
```

La cantidad total del `ShoppingItem` se recalcula según las reglas de sincronización descritas a continuación.

---

# 10. Sincronización de necesidades con ShoppingItems

El `ShoppingItem` representa una cantidad que el usuario todavía tiene pendiente de comprar.

La aplicación debe distinguir entre:

```text
Necesidad calculada actualmente
```

y:

```text
Cantidad que todavía queda pendiente de comprar
```

---

## 10.1. ShoppingItem no comprado

Ejemplo:

```text
ShoppingItem
└── quantity: 1.5 l
    checked: false
```

Las fuentes son:

```text
Source A: 1 l
Source B: 500 ml
```

Si cambia el plan y la necesidad pasa a:

```text
2 l
```

el `ShoppingItem` se actualiza:

```text
ShoppingItem
└── quantity: 2 l
```

y sus fuentes reflejan:

```text
Source A: 1.5 l
Source B: 500 ml
```

---

## 10.2. ShoppingItem ya comprado

Ejemplo:

```text
ShoppingItem
└── quantity: 1.5 l
    checked: true
```

El usuario ha indicado:

```text
Ya lo he comprado.
```

Si el plan cambia y ahora se necesitan:

```text
2 l
```

la aplicación no debe convertir automáticamente:

```text
1.5 l
```

en:

```text
2 l
```

porque los:

```text
1.5 l
```

ya representan una compra realizada.

La nueva necesidad pendiente es:

```text
2 l - 1.5 l = 500 ml
```

Por tanto, se crea o mantiene un nuevo `ShoppingItem`:

```text
ShoppingItem A
└── 1.5 l
    checked: true

ShoppingItem B
└── 500 ml
    checked: false
```

---

## 10.3. Cuando se compra la nueva necesidad

Si el usuario marca el nuevo elemento:

```text
500 ml
```

como comprado:

```text
ShoppingItem B
└── checked: true
```

ambos elementos representan compras realizadas relacionadas con la misma necesidad.

La interfaz puede mostrar el total comprado:

```text
1.5 l + 500 ml = 2 l
```

y mantener la información de origen de cada cantidad.

---

# 11. ShoppingItem y sus sources

## 11.1. Source de MealItem

Una fuente de MealPlan representa la cantidad que procede de un `MealItem` concreto:

```text
ShoppingItemSource
{
    type: "meal-plan",
    mealItemId,
    quantity,
    unit
}
```

No se utiliza únicamente el `mealPlanId`, ya que un mismo `MealPlan` puede contener múltiples `MealItems` que generan necesidades diferentes.

---

## 11.2. Source manual

Una fuente manual representa una cantidad introducida directamente por el usuario:

```text
ShoppingItemSource
{
    type: "manual",
    quantity,
    unit
}
```

---

## 11.3. Desglose de un ShoppingItem

Cuando el usuario abre el desglose:

```text
GET /shopping-items/:id/breakdown
```

el backend:

1. obtiene el `ShoppingItem`;
2. obtiene sus `sources`;
3. calcula la suma de las cantidades de las fuentes;
4. convierte las cantidades a la unidad de referencia;
5. compara el resultado con `ShoppingItem.quantity`.

Ejemplo:

```text
ShoppingItem.quantity
└── 1.5 l
```

Sources:

```text
Source A
└── 1 l

Source B
└── 500 ml
```

Resultado:

```text
Sources total = 1.5 l
```

No existe diferencia.

---

## 11.4. Cantidad extra

Si:

```text
ShoppingItem.quantity
=
2 l
```

pero:

```text
Sources total
=
1.5 l
```

existe una diferencia:

```text
Extra
=
500 ml
```

La respuesta del endpoint puede incluir:

```text
{
    quantity: 2,
    unit: "l",

    sources: [
        ...
    ],

    extra: {
        quantity: 500,
        unit: "ml"
    }
}
```

La cantidad extra representa una cantidad que actualmente pertenece al `ShoppingItem`, pero que no puede atribuirse a una fuente concreta.

Esto puede ocurrir cuando:

* el usuario compró más cantidad de la inicialmente planificada;
* la cantidad de un `ShoppingItem` se modificó;
* una fuente cambió después de que se realizara una compra;
* la estructura del plan cambió.

La cantidad extra no debe modificar automáticamente las fuentes originales.

---

# 12. Transferir una compra al inventario

Cuando el usuario selecciona:

```text
Añadir al inventario
```

se abre un diálogo.

El valor inicial puede ser:

```text
ShoppingItem.quantity
```

pero el usuario puede modificarlo.

Ejemplo:

```text
ShoppingItem
└── 2 l
```

El usuario realmente ha comprado:

```text
1.5 l
```

Introduce:

```text
1.5 l
```

El algoritmo:

1. crea o actualiza el `InventoryItem`;
2. añade la cantidad introducida al inventario;
3. reduce la cantidad pendiente del `ShoppingItem`;
4. elimina el `ShoppingItem` si la cantidad pendiente llega a cero.

Ejemplo:

```text
ShoppingItem
└── 2 l
```

Usuario añade al inventario:

```text
1.5 l
```

Resultado:

```text
InventoryItem
└── 1.5 l
```

```text
ShoppingItem
└── 500 ml
```

El `ShoppingItem` no se elimina necesariamente si todavía queda una cantidad pendiente.

---

# 13. Marcar un ShoppingItem como comprado

Marcar:

```text
checked = true
```

únicamente significa:

```text
El usuario indica que ha comprado esa cantidad.
```

No modifica automáticamente:

```text
InventoryItem
```

El usuario debe realizar posteriormente:

```text
Añadir al inventario
```

para convertir la cantidad comprada en cantidad disponible.

---

# 14. Añadir un ShoppingItem al inventario

## 14.1. Si no existe InventoryItem equivalente

Se crea:

```text
InventoryItem
└── quantity: X
```

---

## 14.2. Si ya existe InventoryItem equivalente

Se suman las cantidades si las unidades son compatibles.

Ejemplo:

```text
Inventory:
└── Leche: 500 ml
```

Se añade:

```text
1 l
```

Resultado:

```text
Inventory:
└── Leche: 1.5 l
```

---

# 15. Consumo desde un MealItem

El consumo se realiza desde un `MealItem`, pero no modifica el `MealItem`.

El `MealItem` continúa representando:

```text
Lo que estaba planificado.
```

El inventario representa:

```text
Lo que queda disponible.
```

---

## 15.1. Abrir el diálogo de consumo

Desde un `MealItem` se puede abrir:

```text
Consumir ingredientes
```

Si el `MealItem` es una receta:

```text
Recipe
├── Pasta
├── Leche
└── Huevo
```

el diálogo muestra:

```text
Pasta
[-] 0 [+] g

Leche
[-] 0 [+] ml

Huevo
[-] 0 [+] units
```

---

## 15.2. Límite máximo

La cantidad máxima que puede consumirse es la cantidad disponible en el inventario.

Ejemplo:

```text
Inventory
└── Leche: 500 ml
```

El usuario no puede consumir:

```text
600 ml
```

El botón:

```text
+
```

se desactiva cuando:

```text
Cantidad seleccionada
=
Cantidad disponible
```

---

## 15.3. Confirmación

Cuando el usuario confirma:

```text
Consumir
```

para cada ingrediente:

```text
InventoryItem.quantity
=
InventoryItem.quantity
-
cantidad consumida
```

El `MealItem` no cambia.

No se modifica:

```text
MealItem.quantity
```

No se modifica:

```text
RecipeIngredient.quantity
```

No se modifica:

```text
Meal
```

---

# 16. Eliminar cantidad del inventario

La eliminación manual del inventario es explícita.

Al pulsar:

```text
Eliminar
```

se muestra:

```text
¿Quieres eliminar Leche del inventario?
```

La cantidad inicial es:

```text
Cantidad disponible actual
```

pero el usuario solo puede:

```text
reducir
```

la cantidad.

Nunca puede introducir una cantidad superior a la existente.

Ejemplo:

```text
Inventory
└── Leche: 2 l
```

El usuario puede eliminar:

```text
500 ml
```

Resultado:

```text
Leche: 1.5 l
```

No puede eliminar:

```text
3 l
```

---

# 17. Consolidación del inventario

Cuando se añade una cantidad:

```text
Ingredient
```

o:

```text
Product
```

al inventario:

1. se busca un elemento equivalente;
2. se comprueba si las unidades son compatibles;
3. si son compatibles, se suman;
4. si no son compatibles, se mantiene una entrada separada o se solicita una conversión válida.

Ejemplo:

```text
Inventory
└── Pasta: 500 g
```

Añadir:

```text
200 g
```

Resultado:

```text
Pasta: 700 g
```

---

# 18. Propagación de cambios

## 18.1. Cambiar la nutrición de un Ingredient

Si cambia:

```text
Ingredient.nutrition
```

no se modifican permanentemente:

```text
Recipe
Meal
MealPlan
```

La próxima vez que se consulte:

```text
RecipeNutrition
```

se recalcula con los nuevos valores.

El cambio se propaga de forma calculada:

```text
Ingredient
    ↓
RecipeNutrition
    ↓
MealNutrition
    ↓
DailyNutrition
```

---

## 18.2. Cambiar la equivalencia de unidades

Si cambia:

```text
1 unit = 50 g
```

a:

```text
1 unit = 60 g
```

los cálculos posteriores utilizan:

```text
1 unit = 60 g
```

La nutrición calculada se recalcula.

Las cantidades originales de:

```text
RecipeIngredient
MealItem
InventoryItem
ShoppingItem
```

no se modifican automáticamente.

Solo cambia la interpretación necesaria para los cálculos.

---

## 18.3. Cambiar el defaultUnit

Si cambia:

```text
defaultUnit: ml
```

a:

```text
defaultUnit: l
```

las cantidades se convierten para los cálculos y presentaciones que utilicen la unidad de referencia.

Ejemplo:

```text
1500 ml
```

se presenta como:

```text
1.5 l
```

La cantidad física representada no cambia.

---

# 19. Eliminación de entidades utilizadas

La aplicación no debe permitir eliminar una entidad que esté siendo utilizada si la eliminación provoca referencias inválidas.

Ejemplo:

```text
Ingredient
└── Huevo
```

está utilizado por:

```text
Recipe A
Recipe B
Recipe C
```

Al intentar eliminarlo:

```text
No se puede eliminar este ingrediente.
Está siendo utilizado en:

- Recipe A
- Recipe B
- Recipe C
```

El usuario debe poder identificar todas las referencias antes de decidir qué hacer.

---

# 20. Eliminación de una Recipe

Si una `Recipe` está siendo utilizada por:

```text
MealItems
```

la aplicación debe mostrar dónde se utiliza.

Por ejemplo:

```text
No se puede eliminar esta receta.

Está utilizada en:

- Lunes — Comida
- Miércoles — Cena
```

La eliminación solo puede realizarse cuando las referencias dependientes se hayan resuelto.

---

# 21. Eliminación de un Product o Ingredient

Antes de eliminar:

```text
Product
```

o:

```text
Ingredient
```

la aplicación comprueba sus referencias.

Puede estar utilizado en:

```text
Recipe
MealItem
InventoryItem
ShoppingItem
```

Si existen referencias activas que impiden la eliminación:

```text
No se puede eliminar este elemento.

Está siendo utilizado en:
...
```

---

# 22. Resumen de los principales algoritmos

## Nutrición

```text
Ingredient
    ↓
Nutrition proporcional
    ↓
Recipe
    ↓
Meal
    ↓
Daily Nutrition
```

---

## Necesidades

```text
MealPlan
    ↓
Meal
    ↓
MealItem
    ↓
Recipe / Ingredient / Product
    ↓
Necesidades agrupadas
    ↓
Comparación con Inventory
    ↓
Necesidades de compra
```

---

## ShoppingList

```text
Necesidad
    ↓
ShoppingItem
    ↓
ShoppingItemSource
```

Los `sources` explican el origen de la cantidad.

---

## Compra

```text
ShoppingItem
    ↓
Usuario marca como comprado
    ↓
checked = true
```

Después:

```text
Añadir al inventario
    ↓
Usuario confirma cantidad real
    ↓
InventoryItem
    ↓
Se reduce la cantidad pendiente del ShoppingItem
```

---

## Consumo

```text
MealItem
    ↓
Usuario abre consumo
    ↓
Selecciona cantidades
    ↓
No puede superar el InventoryItem
    ↓
Confirma
    ↓
Se descuenta del InventoryItem
```

El `MealItem` no se modifica.

---

## Propagación

```text
Ingredient
    ↓
Recipe
    ↓
Meal
    ↓
MealPlan
```

Los datos calculados se actualizan al volver a calcularse.

---

# Principio central

El sistema distingue siempre entre:

```text
PLANIFICADO
```

lo que el usuario ha decidido consumir;

```text
DISPONIBLE
```

lo que existe actualmente en el inventario;

```text
PENDIENTE DE COMPRAR
```

lo que todavía necesita comprarse.

Y también distingue entre:

```text
CANTIDAD PLANIFICADA
```

```text
CANTIDAD COMPRADA
```

y:

```text
CANTIDAD DISPONIBLE
```

Estas cantidades no deben mezclarse automáticamente.

El usuario confirma explícitamente las transiciones:

```text
ShoppingItem
    ↓
Compra confirmada
    ↓
checked = true
```

y:

```text
ShoppingItem
    ↓
Usuario introduce cantidad real
    ↓
InventoryItem
```

y:

```text
MealItem
    ↓
Usuario indica consumo
    ↓
InventoryItem disminuye
```

La aplicación calcula relaciones entre estos estados, pero no debe asumir que uno implica automáticamente otro.
