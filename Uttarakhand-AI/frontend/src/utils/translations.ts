/**
 * Translations for Landing Page
 */

export type Language = 'english' | 'hindi';

export interface LandingPageTranslations {
  hero: {
    slides: Array<{
      title: string;
      subtitle: string;
      description: string;
    }>;
    exploreServices: string;
    discoverDestinations: string;
  };
  services: {
    heading: string;
    subheading: string;
    cards: Array<{
      title: string;
      description: string;
    }>;
    viewAll: string;
  };
  destinations: {
    heading: string;
    subheading: string;
    categories: Array<{
      title: string;
      subtitle: string;
    }>;
  };
  whyChoose: {
    heading: string;
    subheading: string;
    features: Array<{
      title: string;
      description: string;
    }>;
  };
  cta: {
    heading: string;
    subheading: string;
    description: string;
    getStarted: string;
    exploreNow: string;
  };
}

// Common translations for all pages
export interface CommonTranslations {
  nav: {
    home: string;
    services: string;
    explore: string;
    history: string;
    profile: string;
    login: string;
    signup: string;
    logout: string;
    chatHistory: string;
    activityDashboard: string;
    activityHistory: string;
    settings: string;
    officialTourism: string;
  };
  common: {
    loading: string;
    loadingData: string;
    error: string;
    success: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    back: string;
    search: string;
    filter: string;
    viewAll: string;
    tryAgain: string;
    refresh: string;
    export: string;
    download: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    needAssistance: string;
    needAssistanceDesc: string;
    exploreServices: string;
    featuredDestinations: string;
    featuredDestinationsDesc: string;
  };
  services: {
    title: string;
    subtitle: string;
    aiGuide: string;
    aiGuideDesc: string;
    placeRecognition: string;
    placeRecognitionDesc: string;
    tripPlanning: string;
    tripPlanningDesc: string;
    emergency: string;
    emergencyDesc: string;
    launchService: string;
    whyChoose: string;
    whyChooseDesc: string;
    instantResponses: string;
    instantResponsesDesc: string;
    multiLanguage: string;
    multiLanguageDesc: string;
    personalized: string;
    personalizedDesc: string;
  };
  profile: {
    title: string;
    subtitle: string;
    accountSettings: string;
    profileInfo: string;
    profileInfoDesc: string;
    editProfile: string;
    fullName: string;
    email: string;
    emailNote: string;
    preferredLanguage: string;
    saveChanges: string;
    savingChanges: string;
    yourStats: string;
    totalChats: string;
    feedbackGiven: string;
    positive: string;
    negative: string;
    explorerBadge: string;
    activeTraveler: string;
    memberSince: string;
  };
  chatHistory: {
    title: string;
    subtitle: string;
    conversations: string;
    searchConversations: string;
    noConversations: string;
    noConversationSelected: string;
    noConversationSelectedDesc: string;
    selectConversation: string;
    conversation: string;
    messages: string;
    deleteConversation: string;
    exportMD: string;
    exportJSON: string;
    likeResponse: string;
    dislikeResponse: string;
    totalChats: string;
    feedbackGiven: string;
    all: string;
    today: string;
    week: string;
    month: string;
  };
  activity: {
    dashboard: {
      title: string;
      subtitle: string;
      yourOverview: string;
      yourOverviewDesc: string;
      timePeriod: string;
      last7Days: string;
      last30Days: string;
      last90Days: string;
      lastYear: string;
      totalActivities: string;
      servicesUsed: string;
      mostUsed: string;
      avgResponse: string;
      serviceBreakdown: string;
      noActivityYet: string;
      noActivityYetDesc: string;
      testActivity: string;
      unableToLoad: string;
    };
    history: {
      title: string;
      subtitle: string;
      serviceType: string;
      allServices: string;
      timeRange: string;
      noActivities: string;
      noActivitiesDesc: string;
      loadingActivities: string;
      fetchingHistory: string;
      previous: string;
      next: string;
      clearFilters: string;
    };
  };
}

