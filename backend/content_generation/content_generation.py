import google.generativeai as genai
import json
import os
from pydantic import BaseModel, Field, ValidationError
from pydantic.functional_validators import field_validator
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv
import pydantic_ai

# Load environment variables from .env file
load_dotenv()
# os.environ["GEMINI_API_KEY"] = os.getenv["GEMINI_API_KEY"]

# Configure Gemini API
genai.configure(api_key="AIzaSyB3UPPzbET8P03O_O55ArY4TKIamnSr9-k")


# Define Pydantic models for structured output
class ContentSection(BaseModel):
    title: str
    content: str
    key_points: List[str] = Field(default_factory=list)

    @field_validator("key_points")  # Updated to field_validator
    def ensure_key_points(cls, v):
        if not v or len(v) < 2:
            raise ValueError("At least 2 key points are required")
        return v


class ContentResponse(BaseModel):
    topic: str
    summary: str
    sections: List[ContentSection]
    references: Optional[List[str]] = Field(default_factory=list)
    difficulty_level: str = "intermediate"

    @field_validator("difficulty_level")  # Updated to field_validator
    def validate_difficulty(cls, v):
        valid_levels = ["beginner", "intermediate", "advanced"]
        if v.lower() not in valid_levels:
            raise ValueError(f"Difficulty level must be one of {valid_levels}")
        return v.lower()


