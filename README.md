# Groq-Based-LLM-ChatBot-API

Free LLM ChatBot API Powered by Groq API with a ChatGPT-like HTML Template

## Description

This project provides a robust, scalable ChatBot API powered by Groq's Large Language Model (LLM) API. It features a Flask-based backend that interfaces with Groq's API to provide chat functionality, along with a responsive, ChatGPT-inspired frontend for easy integration and testing.

## Features

- Flask-based API for chat interactions
- Integration with Groq's LLM API for natural language processing
- Session-based chat history management
- Streaming responses for real-time interaction
- Responsive, ChatGPT-like HTML/CSS/JavaScript frontend
- Support for creating multiple chat sessions
- Ability to rename and delete chat sessions
- Clear chat history functionality

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/SakibAhmedShuva/Groq-Based-LLM-ChatBot-API.git
   cd Groq-Based-LLM-ChatBot-API
   ```

2. Install the required Python packages:
   ```
   pip install -r requirements.txt
   ```

3. Set up your Groq API key:
   - Sign up for a Groq account and obtain your API key
   - Replace the `api_key` variable in `bot.py` with your actual Groq API key

## Usage

1. Start the Flask server:
   ```
   python bot.py
   ```

2. Open `index.html` in your web browser to access the chat interface.

## API Endpoints

### 1. Create a New Chat Session
- **URL:** `/create-session`
- **Method:** `POST`
- **Response:** 
  ```json
  {
    "status": "success",
    "session_id": "unique-session-id"
  }
  ```

### 2. Stream Chat
- **URL:** `/stream-chat`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "session_id": "unique-session-id",
    "messages": [
      {
        "role": "user",
        "content": "User message here"
      }
    ]
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "response": "Assistant's response here",
    "history": [
      {
        "role": "user",
        "content": "User message here"
      },
      {
        "role": "assistant",
        "content": "Assistant's response here"
      }
    ]
  }
  ```

### 3. Clear Chat History
- **URL:** `/clear-history`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "session_id": "unique-session-id"
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "message": "Chat history cleared for session."
  }
  ```

## Frontend Template

The project includes a ChatGPT-inspired HTML/CSS/JavaScript frontend for easy integration and testing of the API. Key features of the frontend include:

- Responsive design for desktop and mobile devices
- Multi-session support with the ability to create, rename, and delete chat sessions
- Real-time streaming of bot responses
- Markdown rendering for bot responses (optional, requires additional library)
- Clear chat history functionality
- Intuitive user interface with a sidebar for session management and a main chat window

The frontend is built using vanilla JavaScript and can be easily customized or integrated into existing projects.

**Screenshot:**
![image](https://github.com/user-attachments/assets/b355857e-86b4-4f53-a1d6-34497e7dfcec)


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [Groq](https://www.groq.com/) for providing the LLM API
- [Flask](https://flask.palletsprojects.com/) for the web framework
- [LlamaIndex](https://www.llamaindex.ai/) for LLM integration utilities

