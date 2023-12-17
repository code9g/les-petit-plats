export function mainTemplate() {
  const main = document.createElement("main");
  main.className = "l-main";

  const filtersSection = document.createElement("section");
  filtersSection.id = "filters";
  const filtersContainer = document.createElement("div");
  filtersContainer.className = "container";
  const filters = document.createElement("div");
  filters.className = "filters";
  filtersContainer.appendChild(filters);
  const results = document.createElement("div");
  results.className = "results";
  filtersContainer.appendChild(results);
  filtersSection.appendChild(filtersContainer);

  const tagsSection = document.createElement("section");
  tagsSection.id = "tags";
  const tagsContainer = document.createElement("div");
  tagsContainer.className = "container hidden";
  tagsSection.appendChild(tagsContainer);

  const recipesSection = document.createElement("section");
  recipesSection.id = "recipes";
  const recipesContainer = document.createElement("div");
  recipesContainer.className = "container cards";
  recipesSection.append(recipesContainer);

  main.appendChild(filtersSection);
  main.appendChild(tagsSection);
  main.appendChild(recipesSection);

  return main;
}
