# [Deployed Translation Site](https://translate-api.netlify.app/)

## This api-implementation translates English text to Chinese text and vice versa!

![main](./github_images/main.png)

# Resources

- [NLP Translation API](https://rapidapi.com/gofitech/api/nlp-translation/)
  - I simply looked up translation apis and used the first one I found that worked. My goal was not to choose the best API but to get acquainted with using APIs. Anyhow, I dislike how this API takes several seconds to translate...there are definitely faster ones!
- Bootstrap (used to style forms and buttons)
  - some classes used:
    - used `input-group` on a container to make its children side by side (eg a text input next to a button)
    - used `form-control` on a text input to make it responsively span the page width
    - used `form-label` on a label for a text input

# Dependencies

- axios
  - used again inside the netlify function to access the translation API
  - (was also used in the frontend to access the netlify function, but via CDN)

# Lessons Learned

- Hide the api-key from the get go!
  - I had a bad development practice: I would hard-code the api secret to test the api. Later, I would rely on memory to remove the api secret before commiting and pushing up. One time, I forgot to remove it, and I commited the api secret! Luckily, I was able to remove the commit via `git reset --soft HEAD~1` before I pushed up, saving me some trouble. Lesson learned!
- To access data from an axios response, I must access the data property!
  - This sounds rather obvious now that I've typed it out, but it still amazes me how often I've mistakenly tried to use the direct axios response, having forgotten the fact that the data....is actually in the data property!

# Cool Feature: Translation History w/ Local Storage

![translation history](./github_images/translation-history.png)

After a translation is processed, it will automatically be stored in local storage and displayed on the page!

- CR~U~D
  - Create: store the translated item in local storage
  - Read: display the items from local storage
  - ~~Update~~: there is no need to edit the text of past translations.
  - Delete: remove select translations from local storage

# A Note About User Experience

![loading wheel](./github_images/loading.png)

I'm a big advocate of great user experience! In this case, I just added a simple loading wheel to inform users that their translation is processing! Otherwise, the user would be discouraged by lack of a quick response, and leave.

# Next Steps?

- add keyboard shortcut (meta + enter) to submit translation form!
- add feature for voice input!
- add copy/paste button
- add speaker buttons so that it reads aloud the clicked text!
- learn how to download JSON file of past translations!
- ~~allow users to see a history of their translations via localStorage~~
  - ~~limit history to 10 items~~
  - ~~allow users to delete items from translation history!~~
    - ~~beautify delete button layout with flexbox and a bootstrap icon~~
  - allow users to 'clear all' history via drop down menu
- allow translations between any two languages -- not just english and chinese!
- limit api requests per user
- notify users when the api is down (this api only allows about 300 free requests per month)
- create a slider to adjust the font size of chinese characters in the translation history?
- add bootstrap?
- move github repo link to the navbar?
- make sure site is responsive
- ~~change the input tag to a textarea tag so that more text can be shown!~~
- ~~learn how to customize url names for netlify, because 'https://cranky-wing-b0bad3.netlify.app/' sounds way too random!~~

# More

## Before Bootstrap

![before bootstrap](./github_images/before-bootstrap.png)

## After Bootstrap

![after bootstrap](./github_images/after-bootstrap.png)
