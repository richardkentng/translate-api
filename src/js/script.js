console.log("sanity check");

const englishForm = document.body.querySelector(".english-form");
const englishInput = document.body.querySelector("input[data-sl='en']");
const englishTranslateBtn = englishForm.querySelector("button[type='submit']");
const chineseForm = document.body.querySelector(".chinese-form");
const chineseInput = document.body.querySelector("input[data-sl='zh-CN']");
const chineseTranslateBtn = chineseForm.querySelector("button[type='submit']");

englishForm.addEventListener("submit", function (e) {
  onSubmit(e, englishInput.value, englishInput.dataset.sl);
});
chineseForm.addEventListener("submit", function (e) {
  onSubmit(e, chineseInput.value, chineseInput.dataset.sl);
});

async function onSubmit(e, text, sourceLan) {
  //prevent page reload upon submitting form:
  e.preventDefault();

  let targetLan; //for api
  let targetInput; //where to show translated result
  let targetTranslateButton; //ux: disable this during translation
  let sourceTranslateButton; //ux: where to show the loading wheel
  //populate the above variables:
  determineThe_targetLanguague_inputElement_translateButtons();

  // show visual cues:
  disableTranslateButtons_showLoadingWheel();

  //translate the text:
  const translatedText = await translate(text, sourceLan, targetLan);

  //show the translated text:
  targetInput.value = translatedText;

  // hide visual cues:
  enableTranslateButtons_hideLoadingWheel();

  //------------------------------------------------------------------------
  //**************************  FUNCTIONS  *********************************
  //------------------------------------------------------------------------

  function determineThe_targetLanguague_inputElement_translateButtons() {
    if (sourceLan === "en") {
      targetLan = "zh-CN";
      targetInput = chineseInput;
      targetTranslateButton = chineseTranslateBtn;
    } else if (sourceLan === "zh-CN") {
      targetLan = "en";
      targetInput = englishInput;
      targetTranslateButton = englishTranslateBtn;
    }

    sourceTranslateButton = e.currentTarget.querySelector(
      "button[type='submit']"
    );
  }

  async function translate(text, sourceLan, targetLan) {
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
      return translatedText;
    } catch (error) {
      return error.toString();
    }
  }

  function enableTranslateButtons_hideLoadingWheel() {
    sourceTranslateButton.innerHTML = "translate"; //removes loading symbol
    sourceTranslateButton.disabled = false; //this is the clicked button
    targetTranslateButton.disabled = false;
  }
  function disableTranslateButtons_showLoadingWheel() {
    sourceTranslateButton.disabled = true; //this is the clicked button
    targetTranslateButton.disabled = true;
    //add loading symbol to clicked button:
    sourceTranslateButton.insertAdjacentHTML(
      "beforeend",
      `<img src='../images/loading.gif' alt='loading gif' height=${sourceTranslateButton.offsetHeight}/>`
    );
  }
}
