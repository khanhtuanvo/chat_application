import openai
from typing import List, Dict, Any
from openai.types.chat import ChatCompletionMessageParam
from ..config import settings
from fastapi.responses import StreamingResponse, PlainTextResponse, Response

class OpenAIService:
    def __init__(self):
        # Initialize OpenAI client with proper error handling
        try:
            self.client = openai.OpenAI(api_key=settings.openai_api_key)
        except Exception as e:
            print(f"Warning: OpenAI client initialization failed: {e}")
            self.client = None
    
    def get_chat_response(
        self, 
        messages: List[ChatCompletionMessageParam], 
        model: str = "gpt-4o-mini"
    ) -> Response:
        """
        Get AI response from OpenAI API
        
        Args:
            messages: List of message dictionaries with 'role' and 'content'
            model: OpenAI model to use
            
        Returns:
            AI response content as string
        """
        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=1000,
                temperature=0.7,
                stream=True
            )
            
            def event_generator():
                for chunk in response:
                    content = chunk.choices[0].delta.content or ""
                    yield f"data: {content}\n\n"
            return StreamingResponse(event_generator(), media_type="text/event-stream")

            
        except Exception as e:
            return PlainTextResponse("Sorry, I'm having trouble responding right now.",status_code=500)
    
    def should_generate_title(
        self,
        conversation_messages: List[Dict[str, Any]]
    ) -> bool:
        """
        Check if conversation has meaningful content for title generation
        """
        
        print(f"DEBUG: should_generate_title called with {len(conversation_messages)} messages")
        
        if len(conversation_messages) < 2:
            print(f"DEBUG: Not enough messages ({len(conversation_messages)} < 2)")
            return False
        
        # Simple greetings to ignore
        greetings = [
            "hello", "hi", "hey", "good morning", "good afternoon", 
            "good evening", "howdy", "greetings", "sup", "what's up",
            "yo", "hi there", "hello there", "hey there"
        ]
        
        # Check all user messages for meaningful content
        user_messages = [msg for msg in conversation_messages if msg["role"] == "user"]
        print(f"DEBUG: Found {len(user_messages)} user messages")
        
        for i, message in enumerate(user_messages):
            user_content = message["content"].lower().strip()
            print(f"DEBUG: Checking user message {i+1}: '{user_content[:50]}...'")
            
            # Skip if it's just a greeting
            is_greeting = False
            for greeting in greetings:
                if user_content.startswith(greeting) and len(user_content) < 30:
                    is_greeting = True
                    print(f"DEBUG: Message is a greeting, skipping")
                    break
            
            if is_greeting:
                continue
            
            # Check if message has substantial content
            if len(user_content) >= 10:
                print(f"DEBUG: Message has substantial content ({len(user_content)} chars), should generate title")
                return True
            else:
                print(f"DEBUG: Message too short ({len(user_content)} chars), continuing...")
        
        print(f"DEBUG: No substantial content found, should NOT generate title")
        return False

    def generate_conversation_title(
        self,
        conversation_messages: List[Dict[str, Any]],
        model: str = "gpt-4o-mini"
    ):
        try:
            prompt = """You are a helpful assistant that generates concise, descriptive titles for conversations. 
            The title should be:
            - 3-8 words maximum
            - Descriptive of the main topic or theme
            - Professional and clear
            - NO quotes, NO special formatting, NO punctuation marks
            - Just plain text words
            
            Generate only the title, nothing else. Do not include quotes, colons, or any special characters."""

            conversation_text = ""
            for message in conversation_messages:
                if message["role"] == "user":
                    conversation_text += f"User: {message['content']}\n"
                elif message["role"] == "assistant":
                    conversation_text += f"Assistant: {message['content']}\n"
            if len(conversation_text) > 1000:
                conversation_text = conversation_text[:1000] + "..."
            
            messages: List[ChatCompletionMessageParam] = [
                {"role": "system", "content": prompt},
                {"role": "user", "content": f"Generate a title for this conversation:\n\n{conversation_text}"}
            ]

            response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                max_tokens=50,
                temperature=0.3,
            )

            title = response.choices[0].message.content
            if title:
                title = title.strip()
                # Remove all types of quotes and formatting
                title = title.strip('"').strip("'").strip('"').strip('"').strip('"').strip('"')
                # Remove any remaining quotes from the beginning or end
                while title.startswith(('"', "'", '"', '"', '"', '"')):
                    title = title[1:]
                while title.endswith(('"', "'", '"', '"', '"', '"')):
                    title = title[:-1]
                # Remove any "Title:" or similar prefixes
                if ':' in title:
                    title = title.split(':', 1)[-1].strip()
                # Apply title case and clean up
                title = title.title()
                # Remove any extra whitespace
                title = ' '.join(title.split())
            else:
                title = "New Conversation"
            return title or "New Conversation"
        except Exception as e:
            return "New Conversation"

    def format_conversation_history(
        self, 
        conversation_messages: List[Dict[str, Any]]
    ) -> List[ChatCompletionMessageParam]:
        """
        Format conversation history for OpenAI API
        
        Args:
            conversation_messages: List of message objects from database
            
        Returns:
            Formatted messages for OpenAI API
        """
        formatted_messages = []
        
        for message in conversation_messages:
            formatted_messages.append({
                "role": message["role"],
                "content": message["content"]
            })
        
        return formatted_messages

# Create service instance
openai_service = OpenAIService()