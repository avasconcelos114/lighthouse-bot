# Authentication Scripting

## Pre-requisites
* A Mattermost server v5.20+
* Completing the [initial setup for the Lighthouse chatbot](/README.md#deployment)

## Explanation
Sometimes the page you need to test is behind an authentication screen. 

In times like that you will need to inject JS into the `Authentication Script` section as an IIFE.

Example script (works on Mattermost instances):
```
(() => {
  document.querySelector('#loginId').value = 'username';
  document.querySelector('#loginPassword').value = 'password';
  document.querySelector('#loginButton').click();
})();
```

And to prevent Puppeteer from attempting to run the audit before the screen has fully rendered, you must add the selector (`class` or `id`) of an element on the login screen of your website inside the `Await Selector` field.

![](/documentation/img/auth-script-config.png)

---

**Note:** Providing an `Await Selector` value is __required__ when using an `Authentication Script`. Failure to provide it will return you a validation error message from the chatbot

![](/documentation/img/auth-script-validation.png)
