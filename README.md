# News Monitor

This is a Next.js application for monitoring news from various sources.

## Getting Started 🚀

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Running with Docker Compose (Recommended) 🐳

This is the easiest and recommended way to run the project.

**1. Prerequisites**

*   [Docker](https://www.docker.com/get-started)
*   [Docker Compose](https://docs.docker.com/compose/install/)

**2. Environment Configuration**

Create a file named `.env.local` in the root of the project. This file will hold your environment variables.

Add your MongoDB connection string and OpenAI API key to this file:

```env
MONGODB_URI=mongodb://db:27017/news-monitor
OPENAI_API_KEY=your_openai_api_key
```

**3. Build and Run the Application**

```bash
docker compose up -d
```

The application will be available at [http://localhost:3000](http://localhost:3000).

---

### Manual Setup ⚙️

If you prefer to run the project without Docker, follow these instructions.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18.x or later recommended)
*   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
*   [MongoDB](https://www.mongodb.com/)

### MongoDB Setup

This project requires a running MongoDB instance.

**1. Installation**

If you don't have MongoDB installed, follow the official installation guide for your operating system:
[Install MongoDB Community Edition](https://www.mongodb.com/docs/manual/installation/)

**2. Running MongoDB on Linux**

On most Linux distributions using systemd (like Ubuntu), you can manage the MongoDB service with the following commands.

*   **Start the service:**
    ```bash
    sudo systemctl start mongod
    ```

*   **Check the service status:**
    ```bash
    sudo systemctl status mongod
    ```

*   **(Optional) Enable MongoDB to start on boot:**
    ```bash
    sudo systemctl enable mongod
    ```

**2. Running MongoDB on Windows**

For Windows, you typically install MongoDB as a service. After installation, MongoDB usually starts automatically. You can manage it via the Services application (`services.msc`).

*   **Start/Stop/Restart MongoDB Service:**
    Open `services.msc`, find "MongoDB Server", right-click, and select the desired action.

*   **Check MongoDB Status:**
    You can check the MongoDB log file (usually in `C:\Program Files\MongoDB\Server\<version>\log`) or try connecting via `mongosh` (MongoDB Shell) in your command prompt.

### Project Setup

**1. Clone the repository**

```bash
git clone git@github.com:Agabovino/portalPB-app.git
cd news-monitor-latest
```

**2. Install Dependencies**

Install the project dependencies using npm or yarn:

```bash
npm install
# or
yarn install
```

**3. Environment Configuration**

Create a file named `.env.local` in the root of the project. This file will hold your environment variables.

Add your MongoDB connection string and OpenAI API key to this file. For a standard local installation, the string will look like this:

```env
MONGODB_URI=mongodb://localhost:27017/news-monitor
OPENAI_API_KEY=your_openai_api_key
```

If your MongoDB instance runs on a different host or port, make sure to update the connection string.

**4. Run the Development Server**

Once your database is running and your environment is configured, start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.