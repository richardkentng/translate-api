console.log("sanity check");

//======================================================/
//------------------- GRAB ELEMENTS --------------------/
//======================================================/

const languageForm = document.body.querySelector(".language-form");
const langInput1 = languageForm.selectSourceLang;
const langInput2 = languageForm.selectTargetLang;
const sourceTextarea = languageForm.sourceTextarea;
const targetTextarea = languageForm.targetTextarea;
const swapLangsBtn = document.body.querySelector(".swap-langs-btn");
const loadingWheel = document.body.querySelector(".loading-wheel");
const translateBtn = document.body.querySelector(".translate-btn");
const translations = document.body.querySelector(".translations");

//======================================================/
//--------------- POPULATE/UPDATE HTML -----------------/
//======================================================/

populateLangDatalist();
displayTranslations(getTranslations());

//update language selections from local storage
langInput1.value = localStorage.getItem("selectSourceLang") || "";
langInput2.value = localStorage.getItem("selectTargetLang") || "";

//======================================================/
//---------------- ADD EVENT LISTENERS -----------------/
//======================================================/

//submit form to translate
languageForm.addEventListener("submit", onSubmitLangForm);

//click delete button to delete translation history item
translations.addEventListener("click", deleteTranslationHistoryItem);

//click swap button to swap language & text, save language selections to local storage
swapLangsBtn.addEventListener("click", swapLangAndText);

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

  const langCode1 = getLangCode(langInput1);
  const langCode2 = getLangCode(langInput2);
  if (!langCode1 || !langCode2) return; //validation
  saveLangs(); //save valid languages

  loadingWheel.classList.remove("visually-hidden");
  translateBtn.classList.add("disabled");

  const data = await translate(sourceTextarea.value, langCode1, langCode2);
  const translatedText = data.translated_text[data.to];
  targetTextarea.value = translatedText;

  loadingWheel.classList.add("visually-hidden");
  translateBtn.classList.remove("disabled");

  displayTranslations(addTranslationToLocalStorage(data));

  sourceTextarea.focus();
}

function getLangCode(inputEl) {
  //get the language from the input
  const lang = inputEl.value;
  const langCode = lang_langCode[lang]; //feed language into object to get the language code
  if (langCode) return langCode; //if code exists, return it

  // else show popup:
  insertToast(`Please select a valid language.`, inputEl); //inputEl is used for postion reference
  inputEl.focus();
  return false; //end the translation process
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
    alert(error.toString());
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
  let temp = langInput1.value;
  langInput1.value = langInput2.value;
  langInput2.value = temp;
  //swap text
  temp = sourceTextarea.value;
  sourceTextarea.value = targetTextarea.value;
  targetTextarea.value = temp;
  //focus textarea
  sourceTextarea.focus();
}

function saveLangs() {
  localStorage.setItem(langInput1.name, langInput1.value);
  localStorage.setItem(langInput2.name, langInput2.value);
}

function populateLangDatalist() {
  const languages = Object.keys(lang_langCode);
  const optionsHtml = languages
    .map((lang) => `<option value="${lang}">${lang}</option>`)
    .join("");
  document.body.querySelector("#lang-list").innerHTML = optionsHtml;
}

function insertToast(text, refElement) {
  //construct and insert toast:
  const toastStr = `
  <div class="my-toast">
    <i class="arrow-icon bi-caret-up-fill"></i>
    <div class="box">
      <i class="bang-icon bi-exclamation-square-fill"></i>
      <span class="text">${text}</span>
    </div>
  </div>`;
  document.body.insertAdjacentHTML("beforeend", toastStr);
  const toast = document.body.lastChild;
  //position based on refElement:
  const { x: refX, bottom: refBottom } = refElement.getBoundingClientRect();
  toast.style.left = refX + "px";
  toast.style.top = refBottom - 8 + "px"; //subtract 8 to adjust for the whitespace around arrow
  //vanish after 3 seconds:
  setTimeout(() => {
    toast.remove();
  }, 3000);
}
