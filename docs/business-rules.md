# Reglas de negocio

Este documento define las reglas que determinan cómo funcionan las entidades y cómo interactúan entre sí.

Las reglas de negocio son independientes de la interfaz.

---
# Índice

- [1. Reglas generales](#1-reglas-generales)
- [2. Reglas de Ingredient](#2-reglas-de-ingredient)
- [3. Reglas de unidades](#3-reglas-de-unidades)
- [4. Reglas de nutrición](#4-reglas-de-nutrición)
- [5. Reglas de Recipe](#5-reglas-de-recipe)
- [6. Reglas de Meal](#6-reglas-de-meal)
- [7. Reglas de MealPlan](#7-reglas-de-mealplan)
- [8. Reglas de Inventory](#8-reglas-de-inventory)
- [9. Reglas de necesidades de compra](#9-reglas-de-necesidades-de-compra)
- [10. Reglas de ShoppingItem](#10-reglas-de-shoppingitem)
- [11. Reglas de ShoppingItemSource](#11-reglas-de-shoppingitemsource)
- [12. Reglas de cambios en Ingredient](#12-reglas-de-cambios-en-ingredient)
- [13. Reglas de cambios en Recipe](#13-reglas-de-cambios-en-recipe)
- [14. Reglas de eliminación](#14-reglas-de-eliminación)
- [15. Principio central del sistema](#15-principio-central-del-sistema)
- [16. Principio de acciones explícitas](#16-principio-de-acciones-explícitas)
- [17. Principio de nutrición incompleta](#17-principio-de-nutrición-incompleta)
---

# 1. Reglas generales

## 1.1. Cada entidad representa un concepto diferente

```text
Ingredient
= alimento genérico

Product
= producto comercial

Recipe
= preparación

Meal
= conjunto de elementos consumidos juntos

MealPlan
= planificación

InventoryItem
= cantidad disponible

ShoppingItem
= necesidad de compra
```

---

## 1.2. Las relaciones con información propia se modelan independientemente

La cantidad de un ingrediente dentro de una receta pertenece a:

```text
RecipeIngredient
```

La cantidad de un elemento dentro de un Meal pertenece a:

```text
MealItem
```

No pertenece a la entidad genérica referenciada.

---

# 2. Reglas de Ingredient

## 2.1. Un Ingredient es genérico

```text
Pasta
Huevo
Leche
Manzana
```

No representa marcas concretas.

---

## 2.2. Un Ingredient puede existir sin Product

Un ingrediente puede utilizarse aunque no tenga productos comerciales relacionados.

---

## 2.3. Un Ingredient puede tener múltiples Products

```text
Pasta
├── Gallo
├── Hacendado
└── Barilla
```

---

## 2.4. Un Product puede existir sin Ingredient

Esto permite representar productos no alimentarios:

```text
Papel de cocina
```

---

## 2.5. La nutrición es opcional

Un ingrediente puede utilizarse aunque no tenga nutrición.

---

## 2.6. La nutrición de Ingredient es genérica

Representa un valor de referencia del alimento.

No tiene que coincidir exactamente con todos sus productos comerciales.

---

## 2.7. La nutrición de Product es específica

La nutrición de un producto comercial puede ser diferente de la del ingrediente genérico relacionado.

---

## 2.8. Un Product puede servir como referencia

El usuario puede utilizar la nutrición de un producto para completar la nutrición de un ingrediente.

Esto requiere una decisión explícita.

No se copia automáticamente.

---

# 3. Reglas de unidades

## 3.1. Las unidades disponibles son generales

La aplicación ofrece un conjunto de unidades:

```text
g
kg
ml
l
unit
package
slice
clove
can
bottle
glass
tablespoon
teaspoon
```

El usuario selecciona las que considere apropiadas.

---

## 3.2. `defaultUnit` representa la unidad preferida

La unidad predeterminada sirve como unidad de referencia para:

* mostrar cantidades agrupadas;
* convertir necesidades equivalentes;
* presentar cantidades en la lista de compra.

No obliga a utilizar esa unidad en todas partes.

---

## 3.3. Las unidades medibles pueden convertirse

Ejemplo:

```text
1000 ml = 1 l
```

Por tanto:

```text
500 ml + 1 l = 1.5 l
```

---

## 3.4. Las unidades contables requieren equivalencia cuando se usan en cálculos

Ejemplo:

```text
1 huevo = 50 g
```

Si el usuario quiere utilizar:

```text
2 huevos
```

para calcular nutrición, necesidades o conversiones, debe existir una equivalencia.

---

## 3.5. Las equivalencias no son obligatorias

No todos los ingredientes necesitan una equivalencia.

Por ejemplo:

```text
Pasta
```

puede utilizarse directamente en:

```text
g
kg
```

sin equivalencia de unidades contables.

---

## 3.6. No se permite utilizar una unidad que no pueda convertirse cuando el cálculo lo necesita

Si una receta necesita:

```text
2 units
```

pero el ingrediente no tiene una equivalencia:

```text
1 unit = X g
```

la aplicación debe impedir esa combinación o solicitar al usuario que configure la equivalencia.

---

# 4. Reglas de nutrición

## 4.1. La nutrición puede estar incompleta

Una nutrición es básica y completa cuando contiene:

```text
calories
protein
carbohydrates
fat
```

La fibra es opcional.

---

## 4.2. La nutrición se calcula utilizando valores aproximados

Los cálculos nutricionales representan estimaciones.

No deben presentarse como mediciones exactas.

---

## 4.3. La nutrición de una Recipe se calcula desde sus Ingredients

```text
Recipe
    ↓
RecipeIngredient
    ↓
Ingredient
    ↓
Nutrition
```

La cantidad se convierte a la unidad de referencia de la nutrición.

Ejemplo:

```text
Nutrition:
350 kcal / 100 g

Recipe:
200 g

Resultado:
700 kcal
```

Si se utilizan unidades contables:

```text
2 huevos
```

y:

```text
1 huevo = 50 g
```

entonces:

```text
2 huevos = 100 g
```

---

## 4.4. La nutrición de una Recipe es incompleta si falta información necesaria

Si un ingrediente no tiene los campos básicos necesarios:

```text
Recipe
├── Pasta ✓
├── Huevo ✓
└── Bacon ✗
```

la nutrición total de la receta se considera incompleta.

La receta sigue siendo válida para:

* planificar;
* calcular compras;
* gestionar inventario.

Pero el sistema debe indicar la información que falta.

---

## 4.5. La nutrición de un Meal se calcula desde sus MealItems

Se suman las contribuciones nutricionales de:

```text
Recipe
Ingredient
Product
```

---

## 4.6. La nutrición de un Meal puede ser incompleta

Si uno de sus elementos no tiene nutrición suficiente, el total debe marcarse como incompleto.

---

## 4.7. La nutrición diaria se calcula desde los Meals

```text
Día
    ↓
Meals
    ↓
Nutrition
    ↓
Total diario
```

Si un Meal tiene nutrición incompleta, el total diario también debe indicarlo.

---

## 4.8. La nutrición propagada no se persiste necesariamente

Si cambia la nutrición de un ingrediente:

```text
Ingredient
    ↓
Recipe
    ↓
Meal
    ↓
Día
```

los cálculos posteriores deben utilizar los nuevos valores.

---

# 5. Reglas de Recipe

## 5.1. Una Recipe está compuesta por Ingredients

Una receta no utiliza productos comerciales concretos.

---

## 5.2. Un Ingredient puede utilizarse en múltiples Recipes

Cada uso puede tener una cantidad diferente.

---

## 5.3. La cantidad pertenece a RecipeIngredient

```text
RecipeIngredient
└── quantity
```

No al ingrediente.

---

## 5.4. Una Recipe tiene un número base de servings

Las cantidades de los ingredientes corresponden a ese número de raciones.

Si se modifican las raciones:

```text
2 servings → 4 servings
```

las cantidades se escalan proporcionalmente.

La receta base no se modifica.

---

# 6. Reglas de Meal

## 6.1. Un Meal puede contener varios tipos de elementos

```text
Recipe
Ingredient
Product
```

---

## 6.2. Un Meal no tiene que ser una Recipe

Puede estar formado por:

```text
Una manzana
```

o:

```text
Un yogur
```

o:

```text
Una receta + una fruta
```

---

## 6.3. Cada MealItem representa exactamente un tipo

Un MealItem es:

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

---

## 6.4. El tipo determina la cantidad válida

Una Recipe utiliza:

```text
servings
```

Un Ingredient o Product utiliza:

```text
quantity
unit
```

---

## 6.5. Un Meal no tiene estado de consumo

El Meal representa una planificación.

No se modifica automáticamente cuando el usuario consume elementos del inventario.

---

# 7. Reglas de MealPlan

## 7.1. Un MealPlan contiene Meals

Cada Meal se asocia a:

```text
fecha
momento del día
```

---

## 7.2. El MealPlan representa lo planificado

```text
¿Qué quiero consumir?
```

No representa lo que ya se ha consumido.

---

## 7.3. Las necesidades de compra se calculan desde el MealPlan

```text
MealPlan
    ↓
Meal
    ↓
MealItem
    ↓
Necesidades
```

---

## 7.4. La nutrición diaria se calcula desde el MealPlan

Modificar un Meal o sus cantidades debe actualizar los cálculos posteriores.

---

# 8. Reglas de Inventory

## 8.1. El inventario representa lo disponible actualmente

```text
InventoryItem
└── Pasta: 500 g
```

---

## 8.2. Planificar no consume inventario

Si:

```text
Inventory: 500 g
```

y se planifican:

```text
200 g
```

el inventario sigue siendo:

```text
500 g
```

---

## 8.3. El inventario solo cambia mediante acciones explícitas

Puede cambiar cuando el usuario:

* añade una compra;
* modifica cantidades;
* consume una cantidad;
* elimina una cantidad.

No cambia automáticamente al:

* planificar;
* marcar un ShoppingItem como comprado.

---

## 8.4. Las cantidades equivalentes se consolidan

Si existe:

```text
Pasta: 200 g
```

y se añaden:

```text
500 g
```

el resultado es:

```text
Pasta: 700 g
```

si las unidades son compatibles.

---

## 8.5. El usuario puede consumir cantidades desde un MealItem

Desde un `MealItem` el usuario puede abrir un diálogo con los elementos consumibles.

Ejemplo:

```text
Pasta carbonara
```

El diálogo puede mostrar:

```text
Pasta
[-] 200 g [+]

Huevo
[-] 2 uds [+]

Bacon
[-] 100 g [+]
```

El usuario selecciona cuánto quiere descontar del inventario.

---

## 8.6. La cantidad consumida no puede superar el inventario disponible

Si hay:

```text
Pasta: 500 g
```

el usuario puede consumir como máximo:

```text
500 g
```

El botón de aumentar debe bloquearse al alcanzar la cantidad disponible.

---

## 8.7. Consumir no modifica el MealItem

El `MealItem` sigue representando lo planificado.

La acción únicamente modifica:

```text
InventoryItem
```

---

## 8.8. Consumir un elemento no modifica automáticamente otros elementos

Cada acción de consumo es independiente.

---

## 8.9. El inventario puede modificarse directamente

El usuario puede eliminar o consumir cantidades desde la propia vista del inventario.

Al eliminar:

```text
InventoryItem: 5 unidades
```

el diálogo muestra inicialmente:

```text
5 unidades
```

pero solo permite reducir la cantidad.

No permite eliminar más de lo disponible.

---

# 9. Reglas de necesidades de compra

Las necesidades se calculan mediante:

```text
Necesidades planificadas
-
Inventario disponible
```

---

## 9.1. Si el inventario cubre la necesidad

```text
Necesidad: 500 g
Inventario: 700 g
```

Resultado:

```text
0 g por comprar
```

---

## 9.2. Si el inventario cubre parcialmente la necesidad

```text
Necesidad: 500 g
Inventario: 200 g
```

Resultado:

```text
300 g
```

---

## 9.3. Si no hay inventario

```text
Necesidad: 500 g
Inventario: 0 g
```

Resultado:

```text
500 g
```

---

## 9.4. Las necesidades equivalentes se agrupan

```text
Meal A → Leche: 500 ml
Meal B → Leche: 1 l
```

Se convierten a la unidad predeterminada:

```text
Leche: 1.5 l
```

No se mantienen necesariamente como dos líneas independientes.

---

# 10. Reglas de ShoppingItem

## 10.1. Un ShoppingItem puede ser automático o manual

### Automático

Procede de las necesidades del MealPlan.

### Manual

Lo crea directamente el usuario.

---

## 10.2. Un elemento manual no necesita ser Product

Puede existir:

```text
ShoppingItem
└── Papel de cocina
```

---

## 10.3. Un ShoppingItem puede tener múltiples fuentes

Ejemplo:

```text
ShoppingItem
└── Leche: 1.5 l
    ├── MealItem A: 500 ml
    └── MealItem B: 1 l
```

---

## 10.4. `ShoppingItem.quantity` representa la cantidad pendiente actual

Las fuentes representan el origen de la necesidad.

La cantidad del ShoppingItem puede dejar de coincidir con la suma exacta de las fuentes.

Esto puede ocurrir cuando:

* se modifica el MealPlan;
* se compra una cantidad parcial;
* se añade una cantidad al inventario;
* se actualiza una necesidad.

---

## 10.5. La cantidad del ShoppingItem puede actualizarse por compras parciales

Ejemplo:

```text
ShoppingItem
└── Leche: 1.5 l
```

El usuario compra:

```text
1 l
```

Al añadirlo al inventario:

```text
Inventory
└── Leche: 1 l
```

el ShoppingItem se actualiza:

```text
Leche: 500 ml
```

La fuente original puede conservarse como referencia del origen de la necesidad.

---

## 10.6. Si se compra más de lo que necesita el ShoppingItem

Ejemplo:

```text
ShoppingItem: 1.5 l
```

El usuario compra:

```text
2 l
```

Se añade al inventario:

```text
Inventory: 2 l
```

y el ShoppingItem se elimina porque la necesidad pendiente queda cubierta.

La cantidad adicional comprada pertenece al inventario.

---

## 10.7. `checked` representa únicamente la acción de marcar como comprado

```text
checked = true
```

significa:

```text
El usuario ha marcado la necesidad como comprada.
```

No crea ni modifica automáticamente el inventario.

---

## 10.8. Marcar como comprado y añadir al inventario son acciones diferentes

Flujo:

```text
ShoppingItem
    ↓
checked = true
```

Después:

```text
Añadir al inventario
    ↓
Dialog de cantidad
    ↓
El usuario introduce la cantidad realmente comprada
    ↓
Se actualiza Inventory
    ↓
Se actualiza la necesidad pendiente
```

---

## 10.9. Añadir una compra parcial al inventario

Ejemplo:

```text
ShoppingItem
└── Leche: 1.5 l
```

El usuario realmente compra:

```text
1 l
```

Resultado:

```text
Inventory
└── Leche: 1 l
```

```text
ShoppingItem
└── Leche: 500 ml
```

La necesidad restante permanece.

---

## 10.10. Si la cantidad comprada cubre toda la necesidad

El ShoppingItem se elimina o deja de representar una necesidad pendiente.

La acción debe crear o actualizar el InventoryItem.

---

## 10.11. Un ShoppingItem puede eliminarse manualmente

Eliminarlo:

```text
no modifica el inventario
```

---

# 11. Reglas de ShoppingItemSource

## 11.1. Una fuente de MealPlan referencia un MealItem

```ts
{
    type: "meal-plan";

    mealItemId: string;

    quantity: number;

    unit: Unit;
}
```

La fuente representa la contribución de ese MealItem a la necesidad.

---

## 11.2. Si cambia la cantidad de un MealItem

La fuente correspondiente se actualiza:

```text
Source.quantity
```

Pero el `ShoppingItem.quantity` no necesariamente se modifica automáticamente en todos los casos.

El sistema debe preservar la información sobre la cantidad pendiente y las compras ya realizadas.

---

## 11.3. Si una necesidad aumenta y existe una cantidad ya comprada

Ejemplo:

```text
Necesidad original: 1.5 l
Comprado: 2 l
```

Después:

```text
El MealPlan necesita: 2 l
```

La cantidad comprada cubre la necesidad actual.

Si posteriormente la necesidad supera la cantidad ya cubierta, se genera una nueva necesidad pendiente.

Las necesidades nuevas pueden incorporarse al ShoppingItem correspondiente sin perder la información de las compras anteriores.

---

## 11.4. Las fuentes pueden quedar desactualizadas respecto al total actual

Por ejemplo:

```text
Sources:
├── 500 ml
└── 1 l

Total sources:
1.5 l
```

Pero el ShoppingItem puede representar:

```text
2 l
```

por una cantidad comprada o ajustada posteriormente.

El sistema no debe asumir que:

```text
ShoppingItem.quantity
=
sum(ShoppingItemSource.quantity)
```

si existen cambios posteriores.

---

## 11.5. El desglose de fuentes se obtiene mediante una operación específica

Cuando el usuario abre el desglose:

```text
GET /shopping-items/:id/sources
```

el backend puede:

1. obtener las fuentes;
2. calcular la suma de sus cantidades;
3. compararla con la cantidad actual del ShoppingItem;
4. devolver una diferencia si existe.

Ejemplo:

```text
ShoppingItem
└── Leche: 2 l
```

Fuentes:

```text
Tarta de queso → 500 ml
Tortitas → 1 l
```

Suma:

```text
1.5 l
```

Diferencia:

```text
Extra: 500 ml
```

Respuesta conceptual:

```text
{
    sources: [
        {
            mealItemId: "...",
            quantity: 500,
            unit: "ml"
        },
        {
            mealItemId: "...",
            quantity: 1,
            unit: "l"
        }
    ],

    total: {
        quantity: 2,
        unit: "l"
    },

    extra: {
        quantity: 500,
        unit: "ml"
    }
}
```

El campo `extra` representa una cantidad que forma parte del total actual pero que no puede atribuirse a las fuentes actuales.

---

# 12. Reglas de cambios en Ingredient

## 12.1. Si cambia la nutrición

Los cálculos posteriores deben utilizar los nuevos valores.

No es necesario actualizar manualmente todas las Recipes y Meals.

---

## 12.2. Si cambia una equivalencia

Los cálculos posteriores utilizan la nueva equivalencia.

Esto puede cambiar:

* nutrición;
* necesidades;
* conversiones;
* cantidades agrupadas.

---

## 12.3. Si cambia el defaultUnit

Los datos que se muestran o calculan en la unidad predeterminada pueden recalcularse utilizando la nueva unidad.

---

## 12.4. No se puede eliminar un Ingredient utilizado

Si un ingrediente está siendo utilizado por una Recipe, no debe eliminarse directamente.

La aplicación debe mostrar dónde se utiliza.

Ejemplo:

```text
No puedes eliminar este ingrediente.

Se utiliza en:
- Pasta carbonara
- Tortilla de patata
- Tarta
```

---

## 12.5. Un Ingredient eliminado dejaría de estar disponible

Si se permitiera eliminarlo tras eliminar sus dependencias, las recetas que ya no pudieran calcular su nutrición deberían marcarse como incompletas.

---

# 13. Reglas de cambios en Recipe

## 13.1. Si cambia una Recipe

Deben actualizarse los cálculos derivados posteriores:

```text
Recipe
    ↓
Meal
    ↓
Día
```

La nutrición se recalcula con los nuevos datos.

---

## 13.2. Las necesidades de compra se recalculan

Si cambia:

```text
cantidad
ingrediente
raciones
```

se recalculan las necesidades correspondientes.

---

## 13.3. Las compras ya marcadas como realizadas no deben desaparecer automáticamente

Si una necesidad cambia después de haber sido marcada como comprada, la aplicación debe conservar la información sobre la compra realizada y calcular únicamente la necesidad pendiente adicional cuando corresponda.

---

# 14. Reglas de eliminación

## 14.1. Las entidades utilizadas no se eliminan directamente

Antes de eliminar una entidad con dependencias:

1. se comprueba dónde se utiliza;
2. se informa al usuario;
3. se impide la eliminación hasta resolver las dependencias.

---

## 14.2. La aplicación debe mostrar las dependencias

Ejemplo:

```text
No puedes eliminar este ingrediente.

Está siendo utilizado en:
- Receta A
- Receta B
```

El usuario no debería tener que buscar manualmente todas las referencias.

---

# 15. Principio central del sistema

La aplicación mantiene separados tres estados:

```text
PLANIFICADO
```

Lo que el usuario ha decidido consumir.

```text
DISPONIBLE
```

Lo que el usuario tiene.

```text
PENDIENTE DE COMPRAR
```

Lo que necesita comprar.

Por tanto:

```text
MealPlan
≠
Inventory
≠
ShoppingList
```

La relación entre ellos sirve para calcular necesidades, pero no implica transiciones automáticas.

---

# 16. Principio de acciones explícitas

El sistema no debe asumir:

```text
Planificar
=
Consumir
```

ni:

```text
Marcar como comprado
=
Añadir al inventario
```

ni:

```text
Cambiar una necesidad
=
Borrar automáticamente una compra anterior
```

Las transiciones importantes requieren confirmación explícita del usuario.

---

# 17. Principio de nutrición incompleta

La aplicación debe distinguir entre:

```text
Hay algunos datos nutricionales
```

y:

```text
Hay suficientes datos para realizar un cálculo nutricional completo
```

Si falta cualquiera de los campos básicos:

```text
calories
protein
carbohydrates
fat
```

el resultado debe marcarse como:

```text
Información nutricional incompleta
```

La aplicación debe permitir identificar qué ingrediente o producto es responsable de la información faltante.
