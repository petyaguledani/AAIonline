// Digital Attachment History Assessment (DAHA) - Questions Dataset
// This would be included in the main JS file or loaded separately

const questions = [
    // I. Early Family Context
    {
        id: 'family_structure',
        section: 'Early Family Context',
        text: 'Describe your early family situation, including who raised you, where you lived, and if you moved frequently.',
        type: 'textarea',
        required: true,
        placeholder: 'Think back to your earliest memories of your family...',
        followUp: {
            text: 'Please include information about your parents\' occupations if you haven\'t already mentioned them.'
        },
        timeThreshold: 90 // seconds before follow-up prompt appears
    },
    {
        id: 'extended_family',
        section: 'Early Family Context',
        text: 'What role did grandparents or other extended family members play in your childhood?',
        type: 'textarea',
        required: false,
        placeholder: 'Consider both the amount of contact and the quality of these relationships...',
        followUp: {
            text: 'Even if you had limited contact with extended family, what was your understanding of these relationships?'
        },
        followUpCondition: 'minimalResponse'
    },
    
    // II. Relationship Representations
    {
        id: 'mother_relationship',
        section: 'Relationship Representations',
        text: 'Please list five words or phrases that reflect your childhood relationship with your mother or primary caregiver.',
        type: 'adjectives',
        required: true,
        followUp: {
            text: 'You described your relationship with your mother/primary caregiver as [WORD]. Please share a specific memory that illustrates why you chose this word.'
        }
    },
    {
        id: 'father_relationship',
        section: 'Relationship Representations',
        text: 'Please list five words or phrases that reflect your childhood relationship with your father or secondary caregiver.',
        type: 'adjectives',
        required: true,
        followUp: {
            text: 'You described your relationship with your father/secondary caregiver as [WORD]. Please share a specific memory that illustrates why you chose this word.'
        }
    },
    {
        id: 'parental_closeness',
        section: 'Relationship Representations',
        text: 'Which parent or caregiver did you feel closest to during childhood and why?',
        type: 'textarea',
        required: true,
        followUp: {
            text: 'What prevented this same feeling of closeness with your other parent/caregiver?'
        }
    },
    
    // III. Emotional Regulation History
    {
        id: 'emotional_distress',
        section: 'Emotional Regulation History',
        text: 'When you were emotionally upset as a child, what would typically happen?',
        type: 'textarea',
        required: true,
        followUp: {
            text: 'Please describe a specific incident when you were emotionally upset, what triggered it, what you did, and how others responded.'
        }
    },
    {
        id: 'physical_distress',
        section: 'Emotional Regulation History',
        text: 'When you were physically hurt as a child (like falling down or getting injured), what would typically happen?',
        type: 'textarea',
        required: true,
        followUp: {
            text: 'Please describe a specific incident when you were physically hurt, how you responded, and how your caregivers responded.'
        }
    },
    {
        id: 'illness_experience',
        section: 'Emotional Regulation History',
        text: 'When you were sick as a child, what would happen?',
        type: 'textarea',
        required: true,
        followUp: {
            text: 'Can you describe a specific time you were ill, how your parents responded, and how you felt about their response?'
        }
    },
    {
        id: 'comfort_experience',
        section: 'Emotional Regulation History',
        text: 'Do you remember being physically comforted when distressed as a child?',
        type: 'radio',
        required: true,
        options: [
            { value: 'yes_often', label: 'Yes, often' },
            { value: 'yes_sometimes', label: 'Yes, sometimes' },
            { value: 'rarely', label: 'Rarely' },
            { value: 'never', label: 'Never' },
            { value: 'dont_remember', label: 'I don\'t remember' }
        ],
        followUp: {
            text: 'Who would typically comfort you and how would they do it?'
        },
        followUpCondition: function(response) {
            return response.value === 'yes_often' || response.value === 'yes_sometimes';
        }
    },
    
    // IV. Separation and Challenging Experiences
    {
        id: 'separation_memory',
        section: 'Separation and Challenging Experiences',
        text: 'What is your earliest memory of being separated from your parents?',
        type: 'textarea',
        required: true,
        followUp: {
            text: 'How did you feel during this separation, and how did you and your parents respond to these feelings?'
        }
    },
    {
        id: 'rejection_experience',
        section: 'Separation and Challenging Experiences',
        text: 'Did you ever feel rejected or unwanted by your parents or caregivers during childhood?',
        type: 'radio',
        required: true,
        options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
            { value: 'unsure', label: 'I\'m not sure' }
        ],
        followUp: {
            text: 'How old were you when this happened? What occurred that made you feel rejected? Why do you think they behaved this way?'
        },
        followUpCondition: function(response) {
            return response.value === 'yes';
        }
    },
    {
        id: 'fear_experience',
        section: 'Separation and Challenging Experiences',
        text: 'Were you often frightened or worried as a child?',
        type: 'radio',
        required: true,
        options: [
            { value: 'yes_often', label: 'Yes, often' },
            { value: 'yes_sometimes', label: 'Yes, sometimes' },
            { value: 'rarely', label: 'Rarely' },
            { value: 'never', label: 'Never' }
        ],
        followUp: {
            text: 'What kinds of things frightened you, and how did your parents respond to your fears?'
        },
        followUpCondition: function(response) {
            return response.value === 'yes_often' || response.value === 'yes_sometimes';
        }
    },
    {
        id: 'discipline_approach',
        section: 'Separation and Challenging Experiences',
        text: 'How were you typically disciplined as a child?',
        type: 'textarea',
        required: true,
        followUp: {
            text: 'Did your parents ever threaten you as a form of discipline, even jokingly?'
        }
    },
    {
        id: 'boundary_violations',
        section: 'Separation and Challenging Experiences',
        text: 'Sometimes children experience behavior from adults that crosses appropriate boundaries. Did you experience anything you would consider abusive?',
        type: 'radio',
        required: true,
        options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
            { value: 'prefer_not_to_say', label: 'I prefer not to say' }
        ],
        followUp: {
            text: 'If you feel comfortable sharing, how old were you, what happened, and how frequently did it occur?'
        },
        followUpCondition: function(response) {
            return response.value === 'yes';
        }
    },
    
    // V. Loss and Trauma
    {
        id: 'early_loss',
        section: 'Loss and Trauma',
        text: 'Did you experience the death of a parent, sibling, or other very close person during your childhood?',
        type: 'radio',
        required: true,
        options: [
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' }
        ],
        followUp: {
            text: 'What were the circumstances? How old were you? What do you remember about your feelings at that time? Have your feelings or understanding about this loss changed over time?'
        },
        followUpCondition: function(response) {
            return response.value === 'yes';
        }
    },
    {
        id: 'trauma_experience',
        section: 'Loss and Trauma',
        text: 'Beyond what you\'ve already shared, did you experience any events during childhood that felt overwhelming or traumatic?',
        type: 'textarea',
        required: false,
        placeholder: 'Take your time reflecting on this question...',
        followUp: {
            text: 'How has this experience affected your adult life and relationships?'
        },
        followUpCondition: function(response) {
            return response.value && response.value.trim().length > 10;
        }
    },
    
    // VI. Development and Change
    {
        id: 'relationship_evolution',
        section: 'Development and Change',
        text: 'How did your relationship with your parents change between childhood and adulthood?',
        type: 'textarea',
        required: true,
        followUp: {
            text: 'Was there a period when you questioned or rejected their values or approach?'
        }
    },
    {
        id: 'current_relationship',
        section: 'Development and Change',
        text: 'How would you describe your current relationship with your parents?',
        type: 'textarea',
        required: true,
        followUp: {
            text: 'What aspects bring you satisfaction in this relationship, and what aspects remain challenging?'
        }
    },
    {
        id: 'parental_understanding',
        section: 'Development and Change',
        text: 'Looking back now, why do you think your parents behaved as they did during your childhood?',
        type: 'textarea',
        required: true,
        followUp: {
            text: 'Have your thoughts about this changed over time?'
        }
    },
    
    // VII. Integration and Reflection
    {
        id: 'separation_response',
        section: 'Integration and Reflection',
        text: 'If you are a parent: How do you respond emotionally when separated from your child? If you are not a parent: How do you imagine you might respond to separation from a child?',
        type: 'textarea',
        required: true,
        followUp: {
            text: 'What aspects of your childhood experiences influence how you parent or expect to parent?'
        }
    },
    {
        id: 'developmental_impact',
        section: 'Integration and Reflection',
        text: 'How do you think your childhood experiences have affected your adult personality?',
        type: 'textarea',
        required: true,
        followUp: {
            text: 'Were there aspects of your early experiences that held back your development or affected you negatively?'
        }
    },
    {
        id: 'lessons_learned',
        section: 'Integration and Reflection',
        text: 'What is the most important lesson you\'ve gained from your childhood experiences?',
        type: 'textarea',
        required: true,
        followUp: {
            text: 'What would you hope your child (or future child) might learn from being parented by you?'
        }
    },
    
    // VIII. Metacognitive Reflection Module
    {
        id: 'response_review',
        section: 'Metacognitive Reflection',
        text: 'Review your description of your relationship with your mother/primary caregiver. Would you like to add or modify anything about this description?',
        type: 'textarea',
        required: false,
        placeholder: 'After reflecting on all the questions, you might have new insights...',
        followUp: {
            text: 'What was it like to review this response? Did anything surprise you about what you wrote?'
        }
    },
    {
        id: 'narrative_coherence',
        section: 'Metacognitive Reflection',
        text: 'Looking at your responses as a whole, do you notice any themes or patterns?',
        type: 'textarea',
        required: false,
        followUp: {
            text: 'Were there any contradictions or inconsistencies you noticed in how you described your experiences?'
        }
    },
    {
        id: 'emotional_awareness',
        section: 'Metacognitive Reflection',
        text: 'What emotions came up for you while completing this assessment?',
        type: 'textarea',
        required: false,
        followUp: {
            text: 'How do these emotions connect to the experiences you described?'
        }
    },
    {
        id: 'completion_reflection',
        section: 'Metacognitive Reflection',
        text: 'Is there anything important about your childhood experiences or their impact that you haven\'t had the opportunity to express in this assessment?',
        type: 'textarea',
        required: false
    }
];
