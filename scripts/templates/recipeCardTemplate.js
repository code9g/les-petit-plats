export function recipeCardTemplate(recipe) {
  const card = document.createElement("article");
  card.className = "card recipe";
  card.dataset.id = recipe.id;

  const img = document.createElement("img");
  img.src = `assets/photos/${recipe.image}`;
  img.className = "card-img-top";
  img.alt = "Photo de la recette";

  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = `${recipe.time} mn`;

  const body = document.createElement("div");
  body.className = "card-body";

  const h2 = document.createElement("h2");
  h2.className = "title";
  h2.textContent = recipe.name;

  const h3a = document.createElement("h3");
  h3a.textContent = "Recette";
  const pa = document.createElement("p");
  pa.className = "description";
  pa.textContent = recipe.description;

  const h3b = document.createElement("h3");
  h3b.textContent = "Ingrédients";

  const divb = document.createElement("div");
  divb.className = "ingredients";

  for (const ingredient of recipe.ingredients) {
    const divi = document.createElement("div");
    divi.className = "ingredient";
    const h4 = document.createElement("h4");
    h4.className = "name";
    h4.textContent = ingredient.ingredient;
    const p = document.createElement("p");
    p.className = "quantity";
    if (ingredient.unit) {
      p.textContent = `${ingredient.quantity} ${ingredient.unit}`;
    } else {
      p.textContent = `${ingredient.quantity}`;
    }
    divi.appendChild(h4);
    divi.appendChild(p);
    divb.appendChild(divi);
  }

  body.appendChild(h2);
  body.appendChild(h3a);
  body.appendChild(pa);
  body.appendChild(h3b);
  body.appendChild(divb);

  card.appendChild(img);
  card.appendChild(badge);
  card.appendChild(body);

  return card;
}
