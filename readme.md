# This api-based project will translate English text to Chinese and vice versa. Deployed app coming soon!

# Lessons learned so far:

- Hide api-key from the get go!
  - I had a bad development practice: I would hard-code the api secret to test the api. Later, I would rely on memory to remove the api secret before commiting and pushing up. One time, I forgot to remove it, and I commited the api secret! Luckily, I was able to remove the commit via `git reset --soft HEAD~1` before I pushed up, saving me some trouble. Lesson learned!