export const commonTranslations: Record<Language, CommonTranslations> = {
  english: {
    nav: {
      home: 'Home',
      services: 'Services',
      explore: 'Explore',
      history: 'History',
      profile: 'Profile',
      login: 'Login',
      signup: 'Sign Up',
      logout: 'Logout',
      chatHistory: 'Chat History',
      activityDashboard: 'Activity Dashboard',
      activityHistory: 'Activity History',
      settings: 'Settings',
      officialTourism: 'Official Tourism'
    },
    common: {
      loading: 'Loading...',
      loadingData: 'Loading data...',
      error: 'Error',
      success: 'Success',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      back: 'Back',
      search: 'Search',
      filter: 'Filter',
      viewAll: 'View All',
      tryAgain: 'Try Again',
      refresh: 'Refresh',
      export: 'Export',
      download: 'Download'
    },
    dashboard: {
      title: 'Explore Uttarakhand',
      subtitle: 'Discover the Land of Gods',
      needAssistance: 'Need Travel Assistance?',
      needAssistanceDesc: 'Access our AI-powered services for personalized travel planning',
      exploreServices: 'Explore AI Services',
      featuredDestinations: 'Featured Destinations',
      featuredDestinationsDesc: 'Handpicked places that showcase the essence of Uttarakhand'
    },
    services: {
      title: 'Intelligent Travel Services',
      subtitle: 'Explore Uttarakhand with cutting-edge AI technology',
      aiGuide: 'AI Travel Guide',
      aiGuideDesc: 'Chat with our AI-powered guide to get instant answers',
      placeRecognition: 'Place Recognition',
      placeRecognitionDesc: 'Upload photos to instantly identify landmarks',
      tripPlanning: 'Trip Planning',
      tripPlanningDesc: 'Generate customized itineraries based on your interests',
      emergency: 'Emergency Services',
      emergencyDesc: 'Access emergency contacts and weather alerts',
      launchService: 'Launch Service',
      whyChoose: 'Why Choose Our AI Services?',
      whyChooseDesc: 'Our intelligent tools are specifically designed for Uttarakhand tourism',
      instantResponses: 'Instant Responses',
      instantResponsesDesc: 'Get answers in seconds, not hours',
      multiLanguage: 'Multi-Language',
      multiLanguageDesc: 'Available in multiple languages',
      personalized: 'Personalized',
      personalizedDesc: 'Tailored to your preferences'
    },
    profile: {
      title: 'My Profile',
      subtitle: 'Manage your account settings and preferences',
      accountSettings: 'Account Settings',
      profileInfo: 'Profile Information',
      profileInfoDesc: 'Update your personal details and preferences',
      editProfile: 'Edit Profile',
      fullName: 'Full Name',
      email: 'Email Address',
      emailNote: 'Email address cannot be changed',
      preferredLanguage: 'Preferred Language',
      saveChanges: 'Save Changes',
      savingChanges: 'Saving Changes...',
      yourStats: 'Your Statistics',
      totalChats: 'Total Chats',
      feedbackGiven: 'Feedback Given',
      positive: 'Positive',
      negative: 'Negative',
      explorerBadge: 'Explorer Badge',
      activeTraveler: 'Active Uttarakhand Traveler',
      memberSince: 'Member since'
    },
    chatHistory: {
      title: 'Chat History',
      subtitle: 'Your service usage insights and analytics',
      conversations: 'Conversations',
      searchConversations: 'Search conversations...',
      noConversations: 'No conversations found',
      noConversationSelected: 'No Conversation Selected',
      noConversationSelectedDesc: 'Select a conversation from the list to view messages',
      selectConversation: 'Select a conversation',
      conversation: 'Conversation',
      messages: 'messages',
      deleteConversation: 'Delete this conversation?',
      exportMD: 'Export as Markdown',
      exportJSON: 'Export as JSON',
      likeResponse: 'Like this response',
      dislikeResponse: 'Dislike this response',
      totalChats: 'Total Chats',
      feedbackGiven: 'Feedback Given',
      all: 'All',
      today: 'Today',
      week: 'Week',
      month: 'Month'
    },
    activity: {
      dashboard: {
        title: 'Activity Dashboard',
        subtitle: 'Your service usage insights and analytics',
        yourOverview: 'Your Activity Overview',
        yourOverviewDesc: 'Track your service usage and performance',
        timePeriod: 'Time Period:',
        last7Days: 'Last 7 days',
        last30Days: 'Last 30 days',
        last90Days: 'Last 90 days',
        lastYear: 'Last year',
        totalActivities: 'Total Activities',
        servicesUsed: 'Services Used',
        mostUsed: 'Most Used',
        avgResponse: 'Avg Response',
        serviceBreakdown: 'Service Usage Breakdown',
        noActivityYet: 'No Activity Yet',
        noActivityYetDesc: 'Start using our AI-powered services to see your activity stats',
        testActivity: 'Test Activity',
        unableToLoad: 'Unable to Load Data'
      },
      history: {
        title: 'Activity History',
        subtitle: 'Track your service usage and explore your journey',
        serviceType: 'Service Type',
        allServices: 'All Services',
        timeRange: 'Time Range',
        noActivities: 'No Activities Found',
        noActivitiesDesc: 'Start using our services to see your activity history here',
        loadingActivities: 'Loading Activities...',
        fetchingHistory: 'Fetching your activity history',
        previous: 'Previous',
        next: 'Next',
        clearFilters: 'Clear Filters'
      }
    }
  },
  hindi: {
    nav: {
      home: 'होम',
      services: 'सेवाएं',
      explore: 'अन्वेषण',
      history: 'इतिहास',
      profile: 'प्रोफ़ाइल',
      login: 'लॉगिन',
      signup: 'साइन अप',
      logout: 'लॉगआउट',
      chatHistory: 'चैट इतिहास',
      activityDashboard: 'गतिविधि डैशबोर्ड',
      activityHistory: 'गतिविधि इतिहास',
      settings: 'सेटिंग्स',
      officialTourism: 'आधिकारिक पर्यटन'
    },
    common: {
      loading: 'लोड हो रहा है...',
      loadingData: 'डेटा लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफलता',
      save: 'सहेजें',
      cancel: 'रद्द करें',
      delete: 'हटाएं',
      edit: 'संपादित करें',
      back: 'वापस',
      search: 'खोजें',
      filter: 'फ़िल्टर',
      viewAll: 'सभी देखें',
      tryAgain: 'पुनः प्रयास करें',
      refresh: 'रीफ्रेश करें',
      export: 'निर्यात करें',
      download: 'डाउनलोड करें'
    },
    dashboard: {
      title: 'उत्तराखंड का अन्वेषण करें',
      subtitle: 'देवभूमि की खोज करें',
      needAssistance: 'यात्रा सहायता चाहिए?',
      needAssistanceDesc: 'व्यक्तिगत यात्रा योजना के लिए हमारी एआई-संचालित सेवाओं तक पहुंचें',
      exploreServices: 'एआई सेवाएं देखें',
      featuredDestinations: 'विशेष गंतव्य',
      featuredDestinationsDesc: 'उत्तराखंड के सार को प्रदर्शित करने वाले चुनिंदा स्थान'
    },
    services: {
      title: 'बुद्धिमान यात्रा सेवाएं',
      subtitle: 'अत्याधुनिक एआई तकनीक के साथ उत्तराखंड का अन्वेषण करें',
      aiGuide: 'एआई यात्रा गाइड',
      aiGuideDesc: 'तुरंत उत्तर पाने के लिए हमारे एआई-संचालित गाइड से चैट करें',
      placeRecognition: 'स्थान पहचान',
      placeRecognitionDesc: 'स्थलों को तुरंत पहचानने के लिए फ़ोटो अपलोड करें',
      tripPlanning: 'यात्रा योजना',
      tripPlanningDesc: 'अपनी रुचियों के आधार पर अनुकूलित यात्रा कार्यक्रम बनाएं',
      emergency: 'आपातकालीन सेवाएं',
      emergencyDesc: 'आपातकालीन संपर्क और मौसम अलर्ट तक पहुंचें',
      launchService: 'सेवा शुरू करें',
      whyChoose: 'हमारी एआई सेवाएं क्यों चुनें?',
      whyChooseDesc: 'हमारे बुद्धिमान उपकरण विशेष रूप से उत्तराखंड पर्यटन के लिए डिज़ाइन किए गए हैं',
      instantResponses: 'तत्काल प्रतिक्रियाएं',
      instantResponsesDesc: 'घंटों नहीं, सेकंड में उत्तर प्राप्त करें',
      multiLanguage: 'बहु-भाषा',
      multiLanguageDesc: 'कई भाषाओं में उपलब्ध',
      personalized: 'व्यक्तिगत',
      personalizedDesc: 'आपकी प्राथमिकताओं के अनुरूप'
    },
    profile: {
      title: 'मेरी प्रोफ़ाइल',
      subtitle: 'अपनी खाता सेटिंग्स और प्राथमिकताओं को प्रबंधित करें',
      accountSettings: 'खाता सेटिंग्स',
      profileInfo: 'प्रोफ़ाइल जानकारी',
      profileInfoDesc: 'अपने व्यक्तिगत विवरण और प्राथमिकताओं को अपडेट करें',
      editProfile: 'प्रोफ़ाइल संपादित करें',
      fullName: 'पूरा नाम',
      email: 'ईमेल पता',
      emailNote: 'ईमेल पता बदला नहीं जा सकता',
      preferredLanguage: 'पसंदीदा भाषा',
      saveChanges: 'परिवर्तन सहेजें',
      savingChanges: 'परिवर्तन सहेजे जा रहे हैं...',
      yourStats: 'आपके आंकड़े',
      totalChats: 'कुल चैट',
      feedbackGiven: 'दी गई प्रतिक्रिया',
      positive: 'सकारात्मक',
      negative: 'नकारात्मक',
      explorerBadge: 'एक्सप्लोरर बैज',
      activeTraveler: 'सक्रिय उत्तराखंड यात्री',
      memberSince: 'सदस्य बने'
    },
    chatHistory: {
      title: 'चैट इतिहास',
      subtitle: 'आपकी सेवा उपयोग अंतर्दृष्टि और विश्लेषण',
      conversations: 'बातचीत',
      searchConversations: 'बातचीत खोजें...',
      noConversations: 'कोई बातचीत नहीं मिली',
      noConversationSelected: 'कोई बातचीत चयनित नहीं',
      noConversationSelectedDesc: 'संदेश देखने के लिए सूची से एक बातचीत चुनें',
      selectConversation: 'एक बातचीत चुनें',
      conversation: 'बातचीत',
      messages: 'संदेश',
      deleteConversation: 'इस बातचीत को हटाएं?',
      exportMD: 'मार्कडाउन के रूप में निर्यात करें',
      exportJSON: 'JSON के रूप में निर्यात करें',
      likeResponse: 'इस प्रतिक्रिया को पसंद करें',
      dislikeResponse: 'इस प्रतिक्रिया को नापसंद करें',
      totalChats: 'कुल चैट',
      feedbackGiven: 'दी गई प्रतिक्रिया',
      all: 'सभी',
      today: 'आज',
      week: 'सप्ताह',
      month: 'महीना'
    },
    activity: {
      dashboard: {
        title: 'गतिविधि डैशबोर्ड',
        subtitle: 'आपकी सेवा उपयोग अंतर्दृष्टि और विश्लेषण',
        yourOverview: 'आपकी गतिविधि अवलोकन',
        yourOverviewDesc: 'अपनी सेवा उपयोग और प्रदर्शन को ट्रैक करें',
        timePeriod: 'समय अवधि:',
        last7Days: 'पिछले 7 दिन',
        last30Days: 'पिछले 30 दिन',
        last90Days: 'पिछले 90 दिन',
        lastYear: 'पिछला वर्ष',
        totalActivities: 'कुल गतिविधियां',
        servicesUsed: 'उपयोग की गई सेवाएं',
        mostUsed: 'सबसे अधिक उपयोग',
        avgResponse: 'औसत प्रतिक्रिया',
        serviceBreakdown: 'सेवा उपयोग विवरण',
        noActivityYet: 'अभी तक कोई गतिविधि नहीं',
        noActivityYetDesc: 'अपनी गतिविधि आंकड़े देखने के लिए हमारी एआई-संचालित सेवाओं का उपयोग शुरू करें',
        testActivity: 'परीक्षण गतिविधि',
        unableToLoad: 'डेटा लोड करने में असमर्थ'
      },
      history: {
        title: 'गतिविधि इतिहास',
        subtitle: 'अपनी सेवा उपयोग को ट्रैक करें और अपनी यात्रा का अन्वेषण करें',
        serviceType: 'सेवा प्रकार',
        allServices: 'सभी सेवाएं',
        timeRange: 'समय सीमा',
        noActivities: 'कोई गतिविधि नहीं मिली',
        noActivitiesDesc: 'अपनी गतिविधि इतिहास यहां देखने के लिए हमारी सेवाओं का उपयोग शुरू करें',
        loadingActivities: 'गतिविधियां लोड हो रही हैं...',
        fetchingHistory: 'आपका गतिविधि इतिहास प्राप्त किया जा रहा है',
        previous: 'पिछला',
        next: 'अगला',
        clearFilters: 'फ़िल्टर साफ़ करें'
      }
    }
  }
};

