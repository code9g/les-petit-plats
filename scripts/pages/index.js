import { recipes, ingredients, ustensils, appliances } from "../recipes.js";

const inputEvent = new CustomEvent("input");

function escapeRegex(string) {
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");
}

function replaceDiacritic(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function createLiveSearch(
  name,
  title,
  items,
  onSelect,
  onUnselect,
  onOpen,
  onClose
) {
  const result = document.createElement("dropdown");
  result.id = `${name}-filter`;
  result.className = "dropdown";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "dropdown-button";
  button.textContent = title;

  const content = document.createElement("div");
  content.className = "dropdown-content hidden";

  const search = document.createElement("div");
  search.className = "dropdown-search";

  const reset = document.createElement("button");
  reset.type = "button";
  reset.className = "reset hidden";

  const input = document.createElement("input");
  input.type = "text";
  input.id = `${name}-search`;
  input.name = input.id;
  input.className = "search";
  input.addEventListener("input", (e) => {
    e.preventDefault();
    const text = replaceDiacritic(e.currentTarget.value.trim());
    if (text === "") {
      reset.classList.add("hidden");
      for (const li of ul.childNodes) {
        li.removeAttribute("data-hidden");
      }
    } else {
      reset.classList.remove("hidden");
      const re = new RegExp(escapeRegex(text), "gi");
      for (const li of ul.childNodes) {
        const ref = li.dataset.search;
        if (re.exec(ref)) {
          li.removeAttribute("data-hidden");
        } else {
          li.setAttribute("data-hidden", "");
        }
      }
    }
  });

  search.appendChild(input);
  search.appendChild(reset);

  content.appendChild(search);

  const ul = document.createElement("ul");
  ul.className = "dropdown-list";

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    const li = document.createElement("li");
    li.className = "dropdown-item";

    li.dataset.search = replaceDiacritic(item.trim()).toLowerCase();
    li.dataset.key = i;

    const text = document.createElement("span");
    text.textContent = item;

    li.appendChild(text);

    const btnUnselect = document.createElement("button");
    btnUnselect.className = "close";
    btnUnselect.type = "button";
    btnUnselect.ariaLabel = "Déselectionner";
    btnUnselect.ariaHidden = "true";
    li.appendChild(btnUnselect);

    li.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      li.setAttribute("data-selected", "");
    });
    btnUnselect.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      li.removeAttribute("data-selected");
    });

    ul.appendChild(li);
  }

  content.appendChild(ul);
  result.appendChild(button);
  result.appendChild(content);
  button.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.hasAttribute("data-open")) {
      e.currentTarget.removeAttribute("data-open", "");
    } else {
      e.currentTarget.setAttribute("data-open", "");
    }
    content.classList.toggle("hidden");
  });
  reset.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    input.value = "";
    input.dispatchEvent(inputEvent);
    input.focus();
  });
  return result;
}

class App {
  constructor() {}

  async run() {
    const filter1 = createLiveSearch("ingredients", "Ingrédients", ingredients);
    const filter2 = createLiveSearch("appliances", "Appareils", appliances);
    const filter3 = createLiveSearch("ustensils", "Ustensiles", ustensils);

    const filters = document.querySelector(".filters .container");

    filters.append(filter1);
    filters.append(filter2);
    filters.append(filter3);

    const wrapper = document.querySelector(".recipes .cards");
    wrapper.innerHTML = "";
    for (const recipe of recipes) {
      const card = document.createElement("article");
      card.className = "card";
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

      wrapper.appendChild(card);
    }
  }
}

const app = new App();

app.run();
