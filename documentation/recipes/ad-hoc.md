# Ad-hoc Auditing

## Pre-requisites
* A Mattermost server v5.20
* Completing the [initial setup for the Lighthouse chatbot](/README.md#deployment)

---

## Explanation
Ad-hoc testing is the quickest and easiest way to interact with the Lighthouse chatbot.  
  
This enables you to run an audit on a "no strings attached" method where no configuration for the audit gets persisted in MongoDB.

---

## Default Configuration Audit
Running the `/lighthouse {url}` command allows you to run an audit on any site with the below configuration
* **Performance Audit** - `ON`
* **Accessibility Audit** - `ON`
* **Best Practices Audit** - `ON`
* **PWA Audit** - `ON`
* **SEO Audit** - `ON`
* **Throttling** - `OFF`

0. Run the `/lighthouse {url}` (as it was run on the https://apple.com site below)
![](/documentation/img/ad-hoc-cmd.png)

1. Await audit report from server
![](/documentation/img/ad-hoc-report.png)

---

## Custom Audit
Running the `/lighthouse` command with no options launches a dialog with various options to choose from:  

* **URL**
* **Performance Audit**
* **Accessibility Audit**
* **Best Practices Audit**
* **PWA Audit**
* **SEO Audit**
* **Throttling**
* **Authentication Script**
* **Await Selector** (required when using an `Authentication Script`)

![](/documentation/img/ad-hoc-dialog.png)