export const translations: Record<Language, LandingPageTranslations> = {
  english: {
    hero: {
      slides: [
        {
          title: 'Kedarnath Temple',
          subtitle: 'Sacred Himalayan Pilgrimage',
          description: 'One of the twelve Jyotirlingas at 3,583m elevation'
        },
        {
          title: 'Valley of Flowers',
          subtitle: 'UNESCO World Heritage',
          description: 'Alpine meadows with endemic Himalayan flora'
        },
        {
          title: 'Nainital Lake',
          subtitle: 'Serene Hill Station',
          description: 'Pear-shaped lake surrounded by seven hills'
        },
        {
          title: 'Jim Corbett',
          subtitle: 'Wildlife Sanctuary',
          description: 'Home to the majestic Bengal tiger'
        }
      ],
      exploreServices: 'Explore Services',
      discoverDestinations: 'Discover Destinations'
    },
    services: {
      heading: 'AI-Powered Travel Assistance',
      subheading: 'Intelligent tools to enhance your Uttarakhand journey',
      cards: [
        { title: 'AI Guide', description: 'Chat with intelligent travel assistant' },
        { title: 'Place Recognition', description: 'Identify landmarks instantly' },
        { title: 'Trip Planning', description: 'Personalized itineraries' },
        { title: 'Emergency', description: 'Safety & weather alerts' }
      ],
      viewAll: 'View All Services'
    },
    destinations: {
      heading: 'Explore Uttarakhand',
      subheading: 'Discover the diverse beauty of the Himalayas',
      categories: [
        { title: 'Spiritual Tourism', subtitle: 'Char Dham Yatra' },
        { title: 'Adventure Sports', subtitle: 'Trekking & Rafting' },
        { title: 'Wildlife Safari', subtitle: 'National Parks' },
        { title: 'Hill Stations', subtitle: 'Nainital & Mussoorie' },
        { title: 'Cultural Heritage', subtitle: 'Temples & Festivals' },
        { title: 'Valley of Flowers', subtitle: 'UNESCO Heritage' },
        { title: 'Winter Sports', subtitle: 'Auli Skiing' },
        { title: 'Yoga & Wellness', subtitle: 'Rishikesh Retreats' }
      ]
    },
    whyChoose: {
      heading: 'Why Travelers Trust Us',
      subheading: 'Experience the difference with our platform',
      features: [
        {
          title: 'Multi-Language Support',
          description: 'Available in English, Hindi, Garhwali, and Kumaoni for seamless communication'
        },
        {
          title: 'Real-Time Information',
          description: 'Live weather updates, emergency contacts, and travel advisories'
        },
        {
          title: 'Personalized Experience',
          description: 'AI-powered recommendations tailored to your interests and preferences'
        }
      ]
    },
    cta: {
      heading: 'Begin Your Himalayan Journey',
      subheading: 'देवभूमि की यात्रा शुरू करें',
      description: 'Join thousands exploring Uttarakhand with intelligent guidance',
      getStarted: 'Get Started',
      exploreNow: 'Explore Now'
    }
  },
  hindi: {
    hero: {
      slides: [
        {
          title: 'केदारनाथ मंदिर',
          subtitle: 'पवित्र हिमालयी तीर्थ',
          description: '3,583 मीटर की ऊंचाई पर बारह ज्योतिर्लिंगों में से एक'
        },
        {
          title: 'फूलों की घाटी',
          subtitle: 'यूनेस्को विश्व धरोहर',
          description: 'हिमालयी वनस्पतियों के साथ अल्पाइन घास के मैदान'
        },
        {
          title: 'नैनीताल झील',
          subtitle: 'शांत पहाड़ी स्टेशन',
          description: 'सात पहाड़ियों से घिरी नाशपाती के आकार की झील'
        },
        {
          title: 'जिम कॉर्बेट',
          subtitle: 'वन्यजीव अभयारण्य',
          description: 'राजसी बंगाल टाइगर का घर'
        }
      ],
      exploreServices: 'सेवाएं देखें',
      discoverDestinations: 'गंतव्य खोजें'
    },
    services: {
      heading: 'एआई-संचालित यात्रा सहायता',
      subheading: 'आपकी उत्तराखंड यात्रा को बेहतर बनाने के लिए बुद्धिमान उपकरण',
      cards: [
        { title: 'एआई गाइड', description: 'बुद्धिमान यात्रा सहायक के साथ चैट करें' },
        { title: 'स्थान पहचान', description: 'स्थलों को तुरंत पहचानें' },
        { title: 'यात्रा योजना', description: 'व्यक्तिगत यात्रा कार्यक्रम' },
        { title: 'आपातकाल', description: 'सुरक्षा और मौसम अलर्ट' }
      ],
      viewAll: 'सभी सेवाएं देखें'
    },
    destinations: {
      heading: 'उत्तराखंड का अन्वेषण करें',
      subheading: 'हिमालय की विविध सुंदरता की खोज करें',
      categories: [
        { title: 'आध्यात्मिक पर्यटन', subtitle: 'चार धाम यात्रा' },
        { title: 'साहसिक खेल', subtitle: 'ट्रैकिंग और राफ्टिंग' },
        { title: 'वन्यजीव सफारी', subtitle: 'राष्ट्रीय उद्यान' },
        { title: 'पहाड़ी स्टेशन', subtitle: 'नैनीताल और मसूरी' },
        { title: 'सांस्कृतिक विरासत', subtitle: 'मंदिर और त्यौहार' },
        { title: 'फूलों की घाटी', subtitle: 'यूनेस्को धरोहर' },
        { title: 'शीतकालीन खेल', subtitle: 'औली स्कीइंग' },
        { title: 'योग और कल्याण', subtitle: 'ऋषिकेश रिट्रीट' }
      ]
    },
    whyChoose: {
      heading: 'यात्री हम पर भरोसा क्यों करते हैं',
      subheading: 'हमारे प्लेटफॉर्म के साथ अंतर का अनुभव करें',
      features: [
        {
          title: 'बहु-भाषा समर्थन',
          description: 'निर्बाध संचार के लिए अंग्रेजी, हिंदी, गढ़वाली और कुमाऊंनी में उपलब्ध'
        },
        {
          title: 'वास्तविक समय की जानकारी',
          description: 'लाइव मौसम अपडेट, आपातकालीन संपर्क और यात्रा सलाह'
        },
        {
          title: 'व्यक्तिगत अनुभव',
          description: 'आपकी रुचियों और प्राथमिकताओं के अनुरूप एआई-संचालित सिफारिशें'
        }
      ]
    },
    cta: {
      heading: 'अपनी हिमालयी यात्रा शुरू करें',
      subheading: 'देवभूमि की यात्रा शुरू करें',
      description: 'बुद्धिमान मार्गदर्शन के साथ उत्तराखंड की खोज करने वाले हजारों लोगों में शामिल हों',
      getStarted: 'शुरू करें',
      exploreNow: 'अभी देखें'
    }
  }
};
