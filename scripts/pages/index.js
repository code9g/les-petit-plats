import { recipes, ingredients, ustensils, appliances } from "../recipes.js";
import { recipeCardTemplate } from "../templates/recipeCard.js";
import { escapeRegex, replaceDiacritic } from "../utils/tools.js";

const inputEvent = new CustomEvent("input");

function filterList(ul, text) {
  const re = new RegExp(escapeRegex(text), "gi");
  let counter = 0;
  for (const li of ul.childNodes) {
    const ref = li.dataset.search;
    if (re.exec(ref)) {
      li.classList.remove("hidden");
      counter++;
    } else {
      li.classList.add("hidden");
    }
  }
  const last = ul.lastChild;
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

function handleClick(e) {
  const opened = document.querySelectorAll(".dropdown.open");
  const target = e.target;
  const excepted =
    target.classList.contains("dropdown") || target.closest(".dropdown");

  opened.forEach((dropdown) => {
    if (dropdown !== excepted) {
      dropdown.close();
    }
  });
}

const mutaterOpen = {
  enumerable: true,
  configurable: true,
  get: function () {
    return this.classList.contains("open");
  },
  set: function (value) {
    if (value === true) {
      this.show();
    } else {
      this.close();
    }
  },
};

function createLiveSearch(
  name,
  title,
  items,
  onSelect = null,
  onUnselect = null,
  onOpen = null,
  onClose = null
) {
  const result = document.createElement("div");
  result.id = `${name}-filter`;
  result.className = "dropdown";
  result.tabIndex = 0;

  Object.defineProperty(result, "open", mutaterOpen);

  result.show = function () {
    if (!this.open) {
      if (onOpen) {
        onOpen(result);
      }
      result.classList.add("open");
      setTimeout(() => {
        input.focus();
      }, 0);
    }
  };

  result.close = function () {
    if (this.open) {
      result.classList.remove("open");
      if (onClose) {
        setTimeout(() => {
          onClose(result);
        });
      }
    }
  };

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
  input.autofocus = true;
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
    target.classList.add("selected");
    if (onSelect) {
      onSelect(target);
    }
  };

  const unselectListener = (e) => {
    e.preventDefault();
    const target = e.currentTarget.closest("li");
    target.classList.remove("selected");
    if (onUnselect) {
      onSelect(target);
    }
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
    btnUnselect.ariaHidden = true;
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
    if (result.open) {
      result.close();
    } else {
      result.show();
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
  constructor() {
    this.currentDropdown = null;
  }

  handleOpen(dropdown) {
    this.currentDropdown = dropdown;
    clearInput(dropdown.querySelector(".input-search"));
    console.log("Open: ", dropdown.id);
  }

  handleClose(dropdown) {
    if (this.currentDropdown === dropdown) {
      this.currentDropdown = null;
    }
    console.log("Close: ", dropdown.id);
  }

  async run() {
    const filter1 = createLiveSearch(
      "ingredients",
      "Ingrédients",
      ingredients,
      null,
      null,
      this.handleOpen.bind(this),
      this.handleClose.bind(this)
    );
    const filter2 = createLiveSearch(
      "appliances",
      "Appareils",
      appliances,
      null,
      null,
      this.handleOpen.bind(this),
      this.handleClose.bind(this)
    );
    const filter3 = createLiveSearch(
      "ustensils",
      "Ustensiles",
      ustensils,
      null,
      null,
      this.handleOpen.bind(this),
      this.handleClose.bind(this)
    );

    const filters = document.querySelector(".filters");

    filters.append(filter1);
    filters.append(filter2);
    filters.append(filter3);

    // Fermeture des "dropdowns" quand on clique à l'extérieur
    document.addEventListener("click", handleClick);

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
