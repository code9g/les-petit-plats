import {
  dropdownFilterTemplate,
  updateFilter,
} from "../templates/dropdownFilter.js";
import { headerTemplate } from "../templates/header.js";
import { mainTemplate } from "../templates/main.js";
import { recipeCardTemplate } from "../templates/recipeCard.js";
import { tagTemplate } from "../templates/tag.js";
import { escapeRegex, replaceDiacritic } from "../utils/tools.js";

const KEY_TIMEOUT = 300;

function filterOne(recipe, words, ingredients, appliances, ustensils) {
  return (
    ingredients.every((ingredient) =>
      recipe.ingredients.find((item) => item.ingredient === ingredient)
    ) &&
    (appliances.length === 0 || appliances.includes(recipe.appliance)) &&
    ustensils.every((ustensil) => recipe.ustensils.includes(ustensil)) &&
    (words.length === 0 ||
      words.some((word) => {
        const re = new RegExp(word, "i");
        return (
          re.exec(recipe.name) ||
          re.exec(recipe.description) ||
          recipe.ingredients.find((item) => re.exec(item.ingredient))
        );
      }))
  );
}

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
        const text = item.ingredient.toCapitalize();
        item.ingredient = text;
        item.searchIngredient = replaceDiacritic(item.ingredient).toLowerCase();
        setIngredients.add(text);
      }
      setAppliances.add(recipe.appliance.toCapitalize());
      for (let i = 0; i < recipe.ustensils.length; i++) {
        const text = recipe.ustensils[i].toCapitalize();
        setUstensils.add(text);
        recipe.ustensils[i] = text;
      }
      recipe.searchName = replaceDiacritic(recipe.name).toLowerCase();
      recipe.searchDescription = replaceDiacritic(
        recipe.description
      ).toLowerCase();
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

  render() {
    // ...
  }

  async run() {
    // Chargement des données
    await this.load("./data/recipes.json");

    // Préparation et normalisation des données
    this.prepare();

    const wrapper = document.querySelector(".wrapper");

    wrapper.appendChild(headerTemplate());
    wrapper.appendChild(mainTemplate());

    // Mise en place du DOM
    this.ingredientDropdownList = dropdownFilterTemplate(
      "ingredients",
      "Ingrédients",
      this.ingredients,
      this.handleSelect.bind(this),
      this.handleUnSelect.bind(this)
    );
    this.applianceDropdownList = dropdownFilterTemplate(
      "appliances",
      "Appareils",
      this.appliances,
      this.handleSelect.bind(this),
      this.handleUnSelect.bind(this)
    );
    this.ustensilDropdownList = dropdownFilterTemplate(
      "ustensils",
      "Ustensiles",
      this.ustensils,
      this.handleSelect.bind(this),
      this.handleUnSelect.bind(this)
    );

    const filters = document.querySelector(".filters");

    filters.appendChild(this.ingredientDropdownList);
    filters.appendChild(this.applianceDropdownList);
    filters.appendChild(this.ustensilDropdownList);

    this.tags = document.querySelector("#tags .container");
    this.recipeCounter = document.querySelector(".results");

    // Fermeture des "dropdowns" quand on clique à l'extérieur
    document.addEventListener("click", this.handleClick.bind(this));

    const cards = document.querySelector("#recipes .cards");
    for (const recipe of this.recipes) {
      const card = recipeCardTemplate(recipe);
      recipe.card = card;
      cards.appendChild(card);
    }
    this.updateRecipeCounter(this.recipes.length);

    const form = document.querySelector("form[name=search]");
    this.search = form.querySelector("input.input-search");
    let h = null;

    let inputTrigger = false;
    this.search.addEventListener("input", (e) => {
      e.preventDefault();
      clearTimeout(h);
      h = setTimeout(() => {
        if (this.search.value.length >= this.search.minLength) {
          inputTrigger = true;
          this.updateSearch();
        } else if (inputTrigger) {
          inputTrigger = false;
          this.updateSearch();
        }
      }, KEY_TIMEOUT);
    });

    form.querySelector(".btn-clear").addEventListener("click", (e) => {
      e.preventDefault();
      clearTimeout(h);
      this.search.value = "";
      this.search.focus();
      h = setTimeout(() => {
        this.updateSearch();
      }, KEY_TIMEOUT);
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      clearTimeout(h);
      this.updateSearch();
    });
  }

  queryTagAll(target) {
    return Array.from(this.tags.querySelectorAll(target)).map(
      (item) => item.textContent
    );
  }

  hiddeAllRecipes() {
    for (const recipe of this.recipes) recipe.card.classList.add("hidden");
  }

  updateSearch() {
    const ingredients = [];
    const appliances = [];
    const ustensils = [];

    const text = this.search.value.trim();
    const words =
      text.length > this.search.minLength
        ? text.split(/\s+/).map((word) => escapeRegex(replaceDiacritic(word)))
        : [];

    const tagIngredients = this.queryTagAll(".ingredient");
    const tagAppliances = this.queryTagAll(".appliance");
    const tagUstensils = this.queryTagAll(".ustensil");

    let counter = 0;
    this.recipes.forEach((recipe) => {
      if (
        filterOne(recipe, words, tagIngredients, tagAppliances, tagUstensils)
      ) {
        recipe.ingredients.forEach((item) => {
          if (!ingredients.includes(item.ingredient)) {
            ingredients.push(item.ingredient);
          }
        });
        if (!appliances.includes(recipe.appliance)) {
          appliances.push(recipe.appliance);
        }
        recipe.ustensils.forEach((item) => {
          if (!ustensils.includes(item)) {
            ustensils.push(item);
          }
        });
        recipe.card.classList.remove("hidden");
        counter++;
      } else {
        recipe.card.classList.add("hidden");
      }
    });
    this.updateRecipeCounter(counter);

    updateFilter(this.ingredientDropdownList, ingredients);
    updateFilter(this.applianceDropdownList, appliances);
    updateFilter(this.ustensilDropdownList, ustensils);
  }

  updateRecipeCounter(value) {
    this.recipeCounter.textContent = `${value} recette(s)`;
  }
}

const app = new App();
app.run();
