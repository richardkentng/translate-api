console.log("sanity check");

//======================================================/
//------------------- GRAB ELEMENTS --------------------/
//======================================================/

const languageForm = document.body.querySelector(".language-form");
const translations = document.body.querySelector(".translations");
const swapLangsBtn = document.body.querySelector(".swap-langs-btn");
const loadingWheel = document.body.querySelector(".loading-wheel");
const translateBtn = document.body.querySelector(".translate-btn");

//======================================================/
//--------------- POPULATE/UPDATE HTML -----------------/
//======================================================/

populateLangSelects();
displayTranslations(getTranslations());

//update language selections from local storage
languageForm.selectSourceLang.value =
  localStorage.getItem("selectSourceLang") || "";
languageForm.selectTargetLang.value =
  localStorage.getItem("selectTargetLang") || "";

//======================================================/
//---------------- ADD EVENT LISTENERS -----------------/
//======================================================/

//submit form to translate
languageForm.addEventListener("submit", onSubmitLangForm);

//click delete button to delete translation history item
translations.addEventListener("click", deleteTranslationHistoryItem);

//select a language to save languages to local storage
languageForm.selectSourceLang.addEventListener("change", saveLangs);
languageForm.selectTargetLang.addEventListener("change", saveLangs);

//click swap button to swap language & text, save language selections to local storage
swapLangsBtn.addEventListener("click", () => {
  swapLangAndText();
  saveLangs();
});

//if meta + enter is pressed, click translate button
document.body.addEventListener("keydown", (e) => {
  if (!e.metaKey || e.key !== "Enter") return;
  translateBtn.click();
});

//======================================================/
//------------------ CORE FUNCTIONS --------------------/
//======================================================/

async function onSubmitLangForm(e) {
  e.preventDefault();

  loadingWheel.classList.remove("visually-hidden");
  translateBtn.classList.add("disabled");

  const data = await translate(
    this.sourceTextarea.value,
    this.selectSourceLang.value,
    this.selectTargetLang.value
  );
  const translatedText = data.translated_text[data.to];
  this.targetTextarea.value = translatedText;

  loadingWheel.classList.add("visually-hidden");
  translateBtn.classList.remove("disabled");

  displayTranslations(addTranslationToLocalStorage(data));

  languageForm.sourceTextarea.focus();
}

async function translate(text, sourceLang, targetLang) {
  const requestOptions = {
    method: "GET",
    url: "/.netlify/functions/fetch-translation",
    params: {
      text,
      from: sourceLang,
      to: targetLang,
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

//======================================================/
//--- FUNCTIONS TO ADD & DISPLAY TRANSLATION HISTORY ---/
//======================================================/

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
      <button data-delete-translation-history-item class="btn btn-outline-danger">
        <i class="bi-trash" data-delete-translation-history-item></i>
      </button>
    </div>
    `;
    })
    .join("");

  document.body.querySelector(".translations").innerHTML = translationsStr;
}

function getTranslations() {
  let translations = localStorage.getItem("translations") || "[]";
  return JSON.parse(translations);
}

//======================================================/
//------ FUNCTIONS TO DELETE TRANSLATION HISTORY -------/
//======================================================/

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

//======================================================/
//-------------- MISCELLANEOUS FUNCTIONS ---------------/
//======================================================/

function swapLangAndText() {
  //swap lang
  const tempLang = languageForm.selectSourceLang.value;
  languageForm.selectSourceLang.value = languageForm.selectTargetLang.value;
  languageForm.selectTargetLang.value = tempLang;
  //swap text
  const tempText = languageForm.sourceTextarea.value;
  languageForm.sourceTextarea.value = languageForm.targetTextarea.value;
  languageForm.targetTextarea.value = tempText;
  //focus textarea
  languageForm.sourceTextarea.focus();
}

function saveLangs() {
  localStorage.setItem(
    languageForm.selectSourceLang.name,
    languageForm.selectSourceLang.value
  );
  localStorage.setItem(
    languageForm.selectTargetLang.name,
    languageForm.selectTargetLang.value
  );
}

function populateLangSelects() {
  nlpLangCodes.unshift(["", "Select a Language"]);
  const optionsHtml = nlpLangCodes //nlpLangCodes is sourced from ./nlp-lang-codes.js
    .map(([langCode, lang]) => `<option value="${langCode}">${lang}</option>`)
    .join("");
  languageForm.selectSourceLang.innerHTML = optionsHtml;
  languageForm.selectTargetLang.innerHTML = optionsHtml;
}
