console.log("sanity check");

displayTranslations(getTranslations());

//listen for clicks (will check if the click originated from a delete button)
const translations = document.body.querySelector(".translations");
translations.addEventListener("click", deleteTranslationHistoryItem);

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
  const data = await translate(text, sourceLan, targetLan);
  const translatedText = data.translated_text[data.to];

  //show the translated text:
  targetInput.value = translatedText;

  // hide visual cues:
  enableTranslateButtons_hideLoadingWheel();

  displayTranslations(addTranslationToLocalStorage(data));

  //------------------------------------------------------------------------
  //**************************  FUNCTIONS (for core api functionality) *********************************
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
    const requestOptions = {
      method: "GET",
      url: "/.netlify/functions/fetch-translation",
      params: {
        text,
        from: sourceLan,
        to: targetLan,
      },
    };

    try {
      const { data } = await axios.request(requestOptions);
      return data;
    } catch (error) {
      console.error(error);
      return error.toString();
    }
  }

  //for visual cues:

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

//---------------------------------------------------------------------------------
//********** MORE FUNCTIONS (relating to showing translation history)  ************
//---------------------------------------------------------------------------------

function addTranslationToLocalStorage(data) {
  //get translations from local storage
  let translations = getTranslations();
  //add the translated data into the translations array
  translations.unshift({
    originalText: data.original_text,
    translatedText: data.translated_text[data.to],
    dateCreated: Date.now(),
  });
  //limit translations to 10 items
  if (translations.length > 10) translations.pop();
  //update local storage with new translations array
  localStorage.setItem("translations", JSON.stringify(translations));
  return translations;
}

function displayTranslations(translations) {
  //hide/show section.translation-history depending on length of translations array
  const section = document.body.querySelector("section.translation-history");
  if (!translations.length) return section.classList.add("display-none");
  else section.classList.remove("display-none");

  //convert an array of translation objects into an HTML-displayable string
  let translationsStr = translations
    .map((t) => {
      return `
    <div class="translation">
      <div>
        <p>${t.originalText}</p>
        <p>${t.translatedText}</p>
      </div>
      <!-- the data attribute describes this button as a delete button for later use: -->
      <button data-delete-translation-history-item>
        <i class="bi-trash" data-delete-translation-history-item></i>
      </button>
    </div>
    `;
    })
    .join("");

  const translationCont = document.body.querySelector(".translations");
  translationCont.innerHTML = translationsStr;
}

function getTranslations() {
  let translations = localStorage.getItem("translations") || "[]";
  return JSON.parse(translations);
}

//---------------------------------------------------------------------------------
//********** MORE FUNCTIONS (to DELETE an item from translation history)  ************
//---------------------------------------------------------------------------------

function deleteTranslationHistoryItem(e) {
  //ensure that delete button was clicked:
  if (!e.target.dataset.hasOwnProperty("deleteTranslationHistoryItem")) return;

  //update local storage by deleting item
  let translations = getTranslations();
  const indexToDelete = getIndexTranslationItem(
    getParentContainerWithClassOfTranslation()
  );
  translations = translations.filter((item, i) => i !== indexToDelete);
  localStorage.setItem("translations", JSON.stringify(translations));

  //show remaining translation history items
  displayTranslations(translations);

  function getParentContainerWithClassOfTranslation() {
    let walker = e.target.parentElement;
    while (!walker.classList.contains("translation")) {
      walker = walker.parentElement;
    }
    return walker;
  }

  function getIndexTranslationItem(itemToDelete) {
    const translations = document.body.querySelectorAll(".translation");
    let index;
    for (let i = 0; i < translations.length; i++) {
      if (translations[i] === itemToDelete) {
        index = i;
        break;
      }
    }
    return index;
  }
}
