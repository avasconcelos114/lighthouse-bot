# Viewing Audit Trends

## Pre-requisites
* A Mattermost server v5.16+
* Completing the [initial setup for the Lighthouse chatbot](/README.md#deployment)
* Running audits on a given URL at least twice (Either through [ad-hoc auditing](/documentation/recipes/ad-hoc.md) or [scheduled jobs](/documentation/recipes/scheduling.md))

---

## Explanation
Running lighthouse audits is a good way to visualize the performance and compliance of best practices of your website. The audit trend dashboard is a great way to view how the overall quality of your website fares _over time_

---

## Connecting to the dashboard
You may run the `/lighthouse stats {url}` command to receive a link to the audit trends dashboard for a given site.

![](/documentation/img/audit-stats-cmd.png)

Note: The dashboard requires at least 2 audits on a URL before becoming available for usage.

After clicking the link you'll be taken to the dashboard where you can view the overall trend by category for the past 5 audit runs

![](/documentation/img/audit-trend-dashboard.png)