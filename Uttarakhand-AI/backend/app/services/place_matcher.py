"""Place matching service for improved recognition accuracy"""
from typing import Dict, List, Optional, Any
from difflib import SequenceMatcher
from app.utils.logger import logger

class PlaceMatcher:
    """Service to match recognized places with known Uttarakhand destinations"""
    
    # Comprehensive database of Uttarakhand places
    KNOWN_PLACES = {
        # Char Dham
        'kedarnath': {
            'name': 'Kedarnath',
            'aliases': ['kedar', 'kedarnath temple', 'kedar dham'],
            'district': 'Rudraprayag',
            'type': 'temple',
            'altitude': 3583,
            'keywords': ['shiva', 'temple', 'snow', 'mountain', 'mandakini']
        },
        'badrinath': {
            'name': 'Badrinath',
            'aliases': ['badri', 'badrinath temple', 'badri dham'],
            'district': 'Chamoli',
            'type': 'temple',
            'altitude': 3300,
            'keywords': ['vishnu', 'temple', 'alaknanda', 'neelkanth peak']
        },
        'gangotri': {
            'name': 'Gangotri',
            'aliases': ['gangotri temple', 'gangotri dham'],
            'district': 'Uttarkashi',
            'type': 'temple',
            'altitude': 3100,
            'keywords': ['ganga', 'bhagirathi', 'temple', 'glacier']
        },
        'yamunotri': {
            'name': 'Yamunotri',
            'aliases': ['yamunotri temple', 'yamunotri dham'],
            'district': 'Uttarkashi',
            'type': 'temple',
            'altitude': 3293,
            'keywords': ['yamuna', 'temple', 'hot spring', 'divya shila']
        },
        
        # Hill Stations
        'nainital': {
            'name': 'Nainital',
            'aliases': ['naini lake', 'nainital lake'],
            'district': 'Nainital',
            'type': 'hill_station',
            'altitude': 2084,
            'keywords': ['lake', 'naini', 'mall road', 'boats', 'naina devi']
        },
        'mussoorie': {
            'name': 'Mussoorie',
            'aliases': ['queen of hills'],
            'district': 'Dehradun',
            'type': 'hill_station',
            'altitude': 2005,
            'keywords': ['mall road', 'kempty falls', 'gun hill', 'cable car']
        },
        'ranikhet': {
            'name': 'Ranikhet',
            'aliases': ['rani khet'],
            'district': 'Almora',
            'type': 'hill_station',
            'altitude': 1869,
            'keywords': ['golf course', 'jhula devi', 'chaubatia']
        },
        'almora': {
            'name': 'Almora',
            'aliases': [],
            'district': 'Almora',
            'type': 'hill_station',
            'altitude': 1638,
            'keywords': ['kasar devi', 'bright end corner', 'nanda devi']
        },
        'kausani': {
            'name': 'Kausani',
            'aliases': ['switzerland of india'],
            'district': 'Bageshwar',
            'type': 'hill_station',
            'altitude': 1890,
            'keywords': ['tea gardens', 'himalayan view', 'anasakti ashram']
        },
        
        # Religious Places
        'haridwar': {
            'name': 'Haridwar',
            'aliases': ['hari dwar', 'gateway to gods'],
            'district': 'Haridwar',
            'type': 'religious',
            'altitude': 314,
            'keywords': ['ganga', 'har ki pauri', 'aarti', 'mansa devi', 'chandi devi']
        },
        'rishikesh': {
            'name': 'Rishikesh',
            'aliases': ['yoga capital'],
            'district': 'Dehradun',
            'type': 'religious',
            'altitude': 372,
            'keywords': ['ganga', 'laxman jhula', 'ram jhula', 'rafting', 'yoga', 'beatles ashram']
        },
        'tungnath': {
            'name': 'Tungnath',
            'aliases': ['tungnath temple'],
            'district': 'Rudraprayag',
            'type': 'temple',
            'altitude': 3680,
            'keywords': ['highest shiva temple', 'chandrashila', 'trek', 'panch kedar']
        },
        'jageshwar': {
            'name': 'Jageshwar',
            'aliases': ['jageshwar dham'],
            'district': 'Almora',
            'type': 'temple',
            'altitude': 1870,
            'keywords': ['ancient temples', 'shiva', 'stone temples', '125 temples']
        },
        
        # Wildlife & Nature
        'jim_corbett': {
            'name': 'Jim Corbett National Park',
            'aliases': ['corbett', 'corbett national park'],
            'district': 'Nainital',
            'type': 'wildlife',
            'altitude': 400,
            'keywords': ['tiger', 'wildlife', 'safari', 'ramganga', 'dhikala']
        },
        'valley_of_flowers': {
            'name': 'Valley of Flowers',
            'aliases': ['flower valley'],
            'district': 'Chamoli',
            'type': 'nature',
            'altitude': 3658,
            'keywords': ['flowers', 'meadow', 'trek', 'unesco', 'hemkund']
        },
        
        # Adventure & Trekking
        'auli': {
            'name': 'Auli',
            'aliases': ['auli ski resort'],
            'district': 'Chamoli',
            'type': 'adventure',
            'altitude': 2800,
            'keywords': ['skiing', 'cable car', 'snow', 'nanda devi view']
        },
        'chopta': {
            'name': 'Chopta',
            'aliases': ['mini switzerland'],
            'district': 'Rudraprayag',
            'type': 'nature',
            'altitude': 2680,
            'keywords': ['tungnath trek', 'chandrashila', 'meadows', 'deoria tal']
        },
        
        # Other Important Places
        'dehradun': {
            'name': 'Dehradun',
            'aliases': ['doon valley'],
            'district': 'Dehradun',
            'type': 'city',
            'altitude': 640,
            'keywords': ['capital', 'robbers cave', 'sahastradhara', 'fma', 'ima']
        },
        'lansdowne': {
            'name': 'Lansdowne',
            'aliases': [],
            'district': 'Pauri Garhwal',
            'type': 'hill_station',
            'altitude': 1706,
            'keywords': ['cantonment', 'bhulla lake', 'tip n top']
        }
    }
    
    def __init__(self):
        """Initialize place matcher"""
        logger.info("Place matcher initialized")
    
    def match_place(
        self, 
        recognized_name: str, 
        description: str = "",
        keywords: List[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Match recognized place with known places database
        
        Args:
            recognized_name: Name recognized from image
            description: Description text
            keywords: List of keywords from recognition
            
        Returns:
            Matched place data or None
        """
        if not recognized_name:
            return None
        
        recognized_name_lower = recognized_name.lower().strip()
        
        # Direct match
        if recognized_name_lower in self.KNOWN_PLACES:
            return self._enrich_place_data(self.KNOWN_PLACES[recognized_name_lower])
        
        # Alias match
        for place_key, place_data in self.KNOWN_PLACES.items():
            for alias in place_data.get('aliases', []):
                if alias.lower() in recognized_name_lower or recognized_name_lower in alias.lower():
                    return self._enrich_place_data(place_data)
        
        # Fuzzy match
        best_match = None
        best_score = 0
        
        for place_key, place_data in self.KNOWN_PLACES.items():
            # Match against name
            score = SequenceMatcher(None, recognized_name_lower, place_data['name'].lower()).ratio()
            
            # Match against aliases
            for alias in place_data.get('aliases', []):
                alias_score = SequenceMatcher(None, recognized_name_lower, alias.lower()).ratio()
                score = max(score, alias_score)
            
            # Boost score if keywords match
            if keywords:
                keyword_matches = sum(
                    1 for kw in keywords 
                    if any(pk in kw.lower() for pk in place_data.get('keywords', []))
                )
                score += keyword_matches * 0.1
            
            # Boost score if description contains place keywords
            if description:
                desc_lower = description.lower()
                keyword_matches = sum(
                    1 for pk in place_data.get('keywords', [])
                    if pk in desc_lower
                )
                score += keyword_matches * 0.05
            
            if score > best_score:
                best_score = score
                best_match = place_data
        
        # Return match if confidence is high enough
        if best_score >= 0.6:
            return self._enrich_place_data(best_match)
        
        return None
    
    def _enrich_place_data(self, place_data: Dict[str, Any]) -> Dict[str, Any]:
        """Enrich place data with additional information"""
        enriched = place_data.copy()
        enriched['matched'] = True
        enriched['data_source'] = 'known_database'
        return enriched
    
    def get_suggestions(self, partial_name: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Get place suggestions based on partial name"""
        if not partial_name:
            return []
        
        partial_lower = partial_name.lower().strip()
        suggestions = []
        
        for place_key, place_data in self.KNOWN_PLACES.items():
            # Check if partial name matches
            if partial_lower in place_data['name'].lower():
                suggestions.append(place_data)
            else:
                # Check aliases
                for alias in place_data.get('aliases', []):
                    if partial_lower in alias.lower():
                        suggestions.append(place_data)
                        break
        
        return suggestions[:limit]
    
    def get_places_by_type(self, place_type: str) -> List[Dict[str, Any]]:
        """Get all places of a specific type"""
        return [
            place_data for place_data in self.KNOWN_PLACES.values()
            if place_data.get('type') == place_type
        ]
    
    def get_places_by_district(self, district: str) -> List[Dict[str, Any]]:
        """Get all places in a specific district"""
        district_lower = district.lower()
        return [
            place_data for place_data in self.KNOWN_PLACES.values()
            if district_lower in place_data.get('district', '').lower()
        ]

# Singleton instance
_place_matcher: Optional[PlaceMatcher] = None

def get_place_matcher() -> PlaceMatcher:
    """Get or create place matcher instance"""
    global _place_matcher
    if _place_matcher is None:
        _place_matcher = PlaceMatcher()
    return _place_matcher
