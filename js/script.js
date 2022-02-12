console.log("sanity check");

const englishForm = document.body.querySelector(".english-form");
const englishInput = document.body.querySelector("input[data-sl='en']");
const chineseForm = document.body.querySelector(".chinese-form");
const chineseInput = document.body.querySelector("input[data-sl='zh-CH']");

englishForm.addEventListener("submit", translate);
chineseForm.addEventListener("submit", translate);

function translate(e) {
  e.preventDefault();
}
