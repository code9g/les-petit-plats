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

function prepareWords(text) {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 2 && !this.wholes.has(word))
    .map((word) => escapeRegex(replaceDiacritic(word)));
}

function filterOne(recipe, words, ingredients, appliances, ustensils) {
  // Filtre sur les tags
  if (
    !ingredients.every((ingredient) =>
      recipe.ingredients.find((item) => item.ingredient === ingredient)
    ) ||
    (appliances.length > 0 && !appliances.includes(recipe.appliance)) ||
    !ustensils.every((ustensil) => recipe.ustensils.includes(ustensil))
  ) {
    return false;
  }
  // Filter sur les mots
  return (
    words.length === 0 ||
    words.some((word) => {
      const re = new RegExp(word, "i");
      return (
        re.exec(recipe.name) ||
        re.exec(recipe.description) ||
        recipe.ingredients.find((item) => re.exec(item.ingredient))
      );
    })
  );
}

function filterAll(recipes, search, ingredients, appliances, ustensils) {
  const words = prepareWords(search);
  return recipes.filter((recipe) =>
    filterOne(recipe, words, ingredients, appliances, ustensils)
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
    this.wholes = new Set(["de", "au", "aux", "le", "la", "les"]);
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

    // Fermeture des "dropdowns" quand on clique à l'extérieur
    document.addEventListener("click", this.handleClick.bind(this));

    const cards = document.querySelector("#recipes .cards");
    for (const recipe of this.recipes) {
      const card = recipeCardTemplate(recipe);
      recipe.card = card;
      cards.appendChild(card);
    }

    const form = document.querySelector("form[name=search]");
    this.search = form.querySelector("input.input-search");
    let h = null;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      clearTimeout(h);
      this.updateSearch();
    });

    this.search.addEventListener("input", (e) => {
      e.preventDefault();
      clearTimeout(h);
      h = setTimeout(() => {
        if (this.search.value.length >= this.search.minLength) {
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

    this.updateRecipeCounter(this.recipes.length);
  }

  queryTagAll(target) {
    return Array.from(this.tags.querySelectorAll(target)).map(
      (item) => item.textContent
    );
  }

  updateSearch() {
    const ingredients = [];
    const appliances = [];
    const ustensils = [];

    const words = prepareWords(this.search.value);
    const fIngredients = this.queryTagAll(".ingredient");
    const fAppliances = this.queryTagAll(".appliance");
    const fUstensils = this.queryTagAll(".ustensil");

    let counter = 0;

    this.recipes.forEach((recipe) => {
      if (filterOne(recipe, words, fIngredients, fAppliances, fUstensils)) {
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

    // const recipes = filterAll(
    //   this.recipes,
    //   this.search.value,
    //   this.queryTagAll(".ingredient"),
    //   this.queryTagAll(".appliance"),
    //   this.queryTagAll(".ustensil")
    // );

    // const cards = document.querySelectorAll("#recipes .cards .recipe");
    // let i = 0;
    // const n = cards.length;
    // recipes.forEach((recipe) => {
    //   if (!appliances.includes(recipe.appliance)) {
    //     appliances.push(recipe.appliance);
    //   }
    //   recipe.ingredients.forEach((ingredient) => {
    //     if (!ingredients.includes(ingredient.ingredient)) {
    //       ingredients.push(ingredient.ingredient);
    //     }
    //   });
    //   recipe.ustensils.forEach((ustensil) => {
    //     if (!ustensils.includes(ustensil)) {
    //       ustensils.push(ustensil);
    //     }
    //   });
    //   while (i < n) {
    //     const card = cards[i++];
    //     if (card.dataset.id == recipe.id) {
    //       card.classList.remove("hidden");
    //       break;
    //     } else {
    //       card.classList.add("hidden");
    //     }
    //   }
    // });
    // while (i < n) {
    //   cards[i++].classList.add("hidden");
    // }

    updateFilter(this.ingredientDropdownList, ingredients);
    updateFilter(this.applianceDropdownList, appliances);
    updateFilter(this.ustensilDropdownList, ustensils);

    this.updateRecipeCounter(counter);
  }

  updateRecipeCounter(value) {
    document.querySelector(".results").textContent = `${value} recette(s)`;
  }
}

const app = new App();
app.run();
