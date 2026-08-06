# Casos de uso

Este documento define las acciones que el usuario puede realizar en la aplicación y el comportamiento que debe producir cada una.

Los casos de uso describen:

* qué acción inicia el usuario;
* qué entidades intervienen;
* qué reglas de negocio se aplican;
* qué cambios se producen en el sistema;
* qué información se devuelve.

Los casos de uso no dependen de una interfaz concreta. La misma operación puede ser ejecutada desde diferentes pantallas o componentes de la aplicación.

---
# Índice
- [1. Gestión de Ingredients](#1-gestión-de-ingredients)
- [2. Gestión de Products](#2-gestión-de-products)
- [3. Gestión de Recipes](#3-gestión-de-recipes)
- [4. Gestión de Meals](#4-gestión-de-meals)
- [5. Gestión de MealPlans](#5-gestión-de-mealplans)
- [6. Cálculo de necesidades de compra](#6-cálculo-de-necesidades-de-compra)
- [7. Gestión de ShoppingItems](#7-gestión-de-shoppingItems)
- [8. Compra parcial y ShoppingItems](#8-compra-parcial-y-shoppingitems)
- [9. Gestión de Inventory](#9-gestión-de-inventory)
- [10. Gestión de compras](#10-gestión-de-compras)
- [11. Gestión de ShoppingItem Sources](#11-gestión-de-shoppingItem-sources)
- [12. Modificación de necesidades con ShoppingItems existentes](#12-modificación-de-necesidades-con-shoppingitems-existentes)
- [13. Eliminación de entidades utilizadas](#13-eliminación-de-entidades-utilizadas)
- [14. Reglas generales de consistencia](#14-reglas-generales-de-consistencia)
- [15. Resumen de los principales flujos](#15-resumen-de-los-principales-flujos)
- [Principio central](#principio-central)


---

# 1. Gestión de Ingredients

## UC-01. Crear un Ingredient

### Actor

Usuario.

### Descripción

El usuario crea un alimento genérico que podrá utilizarse en recetas, comidas, inventario o lista de la compra.

### Datos mínimos

```text
Ingredient
├── name
└── nutrition? 
```

El ingrediente puede crearse sin información nutricional.

### Datos opcionales

El usuario puede indicar una equivalencia para unidades de conteo:

```text
1 unidad = X g
```

Por ejemplo:

```text
Huevo
└── 1 ud = 50 g
```

Esta equivalencia no es obligatoria al crear el ingrediente.

### Reglas

* El nombre es obligatorio.
* La nutrición es opcional.
* La equivalencia de unidades de conteo es opcional.
* Si el usuario quiere utilizar posteriormente el ingrediente con una unidad de conteo que requiere equivalencia, la aplicación debe solicitar la equivalencia antes de permitir operaciones que necesiten convertir esa unidad.
* La equivalencia se guarda como una propiedad del `Ingredient`.

### Resultado

```text
Ingredient creado
```

---

## UC-02. Modificar un Ingredient

El usuario puede modificar:

* nombre;
* información nutricional;
* equivalencia de unidades.

### Cambio de nutrición

La nutrición propagada de:

```text
Recipe
Meal
MealPlan
```

se recalcula utilizando los nuevos datos.

La nutrición calculada no se persiste como una copia independiente.

```text
Ingredient
    ↓
Nutrition modificada
    ↓
Recipe
    ↓
Nutrition recalculada
```

---

### Cambio de equivalencia

Si cambia:

```text
1 unidad = 50 g
```

a:

```text
1 unidad = 60 g
```

las conversiones futuras utilizan la nueva equivalencia.

Las cantidades ya utilizadas en las entidades se mantienen en su unidad original.

Por ejemplo:

```text
RecipeIngredient
└── 2 uds
```

sigue siendo:

```text
2 uds
```

pero las operaciones que necesiten convertirlo a gramos utilizarán la nueva equivalencia.

---

### Cambio de unidad predeterminada

Si se modifica la unidad predeterminada utilizada para mostrar necesidades de compra, las necesidades agrupadas futuras pueden expresarse utilizando la nueva unidad.

---

## UC-03. Eliminar un Ingredient

### Regla

No se puede eliminar directamente un ingrediente que está siendo utilizado por otras entidades.

Antes de eliminarlo, el sistema debe comprobar sus dependencias.

Ejemplo:

```text
Ingredient: Leche
│
├── Recipe: Tarta de queso
├── Recipe: Tortitas
└── InventoryItem
```

La aplicación debe mostrar dónde está siendo utilizado.

```text
No se puede eliminar Leche

Este ingrediente se está utilizando en:
- Tarta de queso
- Tortitas
- Inventario
```

El usuario debe resolver las dependencias antes de poder eliminar el ingrediente.

---

# 2. Gestión de Products

## UC-04. Crear un Product

Un `Product` representa un producto comercial concreto.

Ejemplo:

```text
Product
└── Leche Entera Marca X
```

Puede estar relacionado con:

```text
Ingredient
```

o existir de forma independiente.

### Datos

```text
Product
├── name
├── ingredientId?
└── nutrition?
```

La nutrición es específica del producto comercial.

---

## UC-05. Asociar un Product con un Ingredient

El usuario puede relacionar un producto comercial con un alimento genérico.

```text
Ingredient
└── Leche
    └── Product: Leche Marca X
```

La relación no copia automáticamente la nutrición del producto al ingrediente.

---

## UC-06. Utilizar la nutrición de un Product como referencia

El usuario puede decidir utilizar la nutrición de un producto para completar la nutrición de su ingrediente relacionado.

```text
Product
    ↓
Nutrition específica
    ↓
Usuario confirma utilizar como referencia
    ↓
Ingredient
    ↓
Nutrition genérica
```

Esta acción requiere una decisión explícita del usuario.

---

# 3. Gestión de Recipes

## UC-07. Crear una Recipe

El usuario crea una receta formada por uno o varios ingredientes.

```text
Recipe
    ↓
RecipeIngredient
    ↓
Ingredient
```

Cada `RecipeIngredient` contiene:

```text
├── ingredientId
├── quantity
└── unit
```

### Ejemplo

```text
Recipe
└── Tortilla
    ├── Huevo: 4 uds
    └── Patata: 500 g
```

La receta tiene un número base de raciones.

```text
servings: 2
```

---

## UC-08. Añadir un Ingredient a una Recipe

El usuario selecciona:

```text
Ingredient
```

e indica:

```text
quantity
unit
```

### Validación

Si la unidad elegida requiere una equivalencia que el ingrediente no tiene, la aplicación no debe permitir confirmar la operación hasta que se defina la equivalencia.

Ejemplo:

```text
Ingredient: Huevo
Unidad: uds
Equivalencia: no definida
```

Resultado:

```text
No se puede utilizar esta unidad hasta definir:

1 ud = ¿cuántos gramos?
```

---

## UC-09. Modificar una Recipe

El usuario puede modificar:

* ingredientes;
* cantidades;
* unidades;
* número base de raciones.

### Efectos

Los cálculos propagados se actualizan:

```text
Recipe
    ↓
Meal
    ↓
Nutrition diaria
```

También se recalculan las necesidades del `MealPlan`.

```text
Recipe modificada
        ↓
Necesidades recalculadas
        ↓
ShoppingItems actualizados
```

---

## UC-10. Eliminar una Recipe

No se permite eliminar directamente una receta que esté siendo utilizada.

La aplicación debe mostrar sus dependencias.

Ejemplo:

```text
Recipe: Tortilla
│
├── MealItem del lunes
├── MealItem del miércoles
└── MealItem del domingo
```

El usuario debe resolver esas relaciones antes de eliminarla.

---

## UC-11. Calcular la nutrición de una Recipe

La nutrición se calcula a partir de sus ingredientes.

```text
Recipe
    ↓
RecipeIngredients
    ↓
Ingredient Nutrition
    ↓
Conversión de unidades
    ↓
Nutrition total
```

### Ejemplo

```text
Pasta: 200 g
Huevo: 2 uds
```

Si:

```text
1 huevo = 50 g
```

se convierte:

```text
2 uds = 100 g
```

La nutrición se calcula utilizando:

```text
Pasta: 200 g
Huevo: 100 g
```

### Nutrición incompleta

La nutrición se considera incompleta si falta alguno de los campos necesarios para el cálculo.

Campos obligatorios:

```text
calories
protein
carbohydrates
fat
```

La fibra puede estar disponible como dato adicional.

La ausencia de fibra no hace que la nutrición sea incompleta para los cálculos principales.

---

# 4. Gestión de Meals

## UC-12. Crear un Meal

Un `Meal` representa una combinación de elementos que se consumen juntos.

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
└── Product: Yogur
```

---

## UC-13. Añadir un MealItem

Cada `MealItem` referencia exactamente un tipo de elemento:

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

### Recipe

La cantidad se expresa en raciones.

```text
Recipe
└── servings: 2
```

### Ingredient / Product

La cantidad se expresa con:

```text
quantity
unit
```

---

## UC-14. Modificar un Meal

El usuario puede:

* añadir elementos;
* eliminar elementos;
* modificar cantidades;
* modificar las raciones de una receta.

### Efectos

Se recalculan:

```text
Nutrition del Meal
```

y:

```text
Necesidades del MealPlan
```

---

## UC-15. Calcular la nutrición de un Meal

La nutrición del `Meal` se calcula combinando la nutrición de todos sus `MealItems`.

```text
Meal
├── Recipe
├── Ingredient
└── Product
        ↓
Nutrition individual
        ↓
Conversión de cantidades
        ↓
Nutrition total del Meal
```

Si alguno de los elementos tiene una nutrición incompleta:

```text
Meal
└── Nutrition: incompleta
```

El sistema debe identificar el elemento que causa la información incompleta.

---

# 5. Gestión de MealPlans

## UC-16. Crear una planificación

El usuario crea o utiliza un `MealPlan` para organizar comidas en fechas concretas.

Cada `Meal` pertenece a:

```text
fecha
```

y:

```text
momento del día
```

Por ejemplo:

```text
2026-07-25
└── lunch
```

---

## UC-17. Añadir un Meal a un MealPlan

El usuario selecciona:

```text
Meal
```

y lo asigna a:

```text
fecha
```

y:

```text
momento
```

---

## UC-18. Modificar un MealPlan

El usuario puede:

* añadir Meals;
* eliminar Meals;
* cambiar la fecha;
* cambiar el momento;
* modificar los elementos de los Meals;
* cambiar cantidades.

### Efectos

Se recalculan las necesidades de compra.

```text
MealPlan modificado
        ↓
Necesidades recalculadas
        ↓
ShoppingItems actualizados
```

La nutrición diaria también se recalcula.

---

## UC-19. Calcular la nutrición diaria

La nutrición diaria se obtiene sumando los Meals del día.

```text
Día
    ↓
Meals
    ↓
Nutrition de cada Meal
    ↓
Nutrition total
```

Si un Meal tiene nutrición incompleta:

```text
Nutrition diaria
└── incompleta
```

El sistema debe identificar el origen de la información que falta.

---

# 6. Cálculo de necesidades de compra

## UC-20. Calcular necesidades del MealPlan

El sistema calcula qué cantidades son necesarias para cubrir los elementos planificados.

```text
MealPlan
    ↓
Meals
    ↓
MealItems
    ↓
Necesidades
    ↓
Agrupación
```

Las necesidades equivalentes se agrupan.

Ejemplo:

```text
Meal A → Leche: 500 ml
Meal B → Leche: 1 l
```

Resultado:

```text
Necesidad total:
1,5 l
```

La unidad de presentación se determina según la unidad utilizada para el ingrediente y las reglas de conversión disponibles.

---

## UC-21. Comparar necesidades con Inventory

El sistema compara:

```text
Necesidades planificadas
```

con:

```text
Inventory disponible
```

### Inventario suficiente

```text
Necesidad: 500 g
Inventario: 700 g
```

Resultado:

```text
Necesidad de compra: 0
```

### Inventario parcial

```text
Necesidad: 500 g
Inventario: 200 g
```

Resultado:

```text
Necesidad de compra: 300 g
```

### Sin inventario

```text
Necesidad: 500 g
Inventario: 0 g
```

Resultado:

```text
Necesidad de compra: 500 g
```

---

# 7. Gestión de ShoppingItems

## UC-22. Crear un ShoppingItem automático

Un `ShoppingItem` automático se crea a partir de una necesidad de compra.

Ejemplo:

```text
MealPlan
    ↓
Necesidad de Leche: 1,5 l
    ↓
ShoppingItem
```

El `ShoppingItem` contiene:

```text
ShoppingItem
├── quantity
├── unit
├── checked
└── sources
```

---

## UC-23. Crear un ShoppingItem manual

El usuario puede añadir directamente un elemento.

Ejemplo:

```text
Papel de cocina
```

No es necesario crear previamente un `Product`.

```text
ShoppingItem
└── name: "Papel de cocina"
```

Su origen es:

```text
source.type = "manual"
```

---

## UC-24. Agrupar necesidades equivalentes

Las necesidades del mismo elemento se agrupan en un único `ShoppingItem`.

Ejemplo:

```text
Meal A → Leche: 500 ml
Meal B → Leche: 1 l
```

Resultado:

```text
ShoppingItem
└── Leche: 1,5 l
```

Las fuentes se mantienen:

```text
sources:
├── MealItem A → 500 ml
└── MealItem B → 1 l
```

---

## UC-25. Actualizar una fuente de ShoppingItem

Cuando cambia el `MealItem` que originó una necesidad:

```text
MealItem
└── Leche: 500 ml
```

se actualiza su `ShoppingItemSource`.

```text
ShoppingItemSource
└── quantity: 500 ml
```

La cantidad total del `ShoppingItem` puede mantenerse separada de la cantidad de sus fuentes.

Esto permite conservar cantidades que ya fueron compradas.

---

# 8. Compra parcial y ShoppingItems

## UC-26. Añadir parcialmente un ShoppingItem al Inventory

El usuario puede comprar una cantidad diferente de la cantidad planificada.

Ejemplo:

```text
ShoppingItem
└── Leche: 1,5 l
```

El usuario compra:

```text
1 l
```

Al seleccionar:

```text
Añadir al inventario
```

se abre un diálogo.

```text
Cantidad comprada:
[ 1 l ]
```

El usuario puede modificar la cantidad.

---

### Resultado

Se añade al inventario:

```text
InventoryItem
└── Leche: 1 l
```

El ShoppingItem se actualiza:

```text
ShoppingItem
└── Leche: 500 ml
```

La cantidad restante continúa pendiente de compra.

---

## UC-27. Añadir completamente un ShoppingItem al Inventory

Ejemplo:

```text
ShoppingItem
└── Leche: 1,5 l
```

El usuario añade:

```text
1,5 l
```

al inventario.

Resultado:

```text
InventoryItem
└── Leche: 1,5 l
```

El `ShoppingItem` se elimina.

---

## UC-28. Consolidar una compra con un InventoryItem existente

Si ya existe:

```text
InventoryItem
└── Leche: 500 ml
```

y se añade:

```text
1 l
```

el sistema consolida:

```text
InventoryItem
└── Leche: 1,5 l
```

si las unidades son compatibles.

---

# 9. Gestión de Inventory

## UC-29. Crear un InventoryItem

El usuario añade manualmente un elemento al inventario.

Puede referenciar:

```text
Ingredient
```

o:

```text
Product
```

e indicar:

```text
quantity
unit
```

---

## UC-30. Modificar un InventoryItem

El usuario puede modificar explícitamente la cantidad disponible.

El inventario no se modifica automáticamente por:

```text
Planificar una comida
```

ni por:

```text
Marcar una compra como checked
```

---

## UC-31. Eliminar parcialmente un InventoryItem

El usuario selecciona:

```text
Eliminar cantidad
```

La aplicación muestra un diálogo.

Ejemplo:

```text
Leche disponible: 2 l

¿Cuánto quieres eliminar?

[-] 0,5 l [+]
```

La cantidad inicial puede ser:

```text
cantidad total disponible
```

pero el usuario solo puede reducir la cantidad.

La cantidad eliminada no puede superar la cantidad disponible.

```text
No se puede eliminar:
3 l

si solo existen:
2 l
```

---

## UC-32. Consumir un Ingredient desde un MealItem

El usuario puede consumir ingredientes desde la vista de un `MealItem`.

Por ejemplo:

```text
MealItem
└── Recipe: Tarta de queso
```

La interfaz muestra un control para consultar los ingredientes.

```text
Ingredientes
├── Leche
├── Huevos
└── Harina
```

El usuario abre el diálogo de consumo.

```text
Leche
[-] 100 ml [+]
```

La cantidad máxima disponible depende del inventario.

Si:

```text
Inventory:
Leche: 500 ml
```

el usuario puede consumir:

```text
0 - 500 ml
```

El botón `+` se bloquea cuando la cantidad seleccionada alcanza la cantidad disponible.

---

### Al confirmar

```text
Cantidad consumida
        ↓
Se descuenta del InventoryItem
```

El `MealItem` no se modifica.

La receta no se modifica.

El MealPlan no se modifica.

La acción representa únicamente:

```text
El usuario ha consumido una cantidad de un elemento disponible.
```

---

# 10. Gestión de compras

## UC-33. Marcar un ShoppingItem como comprado

El usuario cambia:

```text
checked: false
```

a:

```text
checked: true
```

Esto significa únicamente:

```text
El usuario ha marcado el elemento como comprado.
```

No se modifica automáticamente el inventario.

---

## UC-34. Desmarcar un ShoppingItem

El usuario puede cambiar:

```text
checked: true
```

a:

```text
checked: false
```

No se modifica automáticamente el inventario.

---

## UC-35. Añadir un ShoppingItem comprado al Inventory

El usuario selecciona:

```text
Añadir al inventario
```

Se muestra un diálogo de cantidad.

```text
ShoppingItem:
Leche: 1,5 l

Cantidad comprada:
[ 1 l ]
```

El usuario puede modificar la cantidad.

Al confirmar:

```text
ShoppingItem
    ↓
Cantidad confirmada
    ↓
InventoryItem
```

El sistema:

1. crea o actualiza el `InventoryItem`;
2. descuenta del `ShoppingItem` la cantidad añadida;
3. elimina el `ShoppingItem` si la cantidad restante es cero.

---

# 11. Gestión de ShoppingItem Sources

## UC-36. Consultar las fuentes de un ShoppingItem

El usuario puede abrir el desglose de un `ShoppingItem`.

Ejemplo:

```text
Leche
──────────────

Tarta de queso
150 ml

Tortitas
1 l

Total:
1,15 l
```

Las fuentes identifican los `MealItems` que originaron la necesidad.

---

## UC-37. Recalcular el desglose de fuentes

El endpoint de desglose puede comprobar si la suma actual de las fuentes coincide con la cantidad total del `ShoppingItem`.

```text
ShoppingItem.quantity
```

se compara con:

```text
sum(ShoppingItemSource.quantity)
```

---

### Si coinciden

```text
Total ShoppingItem:
1,5 l

Sources:
500 ml
1 l

Extra:
0
```

No se muestra ninguna cantidad adicional.

---

### Si no coinciden

Puede existir una cantidad comprada previamente que ya no corresponde exactamente a las necesidades actuales.

Ejemplo:

```text
ShoppingItem total:
2 l
```

Fuentes actuales:

```text
Meal A → 1 l
Meal B → 500 ml
```

Suma de fuentes:

```text
1,5 l
```

Diferencia:

```text
500 ml
```

El backend puede devolver:

```text
extra:
500 ml
```

La respuesta podría modelarse conceptualmente como:

```text
{
    item: {
        quantity: 2,
        unit: "l"
    },

    sources: [
        {
            type: "meal-plan",
            mealItemId: "...",
            quantity: 1,
            unit: "l"
        },
        {
            type: "meal-plan",
            mealItemId: "...",
            quantity: 500,
            unit: "ml"
        }
    ],

    extra: {
        quantity: 500,
        unit: "ml"
    }
}
```

La cantidad `extra` representa una cantidad del ShoppingItem que no puede atribuirse a las fuentes actuales.

---

# 12. Modificación de necesidades con ShoppingItems existentes

## UC-38. Aumentar una necesidad existente

Ejemplo:

```text
ShoppingItem:
Leche: 1,5 l
checked: true
```

El usuario modifica un MealItem:

```text
Necesidad anterior:
1,5 l
```

a:

```text
Necesidad nueva:
2 l
```

La nueva necesidad supera la cantidad ya comprada.

El sistema debe representar la cantidad adicional pendiente de comprar.

Conceptualmente:

```text
Cantidad comprada:
1,5 l

Nueva necesidad:
2 l

Cantidad adicional necesaria:
500 ml
```

La nueva cantidad pendiente se representa como una necesidad separada o como una nueva parte pendiente asociada al mismo elemento, sin perder la información de la compra anterior.

---

## UC-39. Reducir una necesidad existente

Si una necesidad disminuye:

```text
Antes:
2 l
```

```text
Después:
1,5 l
```

la cantidad ya comprada no se elimina automáticamente.

La diferencia puede aparecer como:

```text
extra
```

en el desglose de fuentes.

La aplicación no debe borrar automáticamente información que representa una acción de compra ya realizada.

---

# 13. Eliminación de entidades utilizadas

## UC-40. Intentar eliminar una entidad con dependencias

Cuando el usuario intenta eliminar una entidad que está siendo utilizada:

```text
Delete
```

el sistema comprueba sus relaciones.

Si existen dependencias, muestra:

```text
No se puede eliminar esta entidad porque está siendo utilizada en:
```

Ejemplo:

```text
Ingredient: Huevo

Utilizado en:
- Tortilla
- Carbonara
- Tarta
- Inventory
```

El usuario debe resolver las dependencias antes de eliminar la entidad.

---

# 14. Reglas generales de consistencia

## UC-41. Recalcular datos derivados

Los siguientes datos son derivados:

```text
Nutrition de Recipe
Nutrition de Meal
Nutrition diaria
Necesidades de compra
```

No deben tratarse como datos independientes que puedan quedar desactualizados.

Se calculan a partir de las entidades fuente.

```text
Ingredient
    ↓
Recipe
    ↓
Meal
    ↓
MealPlan
    ↓
Needs
```

---

## UC-42. Mantener separados los estados del sistema

La aplicación mantiene separados:

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

Una acción en un estado no modifica automáticamente otro estado salvo que exista una acción explícita del usuario.

---

# 15. Resumen de los principales flujos

## Planificación

```text
Ingredient
    ↓
Recipe
    ↓
Meal
    ↓
MealPlan
```

---

## Necesidades de compra

```text
MealPlan
    ↓
Needs
    ↓
Inventory
    ↓
ShoppingItems
```

---

## Compra

```text
ShoppingItem
    ↓
Usuario marca como comprado
    ↓
checked = true
    ↓
Usuario confirma añadir al inventario
    ↓
InventoryItem
```

---

## Consumo

```text
MealItem
    ↓
Usuario abre ingredientes
    ↓
Selecciona cantidad consumida
    ↓
InventoryItem
    ↓
Se descuenta cantidad
```

El `MealItem` permanece sin cambios.

---

## Nutrición

```text
Ingredient Nutrition
        ↓
Recipe Nutrition
        ↓
Meal Nutrition
        ↓
Daily Nutrition
```

Si falta alguno de los datos nutricionales principales:

```text
Nutrition incompleta
```

El sistema debe indicarlo en lugar de presentar el resultado como completamente exacto.

---

# Principio central

Cada caso de uso debe modificar únicamente las entidades que son responsabilidad directa de la acción.

```text
Planificar
    → modifica MealPlan
```

```text
Comprar
    → modifica ShoppingItem
```

```text
Añadir al inventario
    → modifica Inventory
    → actualiza ShoppingItem
```

```text
Consumir
    → modifica Inventory
```

```text
Modificar un Ingredient
    → modifica Ingredient
    → afecta a cálculos derivados
```

Los datos derivados se recalculan.

Los estados reales del usuario solo cambian mediante acciones explícitas.

La aplicación nunca debe asumir automáticamente que:

```text
planificar = consumir
```

```text
marcar como comprado = añadir al inventario
```

o:

```text
cambiar una necesidad = borrar una compra realizada
```

El sistema debe preservar la diferencia entre:

```text
lo que se planea consumir;
```

```text
lo que se necesita comprar;
```

```text
lo que se ha comprado;
```

y:

```text
lo que está actualmente disponible.
```
