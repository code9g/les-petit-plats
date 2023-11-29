export const getLiveSearch = (list, onchange) => {
  const main = document.createElement("div");
  main.className = "live-search";
  const head = document.createElement("div");
  head.className = "live-head";
  const content = document.createElement("div");
  content.className = "live-content";

  const input = document.createElement("input");
  input.type = "text";
  input.className = "live-input";
  input.addEventListener("input", (e) => {
    e.preventDefault();
    console.log("input");
  });

  main.appendChild(head);
  main.appendChild(content);
  return main;
};
