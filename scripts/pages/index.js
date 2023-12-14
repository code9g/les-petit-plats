import { dropdownFilterTemplate } from "../templates/dropdownFilter.js";
import { recipeCardTemplate } from "../templates/recipeCard.js";
import { tagTemplate } from "../templates/tag.js";
import { escapeRegex, replaceDiacritic } from "../utils/tools.js";

class App {
  constructor() {
    this.recipes = null;
    this.ingredients = [];
    this.appliances = [];
    this.ustensils = [];
  }

  handleSelect(dropdown, item) {
    this.addTag(dropdown.id, item.dataset.key, item.textContent);
    dropdown.close();
  }

  handleUnSelect(dropdown, item) {
    this.removeTag(
      this.tags.querySelector(
        `.tag[data-target="${dropdown.id}"][data-key="${item.dataset.key}"]`
      )
    );
    dropdown.close();
  }

  addTag(target, key, text) {
    const tag = tagTemplate(target, key, text, (e) => {
      e.preventDefault();
      this.removeTag(e.currentTarget.closest(".tag"));
    });
    document
      .querySelector(`#${target} li[data-key="${key}"]:not(.selected)`)
      ?.classList.add("selected");
    this.tags.appendChild(tag);
    this.tags.classList.remove("hidden");
    this.updateSearch();
  }

  removeTag(element) {
    document
      .querySelector(
        `#${element.dataset.target} li[data-key="${element.dataset.key}"].selected`
      )
      ?.classList.remove("selected");
    element.remove();
    if (!this.tags.querySelector(".tag")) {
      this.tags.classList.add("hidden");
    }
    this.updateSearch();
  }

  handleClick(e) {
    const target = e.target;
    const excepted =
      target.classList.contains("dropdown") || target.closest(".dropdown");

    document.querySelectorAll(".dropdown.open").forEach((dropdown) => {
      if (dropdown !== excepted) {
        dropdown.close();
      }
    });
  }

  async load(url) {
    this.recipes = await fetch(url).then((res) => res.json());
  }

  prepare() {
    const setIngredients = new Set();
    const setUstensils = new Set();
    const setAppliances = new Set();

    for (const recipe of this.recipes) {
      for (const item of recipe.ingredients) {
        setIngredients.add(item.ingredient.toCapitalize());
      }
      setAppliances.add(recipe.appliance.toCapitalize());
      for (const item of recipe.ustensils) {
        setUstensils.add(item.toCapitalize());
      }
    }

    const fnSort = (item1, item2) => item1.localeCompare(item2);

    this.ingredients.push(...setIngredients);
    this.ingredients.sort(fnSort);

    this.ustensils.push(...setUstensils);
    this.ustensils.sort(fnSort);

    this.appliances.push(...setAppliances);
    this.appliances.sort(fnSort);

    this.recipes.sort((item1, item2) => {
      return fnSort(item1.name, item2.name);
    });
  }

  async run() {
    await this.load("./data/recipes.json");
    this.prepare();
    const filter1 = dropdownFilterTemplate(
      "ingredients",
      "Ingrédients",
      this.ingredients,
      this.handleSelect.bind(this),
      this.handleUnSelect.bind(this)
    );
    const filter2 = dropdownFilterTemplate(
      "appliances",
      "Appareils",
      this.appliances,
      this.handleSelect.bind(this),
      this.handleUnSelect.bind(this)
    );
    const filter3 = dropdownFilterTemplate(
      "ustensils",
      "Ustensiles",
      this.ustensils,
      this.handleSelect.bind(this),
      this.handleUnSelect.bind(this)
    );

    const filters = document.querySelector(".filters");

    filters.append(filter1);
    filters.append(filter2);
    filters.append(filter3);

    this.tags = document.querySelector("#tags .container");

    // Fermeture des "dropdowns" quand on clique à l'extérieur
    document.addEventListener("click", this.handleClick.bind(this));

    const wrapper = document.querySelector(".recipes .cards");
    for (const recipe of this.recipes) {
      const card = recipeCardTemplate(recipe);
      recipe.card = card;
      wrapper.appendChild(card);
    }
    document.querySelectorAll(".results").forEach((element) => {
      element.textContent = `${this.recipes.reduce((accumulator, item) => {
        if (item.filtered) return accumulator;
        return accumulator + 1;
      }, 0)} recette(s)`;
    });

    const form = document.querySelector("form[name=search]");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      clearTimeout(h);
      this.updateSearch();
    });

    const inputSearch = document.querySelector("input.input-search");
    const KEY_TIMEOUT = 500;
    let h = null;
    inputSearch.addEventListener("input", (e) => {
      e.preventDefault();
      clearTimeout(h);
      h = setTimeout((e) => {
        if (inputSearch.value.length >= inputSearch.minLength) {
          this.updateSearch();
        }
      }, KEY_TIMEOUT);
    });
    form.querySelector(".btn-clear").addEventListener("click", (e) => {
      e.preventDefault();
      clearTimeout(h);
      inputSearch.value = "";
      inputSearch.focus();
      h = setTimeout(() => {
        this.updateSearch();
      }, KEY_TIMEOUT);
    });
  }

  updateSearch() {
    console.log("Update search started !");
    const search = "";
    // Récuperer le texte de la recherche principale
    // Récuperer les tags choisies
    // Filtrer les recettes en fonction du texte et des tags
    // Regénérer les listes des tags (ingrédients, appareils et ustensils)
    // Mettre à jour la liste des tags disponibles
    // Mettre à jour la liste des recettes
    this.recipes[0].filtered = true;
    this.updateRecipes();
  }

  updateFilters() {
    // ...
  }

  filter(recipes, ingredients, appliances, ustensils) {
    const search = document
      .querySelector("form[name=search] input.input-search")
      .value.trim();
    recipes.forEach((recipe) => {
      if (
        recipe.name.search(search) >= 0 ||
        recipe.description.search(search) >= 0
      ) {
        recipe.filtered = false;
      } else {
        recipe.filtered = true;
      }
    });
  }

  updateRecipes() {
    this.recipes.forEach((recipe) => {
      if (recipe.filtered) {
        recipe.card.classList.add("hidden");
      } else {
        recipe.card.classList.remove("hidden");
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const app = new App();
  app.run();
});
