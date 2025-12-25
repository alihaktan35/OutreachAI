# OutreachAI

OutreachAI is a web application designed to automate cold email outreach campaigns. It leverages n8n for workflow automation and Firebase for database and authentication, providing a seamless experience for creating, managing, and sending personalized email campaigns.

## Features

- **User Authentication**: Secure login and user management powered by Firebase Authentication.
- **Campaign Dashboard**: A comprehensive dashboard to view and manage all your outreach campaigns.
- **Dynamic Campaign Creation**: Create new campaigns by providing a campaign name, sender information, and a CSV file of contacts.
- **AI-Powered Draft Generation**: Instead of sending emails immediately, launching a campaign triggers a background n8n workflow to generate personalized email subjects and bodies for each contact using AI.
- **Draft Review and Edit**: A dedicated "Campaign Drafts" section where you can review, edit, and approve every single email before it's sent.
- **Domain Suggestions**: A utility to help you find and brainstorm alternative domains for your outreach to improve deliverability.
- **Real-time Status Updates**: The UI provides real-time feedback on the status of n8n services and campaign generation.

## Workflow

The campaign lifecycle follows a robust, multi-step process:

1.  **Create Campaign**: The user fills out the "New Campaign" form, providing a campaign name, sender details, and a CSV file containing contacts.
2.  **Generate Drafts**: Upon clicking "Launch Campaign", the web app saves the campaign to Firestore with a `generating` status. It then triggers the `create-draft` n8n webhook, passing the campaign data.
3.  **AI Content Creation**: The n8n workflow processes the data, and for each contact, it calls a generative AI to create a personalized email subject and body.
4.  **Update Database**: Once n8n has generated all the drafts, it updates the campaign document in Firestore. It populates the `contacts` array with the AI-generated content and changes the campaign status to `drafts_ready`.
5.  **Review and Edit**: The campaign now appears in the "Campaign Drafts" section of the dashboard. The user can review each email, make edits to the subject and body, and save changes back to Firestore.
6.  **Send Campaign**: Once satisfied, the user clicks the "Send Campaign" button. This triggers the `send-mail` n8n webhook, passing the final, edited list of contacts.
7.  **Email Dispatch & Completion**: The `send-mail` n8n workflow iterates through the contacts and sends each email via the configured SMTP service. The web app then optimistically updates the campaign status to `completed`.

## n8n Configuration

For the application to communicate with your n8n instance, especially during local development, you must configure CORS (Cross-Origin Resource Sharing) in n8n.

Set the following environment variable for your n8n instance to allow requests from the web app:

```
N8N_CORS_ALLOW_ORIGIN=*
```

After setting this variable, you must **restart** your n8n instance.

The application relies on three specific webhooks in your n8n workflow:
-   `POST /webhook/ping`: Used for health checks to see if the n8n service is online.
-   `POST /webhook/create-draft`: Receives the initial campaign data to generate drafts.
-   `POST /webhook/send-mail`: Receives the final, edited drafts to be sent.