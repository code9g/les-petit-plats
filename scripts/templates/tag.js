export function tagTemplate(target, key, text, callback) {
  const result = document.createElement("div");
  result.className = "tag";
  result.classList.add(target.slice(0, -8));
  result.dataset.target = target;
  result.dataset.key = key;

  result.appendChild(document.createTextNode(text));

  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn-clear";
  button.addEventListener("click", callback);

  result.appendChild(button);

  return result;
}
