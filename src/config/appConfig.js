// Constants and default data moved out of the main component

export const config = {
    MASTERY_LABELS: {
        'Critical': 'Critical', 
        'Weak': 'Weak', 
        'Developing': 'Developing',
        'Strong': 'Strong', 
        'Mastered': 'Master-ed'
    },
    PASSING_SCORE: 80,
    MIN_ATTEMPTS_FOR_MASTERY: 2,
    MASTERY_AVG_THRESHOLD: 70,
    MASTERY_LATEST_SCORE_THRESHOLD: 90,
    TEST_TYPES: {
        miniQuiz: "Mini Quiz",
        officialQuiz: "Official Quiz",
        miniTest: "Mini Test",
        practiceTest: "Practice Test",
    },
    ALL_DOMAINS_KEY: "[All Domains (Overall Score)]",
    UNCATEGORIZED_KEY: "[Uncategorized Data]"
};

export const allExamData = {
    myFirstCert: {
        fullName: "My First Certification",
        tests: [],
        domains: [],
        studySessions: [],
    },
};

export const DEFAULT_SETTINGS = {
    useAccessibleFont: false,
    reduceMotion: false,
    maxWidth: 'max-w-7xl',
    colorblindMode: false,
    darkMode: false,
};