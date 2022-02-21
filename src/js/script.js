console.log("wow");

//test access to netlify function

const englishForm = document.body.querySelector(".english-form");
const englishInput = document.body.querySelector("input[data-sl='en']");
const englishTranslateBtn = englishForm.querySelector("button[type='submit']");
const chineseForm = document.body.querySelector(".chinese-form");
const chineseInput = document.body.querySelector("input[data-sl='zh-CN']");
const chineseTranslateBtn = chineseForm.querySelector("button[type='submit']");

englishForm.addEventListener("submit", function (e) {
  translate(e, englishInput.value, englishInput.dataset.sl);
});
chineseForm.addEventListener("submit", function (e) {
  translate(e, chineseInput.value, chineseInput.dataset.sl);
});

async function translate(e, text, sourceLan) {
  e.preventDefault();
  //determine target language and input element to effect based off the source language
  let targetLan;
  let targetInput;
  let targetTranslateButton;
  const sourceTranslateButton = e.currentTarget.querySelector(
    "button[type='submit']"
  );

  if (sourceLan === "en") {
    targetLan = "zh-CN";
    targetInput = chineseInput;
    targetTranslateButton = chineseTranslateBtn;
  } else if (sourceLan === "zh-CN") {
    targetLan = "en";
    targetInput = englishInput;
    targetTranslateButton = englishTranslateBtn;
  }

  sourceTranslateButton.disabled = true;
  targetTranslateButton.disabled = true;
  sourceTranslateButton.insertAdjacentHTML(
    "beforeend",
    `<img src='../images/loading.gif' alt='loading gif' height=${sourceTranslateButton.offsetHeight}/>`
  );

  const endpointURL = `https://nlp-translation.p.rapidapi.com/v1/translate?text=${text}&to=${targetLan}&from=${sourceLan}`;
  try {
    const resRaw = await fetch(endpointURL, {
      method: "GET",
      headers: {
        "x-rapidapi-host": "nlp-translation.p.rapidapi.com",
        "x-rapidapi-key": "",
      },
    });
    const res = await resRaw.json();

    const translatedText = res.translated_text[res.to];
    targetInput.value = translatedText;
  } catch (error) {
    console.error("ERROR occured while fetching the translate api:::", error);
    alert(
      `ERROR occured while fetching the translate api::: \nError Name: ${error.name} \nError Message: ${error.message}`
    );
  } finally {
    sourceTranslateButton.innerHTML = "translate";
    sourceTranslateButton.disabled = false;
    targetTranslateButton.disabled = false;
  }
}
