# Automation WorkFlow: The Local-First AI Automation Engine

![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google%20gemini&logoColor=white)

## The Why

Existing tools like n8n are powerful but heavy. **Automation WorkFlow** is designed for lightweight, stateless AI chaining. It eliminates the overhead of complex workflow engines while providing a robust environment for prototyping and executing AI-driven automation directly from your local environment.

## Key Features

- **Visual DAG Editor**: Built on [React Flow](https://reactflow.dev/) for intuitive graph management and real-time visualization.
- **Gemini 2.0 Integration**: Native support for Google's latest multimodal models (e.g., `gemini-2.5-flash-lite`) via the Google Generative AI SDK, enabling high-performance processing.
- **Local-First Architecture**: Zero-database dependency. Workflows persist securely in `LocalStorage`, ensuring your data stays on your machine.
- **Server-Side Execution**: Secure backend runtime using Next.js API Routes (`/api/run`) for processing sensitive logic away from the client.

## Quick Start

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/VJ-E/Automation-Workflow.git
    cd Automation-Workflow
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment:**
    Create a `.env.local` file in the root directory and add your Google Gemini API Key:
    ```bash
    echo "GEMINI_API_KEY=your_api_key_here" > .env.local
    ```

4.  **Launch the application:**
    ```bash
    npm run dev
    ```

## Architecture

Automation WorkFlow operates on a decoupled execution model:

1.  **Frontend (React Flow)**: Users design the DAG (Directed Acyclic Graph) visually. Nodes and edges store configuration and connectivity data.
2.  **JSON Serialization**: Upon execution, the complete graph structure is serialized into a lightweight JSON payload.
3.  **Backend Runner (Next.js API)**: The `/api/run` endpoint receives the JSON, reconstructs the graph, and executes nodes sequentially (or in parallel) using a server-side runtime.
4.  **AI Integration**: The backend directly interfaces with the Google Gemini API, handling prompt engineering and response parsing before returning the final execution context to the frontend.

## License

MIT
