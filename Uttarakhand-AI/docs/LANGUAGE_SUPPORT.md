# Multi-Language Support Guide

## Supported Languages

The Uttarakhand Tourism AI supports **4 languages**:

1. **English** - Default language
2. **Hindi (हिंदी)** - National language
3. **Garhwali (गढ़वाली)** - Regional language of Garhwal region
4. **Kumaoni (कुमाऊँनी)** - Regional language of Kumaon region

---

## How It Works

### Language Selection
Users can select their preferred language from the language selector in the dashboard. The AI will respond in the selected language.

### Garhwali & Kumaoni Support

**Important Note:** Garhwali and Kumaoni are regional dialects that use Devanagari script (same as Hindi) but have unique vocabulary and grammar.

#### Current Implementation:
- The AI responds in **Hindi-Garhwali** or **Hindi-Kumaoni** mixed language
- Uses Devanagari script (देवनागरी लिपि)
- Incorporates regional words and phrases
- Maintains cultural context and local expressions

#### Example Responses:

**English:**
```
Nainital is a beautiful lake city. The best time to visit is from March to June.
```

**Hindi:**
```
नैनीताल एक सुंदर झील वाला शहर है। यहाँ घूमने का सबसे अच्छा समय मार्च से जून तक है।
```

**Garhwali (Hindi-Garhwali Mix):**
```
नैनीताल एक सुंदर झील वाला शहर है। यहाँ कु घूमण खातिर सबसे बढ़िया समय मार्च से जून तक है।
```

**Kumaoni (Hindi-Kumaoni Mix):**
```
नैनीताल एक सुंदर झील वाला शहर छु। यहाँ कु घूमण खातिर सबसे बढ़िया समय मार्च से जून तक छु।
```

#### Regional Words Used:

**Garhwali:**
- `कु` (ku) = को (to/for)
- `बारे` (bare) = के बारे में (about)
- `देणा` (dena) = देना (to give)
- `घूमण` (ghumna) = घूमना (to roam/visit)
- `खातिर` (khatir) = के लिए (for)

**Kumaoni:**
- `कु` (ku) = को (to/for)
- `छु` (chhu) = है (is)
- `देणा` (dena) = देना (to give)
- `घूमण` (ghumna) = घूमना (to roam/visit)
- `खातिर` (khatir) = के लिए (for)

---

## Testing Language Support

### 1. Test in Dashboard
1. Go to Dashboard
2. Select language from dropdown (English/Hindi/Garhwali/Kumaoni)
3. Ask a question in the chat
4. AI will respond in selected language

### 2. Sample Questions to Test

**English:**
- "Tell me about Nainital"
- "What is the best time to visit Mussoorie?"
- "Suggest a 3-day itinerary"

**Hindi:**
- "नैनीताल के बारे में बताओ"
- "मसूरी घूमने का सबसे अच्छा समय क्या है?"
- "3 दिन का यात्रा कार्यक्रम सुझाओ"

**Garhwali/Kumaoni:**
- "नैनीताल बारे बताओ"
- "मसूरी घूमण का समय क्या छु?"
- "3 दिन का यात्रा बताओ"

---

## Technical Details

### Backend (Gemini Service)

The language handling is done in `backend/app/services/gemini_service.py`:

```python
def _get_system_prompt(self, language: str) -> str:
    """Get system prompt based on language"""
    prompts = {
        'english': "...",
        'hindi': "...",
        'garhwali': "...",  # Hindi-Garhwali mixed
        'kumaoni': "..."    # Hindi-Kumaoni mixed
    }
```

### Frontend (Language Selector)

Language selection is available in:
- `frontend/src/components/common/LanguageSelector.tsx`
- Dashboard header
- All AI interaction components

---

## Limitations & Future Improvements

### Current Limitations:
1. **Pure Garhwali/Kumaoni:** AI uses Hindi-mixed dialect, not pure regional language
2. **Vocabulary:** Limited regional vocabulary (AI is trained primarily on Hindi/English)
3. **Grammar:** Some grammatical structures may default to Hindi

### Planned Improvements:
1. Add more regional vocabulary and phrases
2. Improve dialect accuracy with custom training
3. Add voice input/output in regional languages
4. Include more cultural context and local expressions

---

## Weather Data

### Available Cities (12 locations):
1. **Dehradun** - Capital city, 22°C
2. **Rishikesh** - Yoga capital, 24°C
3. **Haridwar** - Holy city, 26°C
4. **Mussoorie** - Queen of Hills, 15°C
5. **Nainital** - Lake district, 18°C
6. **Almora** - Cultural hub, 16°C
7. **Ranikhet** - Army town, 14°C
8. **Kedarnath** - Char Dham, 8°C
9. **Badrinath** - Char Dham, 10°C
10. **Gangotri** - Char Dham, 9°C
11. **Yamunotri** - Char Dham, 11°C
12. **Auli** - Skiing paradise, 5°C

### Weather Features:
- Real-time temperature and conditions
- Humidity, wind speed, visibility
- Pressure readings
- Travel advice based on weather
- Demo mode (works without API key)

---

## Emergency Contacts

### 30+ Emergency Numbers Added:
- National helplines (100, 108, 101, etc.)
- District-wise police control rooms
- Hospital emergency numbers
- Tourism helplines
- Disaster management
- Mountain rescue
- Wildlife park emergencies

See `database/seeds/emergency_contacts.json` for complete list.

---

## Support

For issues or suggestions regarding language support:
1. Check console logs for language detection
2. Verify language selector is working
3. Test with different question types
4. Report issues with specific examples

---

**Note:** The AI's ability to respond in Garhwali/Kumaoni depends on Google Gemini's training data. Responses will be in Hindi-mixed dialect rather than pure regional language.
