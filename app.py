import os
from dotenv import load_dotenv
import logging
from flask import Flask, render_template, request, jsonify
from services.openai_helper import generate_writing_resources, generate_random_topic
from services.openai_grading import grade_essay

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.getenv("SESSION_SECRET")

@app.route('/')
def index():
    """
    Render the main page of the WritingAI Hub application.
    """
    return render_template('index.html')

@app.route('/grading')
def grading():
    """
    Render the grading page of the WritingAI Hub application.
    """
    return render_template('grading.html')

@app.route('/api/generate', methods=['POST'])
def generate():
    """
    API endpoint to generate writing resources based on the selected topic, level, and task.
    
    Expected JSON input:
    {
        "topic": "string",
        "level": "string",
        "task": "string"
    }
    
    Returns:
    {
        "prompt": "string",
        "outline": "string",
        "vocabList": "string",
        "sentencePatterns": "string"
    }
    """
    try:
        data = request.json
        topic = data.get('topic', '')
        level = data.get('level', '')
        task = data.get('task', '')
        
        # Add cache to make generation faster (future enhancement)
        
        # Generate resources using OpenAI
        result = generate_writing_resources(topic, level, task)
        
        return jsonify(result)
    except Exception as e:
        app.logger.error(f"Error generating resources: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/submit', methods=['POST'])
def submit():
    """
    API endpoint to submit the essay.
    
    Expected JSON input:
    {
        "essay": "string",
        "metadata": {
            "topic": "string",
            "level": "string",
            "task": "string",
            "timeSpent": "string"
        }
    }
    
    Returns:
    {
        "status": "submitted"
    }
    """
    try:
        data = request.json
        essay = data.get('essay', '')
        metadata = data.get('metadata', {})
        
        # Log the submission (in a real app, you would save to a database)
        app.logger.info(f"Essay submitted: {len(essay)} characters, metadata: {metadata}")
        
        return jsonify({"status": "submitted"})
    except Exception as e:
        app.logger.error(f"Error submitting essay: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/random_topic', methods=['POST'])
def random_topic():
    """
    API endpoint to generate a random topic for a writing task.
    
    Expected JSON input:
    {
        "level": "string",
        "task": "string"
    }
    
    Returns:
    {
        "topic": "string"
    }
    """
    try:
        data = request.json
        level = data.get('level', 'Band 6.5')
        task = data.get('task', 'IELTS Task 2')
        
        # Generate a random topic
        topic = generate_random_topic(level, task)
        
        return jsonify({"topic": topic})
    except Exception as e:
        app.logger.error(f"Error generating random topic: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/grade', methods=['POST'])
def grade():
    """
    API endpoint to grade an essay using AI.
    
    Expected JSON input:
    {
        "essay": "string",
        "question": "string",
        "level": "string"
    }
    
    Returns:
    {
        "highlightedEssay": "string",
        "grammarFeedback": ["string"],
        "lexicalFeedback": ["string"],
        "taskFeedback": ["string"],
        "coherenceFeedback": ["string"],
        "scores": {
            "grammar": float,
            "lexical": float,
            "task": float,
            "coherence": float,
            "overall": float
        },
        "vocabSuggestions": ["string"],
        "templateSuggestions": ["string"]
    }
    """
    try:
        data = request.json
        essay = data.get('essay', '')
        question = data.get('question', '')
        level = data.get('level', 'Band 6.5')
        
        # Validate input
        if not essay:
            return jsonify({"error": "Essay text is required"}), 400
        
        # Grade the essay using OpenAI
        result = grade_essay(essay, question, level)
        
        return jsonify(result)
    except Exception as e:
        app.logger.error(f"Error grading essay: {str(e)}")
        return jsonify({"error": str(e)}), 500
