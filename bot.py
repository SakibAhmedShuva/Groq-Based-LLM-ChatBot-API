import os
import logging
import threading
from flask import Flask, request, jsonify
from flask_cors import CORS
from llama_index.llms.groq import Groq
from llama_index.core.llms import ChatMessage
from uuid import uuid4

# Set up logging
logging.basicConfig(level=logging.INFO)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize the LLM with the model and API key
api_key = "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"
llm = Groq(model="llama3-70b-8192", api_key=api_key)

# Thread-safe storage for user histories, now with session-based history
session_histories = {}
history_lock = threading.Lock()

# Helper function to initialize conversation history for a session
def initialize_history(session_id):
    with history_lock:
        if session_id not in session_histories:
            session_histories[session_id] = {'history': []}

# API route for streaming chat with user-defined sessions
@app.route('/stream-chat', methods=['POST'])
def stream_chat():
    try:
        # Get session ID and messages from the request
        user_input = request.json.get('messages', [])
        session_id = request.json.get('session_id')
        if not session_id:
            return jsonify({'status': 'error', 'message': 'session_id is required'}), 400

        logging.info(f"Incoming messages for session {session_id}: {user_input}")

        # Ensure conversation history is initialized for the session
        initialize_history(session_id)

        # Build the list of messages from session history
        with history_lock:
            messages = [ChatMessage(role=msg['role'], content=msg['content']) for msg in session_histories[session_id]['history']]

        # Add the new user messages to the conversation
        for msg in user_input:
            messages.append(ChatMessage(role=msg['role'], content=msg['content']))
            with history_lock:
                session_histories[session_id]['history'].append(msg)

        # Stream response from the LLM
        stream_resp = llm.stream_chat(messages)
        stream_output = ''.join([r.delta for r in stream_resp])

        # Append the assistant's response to the session's history
        assistant_msg = {"role": "assistant", "content": stream_output}
        with history_lock:
            session_histories[session_id]['history'].append(assistant_msg)

        logging.info(f"LLM stream response for session {session_id}: {stream_output}")
        # Return the response as JSON, including the updated history
        return jsonify({'status': 'success', 'response': stream_output, 'history': session_histories[session_id]['history']}), 200
    except Exception as e:
        logging.error(f"Error in /stream-chat: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

# API route to create a new chat session (with a unique session ID)
@app.route('/create-session', methods=['POST'])
def create_session():
    try:
        # Generate a unique session ID (UUID)
        session_id = str(uuid4())
        initialize_history(session_id)
        logging.info(f"New session created with session_id: {session_id}")
        return jsonify({'status': 'success', 'session_id': session_id}), 200
    except Exception as e:
        logging.error(f"Error in /create-session: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

# API route to clear the session history for a specific session
@app.route('/clear-history', methods=['POST'])
def clear_history():
    session_id = request.json.get('session_id')
    if not session_id:
        return jsonify({'status': 'error', 'message': 'session_id is required'}), 400

    with history_lock:
        if session_id in session_histories:
            session_histories[session_id]['history'] = []  # Clear the session history

    return jsonify({'status': 'success', 'message': 'Chat history cleared for session.'})

if __name__ == '__main__':
    # Use this only for development; use Gunicorn or uWSGI in production
    app.run(debug=True, host='0.0.0.0', port=5000)
