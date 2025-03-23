# Agentic Backend in Python

This is the Python-based agentic application backend designed to run as a web server using FastAPI and Uvicorn. 
Below are the steps to set up the development environment, install dependencies, and start the server.

## Prerequisites

- Python 3.7 or higher
- `pip` package manager

## Setup Instructions

### 1. Create a Virtual Environment

To isolate the project dependencies, create a virtual environment using `venv`.

```bash
python -m venv venv
```

### 2. Activate the Virtual Environment

Activate the virtual environment to ensure all dependencies are installed within it.

#### On Windows:
```bash
venv\Scripts\activate
```

#### On macOS/Linux:
```bash
source venv/bin/activate
```

### 3. Install Dependencies

Install the required dependencies using `pip` and the `requirements.txt` file.

```bash
pip install -r requirements.txt
```

### 4. Start the Server

Once the dependencies are installed, start the server using Uvicorn.

```bash
uvicorn main:app --reload --port 8000 --host 0.0.0.0
```

- `main:app`: Refers to the `app` object in the `main.py` file.
- `--reload`: Enables auto-reloading of the server when code changes are detected.
- `--port 8000`: Specifies the port on which the server will run.
- `--host 0.0.0.0`: Allows the server to be accessible from any IP address.

### 5. Access the Application

Once the server is running, you can access the application by navigating to:

```
http://localhost:8000
```

If running on a remote server, replace `localhost` with the server's IP address.

## Additional Notes

- Ensure the virtual environment is activated whenever working on the project.
- Use `deactivate` to exit the virtual environment when done.
- For production, consider removing the `--reload` flag and using a process manager like `gunicorn` with Uvicorn workers.
