"""Translation service using Google Gemini API"""
from typing import Dict, Optional, Any
from app.services.gemini_service import get_gemini_service
from app.utils.logger import logger

class TranslationService:
    """Service for translating text between languages"""
    
    def __init__(self):
        """Initialize translation service"""
        self.gemini_service = get_gemini_service()
        self.supported_languages = {
            'english': 'English',
            'hindi': 'Hindi',
            'garhwali': 'Garhwali',
            'kumaoni': 'Kumaoni'
        }
    
    def translate(
        self, 
        text: str, 
        source_language: str = 'english',
        target_language: str = 'hindi'
    ) -> Dict[str, Any]:
        """
        Translate text from source to target language
        
        Args:
            text: Text to translate
            source_language: Source language code
            target_language: Target language code
            
        Returns:
            Translation result dictionary
        """
        try:
            if source_language.lower() == target_language.lower():
                return {
                    'success': True,
                    'original_text': text,
                    'translated_text': text,
                    'source_language': source_language,
                    'target_language': target_language
                }
            
            # Use Gemini for translation
            prompt = f"""Translate the following text from {self.supported_languages.get(source_language, source_language)} to {self.supported_languages.get(target_language, target_language)}.
            
Text: {text}

Provide only the translated text, nothing else."""
            
            response = self.gemini_service.chat_model.generate_content(prompt)
            translated_text = response.text.strip()
            
            return {
                'success': True,
                'original_text': text,
                'translated_text': translated_text,
                'source_language': source_language,
                'target_language': target_language
            }
            
        except Exception as e:
            logger.error(f"Error in translate: {str(e)}")
            return {
                'success': False,
                'original_text': text,
                'translated_text': text,
                'error': str(e),
                'message': 'Translation failed. Original text returned.'
            }
    
    def detect_language(self, text: str) -> Dict[str, Any]:
        """
        Detect language of given text
        
        Args:
            text: Text to analyze
            
        Returns:
            Language detection result
        """
        try:
            prompt = f"""Detect the language of this text and respond with only the language name (english, hindi, garhwali, or kumaoni):
            
{text}"""
            
            response = self.gemini_service.chat_model.generate_content(prompt)
            detected = response.text.strip().lower()
            
            # Validate detected language
            if detected not in self.supported_languages:
                detected = 'english'  # Default fallback
            
            return {
                'success': True,
                'language': detected,
                'confidence': 'medium'
            }
            
        except Exception as e:
            logger.error(f"Error in detect_language: {str(e)}")
            return {
                'success': False,
                'language': 'english',
                'error': str(e)
            }

# Singleton instance
_translation_service: Optional[TranslationService] = None

def get_translation_service() -> TranslationService:
    """Get or create translation service instance"""
    global _translation_service
    if _translation_service is None:
        _translation_service = TranslationService()
    return _translation_service

