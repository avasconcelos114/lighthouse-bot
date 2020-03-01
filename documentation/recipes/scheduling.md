# Scheduling Audit Jobs

## Pre-requisites
* A Mattermost server v5.20+
* Completing the [initial setup for the Lighthouse chatbot](/README.md#deployment)

## Explanation
Scheduling jobs lies at the core of being able to consistently and effortlessly audit your sites.

The Lighthouse chatbot counts on a variety of actions that are provided to manage all your audit jobs:

* `/lighthouse jobs` - Launches audit configuration dialog
* `/lighthouse jobs ls` - Lists all existing scheduled jobs
* `/lighthouse jobs rm {id}` - Removes a scheduled job (must use unique id value that can be verified by running `/lighthouse jobs ls`)
* `/lighthouse jobs info {id}` - Shows detailed configurations for a scheduled job (must use unique id value that can be verified by running `/lighthouse jobs ls`)

## Scheduling a job
Run the `/lighthouse jobs` command to launch a dialog with the following options to configure:  

* **URL**
* **Schedule**
* **Performance Audit**
* **Accessibility Audit**
* **Best Practices Audit**
* **PWA Audit**
* **SEO Audit**
* **Throttling**
* **Authentication Script**
* **Await Selector** (required when using an `Authentication Script`)

Note: The `Schedule` field must be filled in the CRON format, consult [this link](http://www.nncron.ru/help/EN/working/cron-format.htm) to verify how to set a job to your desired frequency  
---

## Listing jobs
Run the `/lighthouse jobs ls` command to receive a list of all existing audit jobs

![](/documentation/img/scheduling-ls.png)

---

## Removing a job
Run the `/lighthouse jobs rm {id}` command to remove a registered job.

Note: In order to remove a job, you must use a unique `id` value that can be verified by running `/lighthouse jobs ls`
![](/documentation/img/scheduling-rm.png)

---

## Verifying configuration
Run the `/lighthouse jobs info {id}` command to view a job's configuration.

Note: In order run this command, you must use a unique `id` value that can be verified by running `/lighthouse jobs ls`
![](/documentation/img/scheduling-info.png)
