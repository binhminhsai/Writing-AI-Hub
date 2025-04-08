# WritingAI Hub - How It Works

WritingAI Hub is a web application designed to help users practice IELTS Writing Task 2 by providing AI-generated resources. This document explains the technical implementation and architecture of the application.

## Architecture Overview

The application follows a client-server architecture:

1. **Frontend**: HTML, TailwindCSS, JavaScript
   - User interface for selecting task type, difficulty level, and topic
   - Rich text editor for writing essays
   - Display for AI-generated resources (prompts, outlines, vocabulary, sentence patterns)

2. **Backend**: Python with Flask framework
   - API endpoints for generating writing resources
   - Integration with OpenAI GPT for content generation
   - Handling essay submissions

## Backend Processing Flow

