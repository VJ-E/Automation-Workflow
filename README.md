# FlowLite - Automation Workflow Engine

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React_Flow-FF0072?style=for-the-badge&logo=react&logoColor=white" alt="React Flow" />
  <img src="https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Gemini" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</div>

<br />

FlowLite is a powerful, AI-driven automation execution engine that allows users to build complex workflows visually. By connecting various nodes—triggers, AI processors, and integrations—users can automate repetitive tasks seamlessly.

![Project Preview](/public/preview.png)

## Problem Statement

In today's fast-paced digital environment, manual data transfer between services is inefficient and error-prone. This project provides a robust **automation tool** designed to orchestrate complex sequences of actions. It empowers users to define triggers (like receiving an email), process data intelligently using AI, and execute actions across external platforms (Discord, Google Sheets, Email) without writing a single line of code.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Visual Editor:** React Flow (@xyflow/react)
- **Styling:** Tailwind CSS
- **AI Integration:** Google Gemini (Generative AI)
- **Backend Logic:** Node.js (Next.js API Routes)
- **Email Services:** Nodemailer (SMTP), Imap-Simple (IMAP)
- **Google Integration:** Google Sheets API, Google Auth

## Features

- **Visual Workflow Builder:** Drag-and-drop interface to design automation flows.
- **Gmail Trigger:** Automatically triggers workflows upon receiving new emails.
- **AI Agent:** Uses Google Gemini to summarize, analyze, or transform text data.
- **Discord Integration:** Sends formatted messages or JSON embeds to Discord webhooks.
- **Google Sheets Integration:** Appends processed data directly to Google Sheets.
- **Email Sender:** Sends automated emails via SMTP.
- **Context Awareness:** Intelligent data passing between nodes (e.g., Email Body -> AI Summary -> Discord Message).
- **Execution Logging:** Real-time logs and visual feedback for workflow runs.

## Example Workflow

**"Smart Email Assistant"**

1.  **Gmail Trigger**: Detects a new unread email from a client.
2.  **AI Summarizer**: Reads the email body and generates a concise summary using the Gemini model.
3.  **Discord Node**: Posts the summary to a team channel for immediate visibility.
4.  **Google Sheets Node**: Logs the sender, subject, and summary into a tracking spreadsheet for records.

## How to Run

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/flow-lite.git
    cd flow-lite
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env.local` file in the root directory and add the following:
    ```env
    # Google Gemini API Key
    GEMINI_API_KEY=your_gemini_api_key

    # Google Cloud Service Account (for Sheets) - Path to JSON file is auto-detected as 'service-account.json'
    # GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json (Optional if file exists in root)

    # Email Credentials (for Gmail Trigger & Sender)
    EMAIL_USER=your_gmail_address@gmail.com
    EMAIL_PASS=your_app_password
    ```

4.  **Add Service Account Key:**
    Place your Google Cloud service account JSON file in the root directory and exact name it `service-account.json`.

5.  **Run the development server:**
    ```bash
    npm run dev
    ```

6.  **Open the app:**
    Navigate to [http://localhost:3000](http://localhost:3000) in your browser.
