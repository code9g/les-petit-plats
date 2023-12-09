import { recipes, ingredients, ustensils, appliances } from "../recipes.js";
import { recipeCardTemplate } from "../templates/recipeCard.js";

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

    const filters = document.querySelector(".filters");

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
    for (const recipe of recipes) {
      wrapper.appendChild(recipeCardTemplate(recipe));
    }
  }

  updateSearch() {
    const search = "";
    // Récuperer le texte de la recherche principale
    // Récuperer les tags choisies
    // Filtrer les recettes en fonction du texte et des tags
    // Regénérer les listes des tags (ingrédients, appareils et ustensils)
    // Mettre à jour la liste des tags disponibles
    // Mettre à jour la liste des recettes
  }
}

const app = new App();

app.run();