# Create a Gemini-based content generator (without using pydantic_ai.Agent)
class ContentGenerator:
    """
    A generator that creates educational content on a given topic.

    The generator uses a multi-step approach:
    1. Analyze the topic to determine appropriate content structure
    2. Generate comprehensive content in the required format
    3. Validate and refine the content
    """

    def __init__(self, topic: str, difficulty: str = "intermediate"):
        self.gemini_model = "gemini-2.0-flash"
        self.topic = topic
        self.difficulty = difficulty

    def analyze_topic(self) -> Dict[str, Any]:
        """
        Analyze the topic to determine appropriate section structure
        """
        prompt = f"""
        You are a structured data generator.
        
        Analyze the topic '{self.topic}' and determine:
        1. The appropriate difficulty level (beginner/intermediate/advanced)
        2. The logical sections that should be included
        3. Key concepts that must be covered
        
        Return your analysis as a valid JSON object with this exact structure:
        {{
        "recommended_difficulty": "beginner",  // or intermediate or advanced
        "sections": ["Introduction", "Section 1", "Section 2", "Conclusion"],
        "key_concepts": ["Concept 1", "Concept 2", "Concept 3"]
        }}
        
        IMPORTANT: Return ONLY the JSON object with no explanation, no markdown formatting, and no backticks.
        """

        model = genai.GenerativeModel(self.gemini_model)
        try:
            response = model.generate_content(prompt)
            response_text = response.text.strip()

            # Print raw response for debugging
            # print(f"Raw analyze_topic response: {response_text[:100]}...")

            # Check if response is wrapped in code block markers
            if response_text.startswith("```json"):
                response_text = response_text.split("```json", 1)[1]
            if response_text.startswith("```"):
                response_text = response_text.split("```", 1)[1]
            if response_text.endswith("```"):
                response_text = response_text.rsplit("```", 1)[0]

            # Trim whitespace
            response_text = response_text.strip()

            # Try to parse JSON
            return json.loads(response_text)
        except Exception as e:
            print(f"Error parsing analysis: {str(e)}")
            # Return default structure
            return {
                "recommended_difficulty": self.difficulty,
                "sections": [
                    "Introduction",
                    "Core Concepts",
                    "Applications",
                    "Conclusion",
                ],
                "key_concepts": [f"Important aspects of {self.topic}"],
            }

    def generate_content(self) -> ContentResponse:
        """
        Generate structured educational content based on topic analysis
        """
        try:
            # First analyze the topic
            analysis = self.analyze_topic()

            # Adjust difficulty based on analysis if needed
            if "recommended_difficulty" in analysis:
                self.difficulty = analysis.get(
                    "recommended_difficulty", self.difficulty
                )

            # Build the content generation prompt
            prompt = f"""
            You are a structured data generator.
            
            Generate comprehensive educational content about {self.topic} at a {self.difficulty} level.
            
            Structure your response as a valid JSON object with this exact format:
            {{
            "topic": "{self.topic}",
            "summary": "A concise summary of the topic",
            "sections": [
                {{
                "title": "Section title",
                "content": "Detailed section content",
                "key_points": ["Key point 1", "Key point 2", "Key point 3"]
                }}
            ],
            "references": ["Reference 1", "Reference 2"],
            "difficulty_level": "{self.difficulty}"
            }}
            
            Make sure to include these key concepts: {analysis.get('key_concepts', [])}
            
            Make sure the content is:
            1. Educational and accurate
            2. Well-structured with logical sections
            3. Includes at least 3 key points for each section
            4. Appropriate for {self.difficulty} level learners
            
            IMPORTANT: Return ONLY the JSON object with no explanation, no markdown formatting, and no backticks.
            """

            # Generate the content
            model = genai.GenerativeModel(self.gemini_model)
            response = model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0.7,
                    "top_p": 0.95,
                    "max_output_tokens": 4096,
                },
            )

            # Get the response text and clean it
            response_text = response.text.strip()

            # Print raw response for debugging
            # print(
            #     f"Raw generate_content response (first 100 chars): {response_text[:100]}..."
            # )

            # Check if response is wrapped in code block markers
            if response_text.startswith("```json"):
                response_text = response_text.split("```json", 1)[1]
            if response_text.startswith("```"):
                response_text = response_text.split("```", 1)[1]
            if response_text.endswith("```"):
                response_text = response_text.rsplit("```", 1)[0]

            # Trim whitespace
            response_text = response_text.strip()

            try:
                # Try to parse JSON
                content_json = json.loads(response_text)

                # Attempt to validate with Pydantic
                validated_content = ContentResponse(**content_json)
                return validated_content
            except json.JSONDecodeError as e:
                print(f"JSON decode error: {e}")
                print(f"Problematic text: {response_text[:200]}...")
                raise
            except ValidationError as e:
                # If validation fails, try to fix the content
                print(f"Validation error: {e}")
                return self.fix_content(content_json, str(e))
        except Exception as e:
            print(f"Error in generate_content: {e}")
            raise

    def fix_content(
        self, content_json: Dict[str, Any], error_message: str
    ) -> ContentResponse:
        """
        Fix content that failed validation
        """
        fix_prompt = f"""
        The following content has validation errors:
        
        {json.dumps(content_json, indent=2)}
        
        Error: {error_message}
        
        Please fix the content to match this schema exactly:
        
        {{
          "topic": "string",
          "summary": "string",
          "sections": [
            {{
              "title": "string",
              "content": "string",
              "key_points": ["string", "string", "string"]  // at least 2 required
            }}
          ],
          "references": ["string"],  // optional
          "difficulty_level": "beginner" or "intermediate" or "advanced"
        }}
        
        Return only the fixed JSON.
        """

        model = genai.GenerativeModel(self.gemini_model)
        response = model.generate_content(fix_prompt)
        fixed_content = json.loads(response.text)

        return ContentResponse(**fixed_content)


def generate_content_for_topic(topic, difficulty="beginner"):
    """
    Generate structured educational content based on a topic

    Args:
        topic (str): The topic to generate content for
        difficulty (str): The difficulty level (beginner/intermediate/advanced)

    Returns:
        dict: The validated content response

    Raises:
        ValueError: If content generation fails
    """
    try:
        # Create and run the generator
        generator = ContentGenerator(topic=topic, difficulty=difficulty)
        content_response = generator.generate_content()

        # Return as dictionary
        return content_response.model_dump()

    except json.JSONDecodeError:
        raise ValueError("Failed to parse model response as JSON")
    except ValidationError as e:
        raise ValueError(f"Content validation failed: {str(e)}")
    except Exception as e:
        raise ValueError(f"Content generation failed: {str(e)}")


if __name__ == "__main__":
    topic = "Python programming"  # Example topic
    difficulty = "intermediate"  # Changed from "easy" to an accepted value

    try:
        content = generate_content_for_topic(topic, difficulty)
        print(json.dumps(content, indent=2))
    except ValueError as e:
        print(f"Error: {str(e)}")
