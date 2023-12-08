import { recipes, ingredients, ustensils, appliances } from "../recipes.js";

const inputEvent = new CustomEvent("input");

function escapeRegex(string) {
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");
}

function replaceDiacritic(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function filterList(ul, text) {
  const re = new RegExp(escapeRegex(text), "gi");
  let counter = 0;
  for (const li of ul.childNodes) {
    const ref = li.dataset.search;
    if (re.exec(ref)) {
      li.removeAttribute("data-hidden");
      counter++;
    } else {
      li.setAttribute("data-hidden", "");
    }
  }
  const last = ul.lastChild; // childNodes[ul.childNodes.length - 1];
  if (counter == 0) {
    last.classList.remove("hidden");
  } else {
    last.classList.add("hidden");
  }
}

function clearInput(element, dispatch = true) {
  if (element.value !== "") {
    element.value = "";
    if (dispatch) {
      element.dispatchEvent(inputEvent);
    }
  }
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
  const result = document.createElement("div");
  result.id = `${name}-filter`;
  result.className = "dropdown";
  result.tabIndex = 0;

  result.addEventListener("focusout", (e) => {
    console.log("blur", e.relatedTarget);
  });

  const button = document.createElement("button");
  button.type = "button";
  button.className = "dropdown-button";
  button.textContent = title;

  const content = document.createElement("div");
  content.className = "dropdown-content";

  const search = document.createElement("div");
  search.className = "dropdown-search";

  const reset = document.createElement("button");
  reset.type = "button";
  reset.className = "btn-clear";

  const input = document.createElement("input");
  input.type = "text";
  input.id = `${name}-search`;
  input.name = input.id;
  input.className = "input-search";
  input.placeholder = "Rechercher...";
  input.tabIndex = -1;
  input.autofocus = "true";
  // event sur le changement de l'input par l'utilisateur
  input.addEventListener("input", (e) => {
    filterList(ul, replaceDiacritic(e.currentTarget.value.trim()));
  });

  search.appendChild(input);
  search.appendChild(reset);

  content.appendChild(search);

  const ul = document.createElement("ul");
  ul.className = "dropdown-items";

  const selectListener = (e) => {
    e.preventDefault();
    const target = e.currentTarget.closest("li");
    target.setAttribute("data-selected", "");
  };

  const unselectListener = (e) => {
    e.preventDefault();
    const target = e.currentTarget.closest("li");
    target.removeAttribute("data-selected");
  };

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    const li = document.createElement("li");
    li.className = "dropdown-item";

    li.dataset.search = replaceDiacritic(item.trim()).toLowerCase();
    li.dataset.key = i;

    const btnSelect = document.createElement("button");
    btnSelect.className = "btn-select";
    btnSelect.type = "button";
    btnSelect.ariaLabel = `Sélectionner ${item}`;
    btnSelect.textContent = item;
    btnSelect.addEventListener("click", selectListener);
    li.appendChild(btnSelect);

    const btnUnselect = document.createElement("button");
    btnUnselect.className = "btn-unselect";
    btnUnselect.type = "button";
    btnUnselect.ariaLabel = "Déselectionner";
    btnUnselect.ariaHidden = "true";
    li.appendChild(btnUnselect);

    //li.addEventListener("click", selectListener);
    btnUnselect.addEventListener("click", unselectListener);

    ul.appendChild(li);
  }

  const liEmpty = document.createElement("li");
  liEmpty.className = "dropdown-empty hidden";
  liEmpty.textContent = "Aucun résultat";
  ul.appendChild(liEmpty);

  content.appendChild(ul);
  result.appendChild(button);
  result.appendChild(content);
  button.addEventListener("click", (e) => {
    clearInput(input);
    if (result.hasAttribute("data-open")) {
      result.removeAttribute("data-open", "");
    } else {
      result.setAttribute("data-open", "");
      setTimeout(() => {
        input.focus();
      }, 0);
    }
  });
  reset.addEventListener("click", (e) => {
    e.preventDefault();
    clearInput(input);
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

    // Fermeture des "dropdowns" quand on clique à l'extérieur
    document.addEventListener("click", (e) => {
      const opened = document.querySelectorAll(".dropdown[data-open]");
      const excepted = e.target.closest(".dropdown");

      opened.forEach((dropdown) => {
        if (dropdown !== excepted) dropdown.removeAttribute("data-open");
      });

      console.log("CLICK");
    });

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
