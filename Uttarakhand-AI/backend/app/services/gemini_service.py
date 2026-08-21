"""Google Gemini AI service integration"""
import os
import json
import google.generativeai as genai
from typing import Dict, List, Optional, Any
from app.config.settings import Config
from app.utils.logger import logger

class GeminiService:
    """Service for interacting with Google Gemini API"""
    
    def __init__(self):
        """Initialize Gemini service with API key"""
        api_key = Config.GEMINI_API_KEY
        if not api_key:
            logger.warning("GEMINI_API_KEY not found in environment variables")
            raise ValueError("GEMINI_API_KEY is required")
        
        genai.configure(api_key=api_key)
        self.chat_model = genai.GenerativeModel(Config.GEMINI_MODEL)
        self.vision_model = genai.GenerativeModel(Config.GEMINI_VISION_MODEL)
        logger.info("Gemini service initialized successfully")
    
    def chat_with_context(
        self, 
        message: str, 
        language: str = 'english',
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> Dict[str, Any]:
        """
        Chat with AI guide with context awareness
        
        Args:
            message: User message
            language: Language code (english, hindi, garhwali, kumaoni)
            conversation_history: Previous conversation messages
            
        Returns:
            Response dictionary with text and metadata
        """
        try:
            # Auto-detect language if message contains Hindi/Devanagari script
            detected_language = self._detect_language(message)
            if detected_language and detected_language != 'english':
                language = detected_language
                logger.info(f"Auto-detected language: {language}")
            
            # Build system prompt based on language
            system_prompt = self._get_system_prompt(language)
            
            # Build conversation context
            prompt_parts = [system_prompt]
            
            if conversation_history:
                for msg in conversation_history[-10:]:  # Last 10 messages for context
                    role = msg.get('role', 'user')
                    content = msg.get('content', '')
                    if role == 'user':
                        prompt_parts.append(f"User: {content}")
                    else:
                        prompt_parts.append(f"Assistant: {content}")
            
            prompt_parts.append(f"User: {message}")
            prompt_parts.append("Assistant:")
            
            full_prompt = "\n".join(prompt_parts)
            
            # Generate response
            response = self.chat_model.generate_content(
                full_prompt,
                generation_config={
                    'temperature': 0.7,
                    'top_p': 0.8,
                    'top_k': 40,
                    'max_output_tokens': 1024,
                }
            )
            
            response_text = response.text.strip()
            
            return {
                'success': True,
                'message': response_text,
                'language': language
            }
            
        except Exception as e:
            logger.error(f"Error in chat_with_context: {str(e)}")
            return {
                'success': False,
                'message': f"Sorry, I encountered an error. Please try again. ({str(e)})",
                'error': str(e)
            }
    
    def analyze_image(
        self, 
        image_data: bytes, 
        language: str = 'english',
        use_enhanced_recognition: bool = True
    ) -> Dict[str, Any]:
        """
        Analyze uploaded image to identify place and provide information
        
        Args:
            image_data: Image file bytes
            language: Language for response
            use_enhanced_recognition: Use multi-pass recognition for better accuracy
            
        Returns:
            Dictionary with place information
        """
        try:
            from PIL import Image
            import io
            
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_data))
            
            # Enhance image quality for better recognition
            image = self._enhance_image_for_recognition(image)
            
            if use_enhanced_recognition:
                # Multi-pass recognition for better accuracy
                result = self._multi_pass_recognition(image, language)
            else:
                # Single pass recognition
                result = self._single_pass_recognition(image, language)
            
            return result
            
        except Exception as e:
            logger.error(f"Error in analyze_image: {str(e)}")
            return {
                'success': False,
                'identified': False,
                'error': str(e),
                'message': 'Failed to analyze image. Please try again.'
            }
    
    def _enhance_image_for_recognition(self, image):
        """Enhance image quality for better recognition"""
        from PIL import ImageEnhance
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize if too large (max 2048px on longest side)
        max_size = 2048
        if max(image.size) > max_size:
            ratio = max_size / max(image.size)
            new_size = tuple(int(dim * ratio) for dim in image.size)
            image = image.resize(new_size, Image.Resampling.LANCZOS)
        
        # Enhance contrast slightly for better feature detection
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(1.2)
        
        # Enhance sharpness
        enhancer = ImageEnhance.Sharpness(image)
        image = enhancer.enhance(1.3)
        
        return image
    
    def _multi_pass_recognition(self, image, language: str) -> Dict[str, Any]:
        """
        Multi-pass recognition for higher accuracy
        Uses multiple prompts and combines results
        """
        # Pass 1: Detailed place identification
        prompt1 = self._get_vision_prompt_detailed(language)
        response1 = self.vision_model.generate_content(
            [prompt1, image],
            generation_config={
                'temperature': 0.2,  # Lower temperature for more accurate identification
                'top_p': 0.7,
                'top_k': 30,
                'max_output_tokens': 2048,
            }
        )
        
        # Pass 2: Landmark and feature detection
        prompt2 = self._get_vision_prompt_landmarks(language)
        response2 = self.vision_model.generate_content(
            [prompt2, image],
            generation_config={
                'temperature': 0.3,
                'top_p': 0.8,
                'top_k': 40,
                'max_output_tokens': 1024,
            }
        )
        
        # Combine and parse results
        result = self._combine_recognition_results(
            response1.text.strip(),
            response2.text.strip(),
            language
        )
        
        return result
    
    def _single_pass_recognition(self, image, language: str) -> Dict[str, Any]:
        """Single pass recognition (faster but less accurate)"""
        prompt = self._get_vision_prompt(language)
        
        response = self.vision_model.generate_content(
            [prompt, image],
            generation_config={
                'temperature': 0.4,
                'top_p': 0.8,
                'top_k': 40,
                'max_output_tokens': 2048,
            }
        )
        
        response_text = response.text.strip()
        
        # Try to parse JSON response
        try:
            if '{' in response_text:
                start = response_text.find('{')
                end = response_text.rfind('}') + 1
                json_str = response_text[start:end]
                json_match = json.loads(json_str)
                
                if json_match:
                    return {
                        'success': True,
                        'identified': True,
                        'confidence': 'medium',
                        'data': json_match,
                        'raw_response': response_text
                    }
        except json.JSONDecodeError:
            pass
        
        # If JSON parsing failed, return structured response
        return {
            'success': True,
            'identified': False,
            'confidence': 'low',
            'data': {
                'name': 'Unknown Place',
                'description': response_text,
                'history': 'Information not available',
                'best_time_to_visit': 'Year-round',
                'nearby_places': [],
                'dos_and_donts': [],
                'crowd_level': 'Unknown'
            },
            'raw_response': response_text
        }
    
    def _combine_recognition_results(
        self, 
        response1: str, 
        response2: str,
        language: str
    ) -> Dict[str, Any]:
        """Combine results from multiple recognition passes"""
        from app.services.place_matcher import get_place_matcher
        
        # Parse first response (detailed identification)
        data1 = None
        try:
            if '{' in response1:
                start = response1.find('{')
                end = response1.rfind('}') + 1
                json_str = response1[start:end]
                data1 = json.loads(json_str)
        except json.JSONDecodeError:
            pass
        
        # Parse second response (landmarks)
        landmarks = []
        visible_text = []
        try:
            if '{' in response2:
                start = response2.find('{')
                end = response2.rfind('}') + 1
                json_str = response2[start:end]
                data2 = json.loads(json_str)
                landmarks = data2.get('landmarks', [])
                visible_text = data2.get('visible_text', [])
        except json.JSONDecodeError:
            pass
        
        # Combine results
        if data1:
            # Try to match with known places database
            place_matcher = get_place_matcher()
            recognized_name = data1.get('name', '')
            description = data1.get('description', '')
            keywords = data1.get('famous_for', []) + [lm.get('name', '') for lm in landmarks]
            
            matched_place = place_matcher.match_place(
                recognized_name,
                description,
                keywords
            )
            
            # If matched, enrich data with database information
            if matched_place:
                data1['matched_database'] = True
                data1['verified_name'] = matched_place['name']
                data1['verified_district'] = matched_place['district']
                data1['place_type'] = matched_place['type']
                if matched_place.get('altitude'):
                    data1['altitude'] = f"{matched_place['altitude']} meters"
                
                # Boost confidence if database matched
                original_confidence = data1.get('identification_confidence', 'medium')
                if original_confidence == 'medium':
                    data1['identification_confidence'] = 'high'
                elif original_confidence == 'low':
                    data1['identification_confidence'] = 'medium'
            else:
                data1['matched_database'] = False
            
            # Add landmark information
            if landmarks:
                data1['landmarks'] = landmarks
            
            # Add visible text
            if visible_text:
                data1['visible_text'] = visible_text
            
            # Calculate confidence based on data completeness
            confidence = self._calculate_confidence(data1)
            
            return {
                'success': True,
                'identified': True,
                'confidence': confidence,
                'data': data1,
                'raw_response': response1,
                'landmarks_detected': len(landmarks),
                'database_matched': matched_place is not None
            }
        
        # Fallback if parsing failed
        return {
            'success': True,
            'identified': False,
            'confidence': 'low',
            'data': {
                'name': 'Unknown Place',
                'description': response1,
                'history': 'Information not available',
                'best_time_to_visit': 'Year-round',
                'nearby_places': [],
                'dos_and_donts': [],
                'crowd_level': 'Unknown'
            },
            'raw_response': response1,
            'database_matched': False
        }
    
    def _calculate_confidence(self, data: Dict[str, Any]) -> str:
        """Calculate confidence level based on data completeness"""
        score = 0
        
        # Check for key fields
        if data.get('name') and data['name'] != 'Unknown Place':
            score += 30
        if data.get('location') or data.get('district'):
            score += 20
        if data.get('description') and len(data['description']) > 50:
            score += 15
        if data.get('history') and data['history'] != 'Information not available':
            score += 15
        if data.get('nearby_places') and len(data['nearby_places']) > 0:
            score += 10
        if data.get('landmarks') and len(data['landmarks']) > 0:
            score += 10
        
        if score >= 70:
            return 'high'
        elif score >= 40:
            return 'medium'
        else:
            return 'low'
    
    def analyze_image_base64(
        self, 
        base64_data: str, 
        language: str = 'english'
    ) -> Dict[str, Any]:
        """
        Analyze image from base64 string
        
        Args:
            base64_data: Base64 encoded image string
            language: Language for response
            
        Returns:
            Dictionary with place information
        """
        try:
            import base64
            import io
            from PIL import Image
            
            # Decode base64
            image_bytes = base64.b64decode(base64_data.split(',')[-1])
            return self.analyze_image(image_bytes, language)
            
        except Exception as e:
            logger.error(f"Error in analyze_image_base64: {str(e)}")
            return {
                'success': False,
                'identified': False,
                'error': str(e),
                'message': 'Failed to decode or analyze image.'
            }
    
    def generate_itinerary(
        self, 
        preferences: Dict[str, Any],
        language: str = 'english'
    ) -> Dict[str, Any]:
        """
        Generate AI-powered itinerary based on preferences
        
        Args:
            preferences: User preferences (duration, budget, interests, etc.)
            language: Language for response
            
        Returns:
            Complete itinerary dictionary
        """
        try:
            prompt = self._get_itinerary_prompt(preferences, language)
            
            response = self.chat_model.generate_content(
                prompt,
                generation_config={
                    'temperature': 0.8,
                    'top_p': 0.9,
                    'top_k': 40,
                    'max_output_tokens': 4096,
                }
            )
            
            response_text = response.text.strip()
            
            # Try to parse JSON response
            try:
                if '{' in response_text:
                    start = response_text.find('{')
                    end = response_text.rfind('}') + 1
                    json_str = response_text[start:end]
                    itinerary_data = json.loads(json_str)
                    
                    return {
                        'success': True,
                        'itinerary': itinerary_data,
                        'raw_response': response_text
                    }
            except json.JSONDecodeError:
                pass
            
            # If JSON parsing failed, return structured response
            return {
                'success': True,
                'itinerary': {
                    'duration': preferences.get('duration', 3),
                    'budget': preferences.get('budget', 0),
                    'days': self._parse_itinerary_text(response_text, preferences.get('duration', 3))
                },
                'raw_response': response_text
            }
            
        except Exception as e:
            logger.error(f"Error in generate_itinerary: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to generate itinerary. Please try again.'
            }
    
    def get_emergency_advice(
        self, 
        situation: str, 
        location: Optional[str] = None,
        language: str = 'english'
    ) -> Dict[str, Any]:
        """
        Get emergency advice using AI
        
        Args:
            situation: Emergency situation description
            location: Current location (optional)
            language: Language for response
            
        Returns:
            Emergency advice dictionary
        """
        try:
            prompt = self._get_emergency_prompt(situation, location, language)
            
            response = self.chat_model.generate_content(
                prompt,
                generation_config={
                    'temperature': 0.3,
                    'top_p': 0.8,
                    'top_k': 40,
                    'max_output_tokens': 1024,
                }
            )
            
            return {
                'success': True,
                'advice': response.text.strip(),
                'language': language
            }
            
        except Exception as e:
            logger.error(f"Error in get_emergency_advice: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to get emergency advice.'
            }
    
    def _detect_language(self, text: str) -> Optional[str]:
        """
        Detect language from text based on script
        
        Args:
            text: Input text
            
        Returns:
            Detected language code or None
        """
        # Check if text contains Devanagari script (Hindi/Garhwali/Kumaoni)
        devanagari_chars = sum(1 for char in text if '\u0900' <= char <= '\u097F')
        total_chars = len([c for c in text if c.isalpha()])
        
        if total_chars > 0 and devanagari_chars / total_chars > 0.3:
            # Text is in Devanagari script, default to Hindi
            return 'hindi'
        
        return None
    
    def _get_system_prompt(self, language: str) -> str:
        """Get system prompt based on language"""
        prompts = {
            'english': """You are a friendly and knowledgeable AI tourism guide for Uttarakhand, India. 
You help tourists with information about places, culture, food, activities, and travel tips.
Be concise, helpful, and enthusiastic. Always provide accurate information about Uttarakhand tourism.

IMPORTANT: Always respond in ENGLISH language only. If the user asks in any other language, still respond in English.""",
            
            'hindi': """आप उत्तराखंड, भारत के लिए एक मित्रतापूर्ण और जानकार AI पर्यटन गाइड हैं।
आप पर्यटकों को स्थानों, संस्कृति, भोजन, गतिविधियों और यात्रा युक्तियों के बारे में जानकारी में मदद करते हैं।
संक्षिप्त, सहायक और उत्साही रहें। उत्तराखंड पर्यटन के बारे में हमेशा सटीक जानकारी प्रदान करें।

महत्वपूर्ण: हमेशा केवल हिंदी भाषा में ही जवाब दें। चाहे उपयोगकर्ता किसी भी भाषा में पूछे, आपको हिंदी में ही उत्तर देना है। अंग्रेजी में बिल्कुल नहीं।""",
            
            'garhwali': """तुम उत्तराखंड, भारत का एक मित्रतापूर्ण और जानकार AI पर्यटन गाइड हो।
तुम पर्यटकों कु स्थान, संस्कृति, खाना, गतिविधि, और यात्रा युक्ति बारे जानकारी मदद करदा।
संक्षिप्त, सहायक और उत्साही रहो। उत्तराखंड पर्यटन बारे हमेशा सटीक जानकारी दी।

अति महत्वपूर्ण निर्देश: 
- तुम कु हमेशा गढ़वाली-हिंदी मिश्रित भाषा में ही जवाब देणा है
- अंग्रेजी में बिल्कुल नहीं लिखणा
- देवनागरी लिपि में ही लिखणा
- गढ़वाली शब्द जैसे "कु" (को), "बारे" (के बारे में), "देणा" (देना) का प्रयोग करणा
- उदाहरण: "नैनीताल एक सुंदर झील वाला शहर है। यहाँ कु घूमण खातिर सबसे बढ़िया समय मार्च से जून तक है।"

याद रखो: केवल हिंदी/गढ़वाली में जवाब दो, अंग्रेजी में नहीं!""",
            
            'kumaoni': """तुम उत्तराखंड, भारत का एक मित्रतापूर्ण और जानकार AI पर्यटन गाइड हो।
तुम पर्यटकों कु स्थान, संस्कृति, खाना, गतिविधि, और यात्रा युक्ति बारे जानकारी मदद करदा।
संक्षिप्त, सहायक और उत्साही रहो। उत्तराखंड पर्यटन बारे हमेशा सटीक जानकारी दी।

अति महत्वपूर्ण निर्देश:
- तुम कु हमेशा कुमाऊँनी-हिंदी मिश्रित भाषा में ही जवाब देणा है
- अंग्रेजी में बिल्कुल नहीं लिखणा
- देवनागरी लिपि में ही लिखणा
- कुमाऊँनी शब्द जैसे "कु" (को), "बारे" (के बारे में), "देणा" (देना), "छु" (है) का प्रयोग करणा
- उदाहरण: "नैनीताल एक सुंदर झील वाला शहर छु। यहाँ कु घूमण खातिर सबसे बढ़िया समय मार्च से जून तक छु।"

याद रखो: केवल हिंदी/कुमाऊँनी में जवाब दो, अंग्रेजी में नहीं!"""
        }
        return prompts.get(language.lower(), prompts['english'])
    
    def _get_vision_prompt(self, language: str) -> str:
        """Get vision analysis prompt"""
        base_prompt = """Analyze this image of a place in Uttarakhand, India. Provide information in JSON format with the following structure:
{
  "name": "Place name",
  "description": "Brief description",
  "history": "Historical background",
  "best_time_to_visit": "Best time to visit",
  "nearby_places": ["Place 1", "Place 2"],
  "dos_and_donts": ["Do 1", "Don't 1"],
  "crowd_level": "Low/Medium/High"
}

If you cannot identify the place, provide estimated information based on what you see."""
        
        if language != 'english':
            return f"{base_prompt}\n\nRespond in {language} language."
        return base_prompt
    
    def _get_vision_prompt_detailed(self, language: str) -> str:
        """Get detailed vision analysis prompt for better accuracy"""
        base_prompt = """You are an expert on Uttarakhand tourism and geography. Analyze this image carefully and identify the place.

IMPORTANT INSTRUCTIONS:
1. Look for distinctive features: temples, mountains, rivers, lakes, architecture, signs, landmarks
2. Consider the geographical features specific to Uttarakhand (Himalayas, valleys, rivers)
3. Identify any visible text, signs, or markers in the image
4. Match architectural styles with known Uttarakhand temples and buildings
5. Consider the vegetation, climate indicators, and landscape

UTTARAKHAND CONTEXT:
- Famous temples: Kedarnath, Badrinath, Gangotri, Yamunotri, Tungnath, Jageshwar
- Hill stations: Nainital, Mussoorie, Ranikhet, Almora, Kausani
- Rivers: Ganges, Yamuna, Alaknanda, Bhagirathi, Mandakini
- Districts: Dehradun, Haridwar, Rishikesh, Pauri, Chamoli, Uttarkashi, Pithoragarh

Provide detailed information in JSON format:
{
  "name": "Exact place name",
  "location": "City/Town, District",
  "district": "District name",
  "description": "Detailed description (100+ words)",
  "history": "Historical background and significance",
  "altitude": "Altitude in meters (if applicable)",
  "best_time_to_visit": "Best months to visit",
  "how_to_reach": "Transportation details",
  "nearby_places": ["Place 1 (distance)", "Place 2 (distance)"],
  "activities": ["Activity 1", "Activity 2"],
  "dos_and_donts": ["Do: ...", "Don't: ..."],
  "crowd_level": "Low/Medium/High",
  "entry_fee": "Fee details if applicable",
  "timings": "Opening hours if applicable",
  "famous_for": ["Feature 1", "Feature 2"],
  "identification_confidence": "high/medium/low"
}

If you cannot identify with certainty, set identification_confidence to "low" and provide your best estimate."""
        
        if language != 'english':
            return f"{base_prompt}\n\nRespond in {language} language."
        return base_prompt
    
    def _get_vision_prompt_landmarks(self, language: str) -> str:
        """Get landmark detection prompt"""
        base_prompt = """Analyze this image and identify specific landmarks, architectural features, or distinctive elements.

Focus on:
1. Temples, shrines, or religious structures
2. Mountains, peaks, or geographical features
3. Rivers, lakes, or water bodies
4. Unique architectural elements
5. Signs, boards, or text visible in the image
6. Natural landmarks (rocks, trees, formations)

Provide a JSON response:
{
  "landmarks": [
    {
      "type": "temple/mountain/river/etc",
      "name": "Landmark name if identifiable",
      "description": "What you see",
      "confidence": "high/medium/low"
    }
  ],
  "visible_text": ["Any text visible in image"],
  "architectural_style": "Description of architecture",
  "natural_features": ["Feature 1", "Feature 2"]
}"""
        
        if language != 'english':
            return f"{base_prompt}\n\nRespond in {language} language."
        return base_prompt
    
    def _get_itinerary_prompt(self, preferences: Dict[str, Any], language: str) -> str:
        """Get itinerary generation prompt"""
        duration = preferences.get('duration', 3)
        budget = preferences.get('budget', 0)
        interests = ', '.join(preferences.get('interests', []))
        start_location = preferences.get('start_location', 'Dehradun')
        travel_style = preferences.get('travel_style', 'moderate')
        
        prompt = f"""Generate a detailed {duration}-day itinerary for Uttarakhand tourism with the following preferences:
- Duration: {duration} days
- Budget: ₹{budget}
- Interests: {interests}
- Start Location: {start_location}
- Travel Style: {travel_style}

IMPORTANT BUDGET GUIDELINES:
- Calculate realistic costs for each activity, meal, and accommodation
- Ensure the total cost stays within the budget of ₹{budget}
- Typical daily costs in Uttarakhand:
  * Budget accommodation: ₹800-1500 per night
  * Mid-range accommodation: ₹1500-3000 per night
  * Meals: ₹150-300 per meal (breakfast/lunch/dinner)
  * Local transport: ₹300-800 per day
  * Entry fees: ₹50-500 per place
  * Activities: ₹500-2000 per activity
- Distribute the budget wisely across all {duration} days
- Include a daily cost breakdown that adds up correctly

Provide a JSON response with this structure:
{{
  "duration": {duration},
  "budget": {budget},
  "total_estimated_cost": 0,
  "days": [
    {{
      "day": 1,
      "date": "Day 1",
      "places": [
        {{
          "name": "Place name",
          "time": "9:00 AM - 12:00 PM",
          "description": "What to do",
          "cost": 500
        }}
      ],
      "accommodation": {{
        "name": "Hotel name",
        "cost": 2000
      }},
      "meals": {{
        "breakfast": 200,
        "lunch": 300,
        "dinner": 400
      }},
      "transport": {{
        "description": "Local transport",
        "cost": 500
      }},
      "total_cost": 3900
    }}
  ],
  "packing_list": ["Item 1", "Item 2"],
  "travel_tips": ["Tip 1", "Tip 2"],
  "budget_breakdown": {{
    "accommodation": 0,
    "meals": 0,
    "transport": 0,
    "activities": 0,
    "miscellaneous": 0
  }}
}}

Make sure all costs are realistic and the sum of daily costs equals total_estimated_cost."""
        
        if language != 'english':
            prompt += f"\n\nRespond in {language} language."
        
        return prompt
    
    def _get_emergency_prompt(self, situation: str, location: Optional[str], language: str) -> str:
        """Get emergency advice prompt"""
        prompt = f"""Provide emergency advice for this situation in Uttarakhand: {situation}"""
        if location:
            prompt += f"\nLocation: {location}"
        prompt += "\n\nInclude: immediate actions, emergency contacts, nearest help points, and safety tips."
        
        if language != 'english':
            prompt += f"\n\nRespond in {language} language."
        
        return prompt
    
    def _parse_itinerary_text(self, text: str, duration: int) -> List[Dict[str, Any]]:
        """Parse itinerary from text if JSON parsing fails"""
        days = []
        for i in range(1, duration + 1):
            days.append({
                'day': i,
                'date': f'Day {i}',
                'places': [{'name': 'To be determined', 'time': 'TBD', 'description': 'Details will be provided', 'cost': 0}],
                'accommodation': {'name': 'TBD', 'cost': 0},
                'meals': {'breakfast': 0, 'lunch': 0, 'dinner': 0},
                'total_cost': 0
            })
        return days

# Singleton instance
_gemini_service: Optional[GeminiService] = None

def get_gemini_service() -> GeminiService:
    """Get or create Gemini service instance"""
    global _gemini_service
    if _gemini_service is None:
        _gemini_service = GeminiService()
    return _gemini_service

