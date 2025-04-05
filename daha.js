// Digital Attachment History Assessment (DAHA) - Main JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const consentCheckbox = document.getElementById('consent-checkbox');
    const startButton = document.getElementById('start-assessment');
    const welcomeScreen = document.getElementById('welcome-screen');
    const questionContainer = document.getElementById('question-container');
    const completionScreen = document.getElementById('completion-screen');
    const resultsScreen = document.getElementById('results-screen');
    const progressBar = document.getElementById('progress-bar');
    const previousButton = document.getElementById('previous-button');
    const nextButton = document.getElementById('next-button');
    const saveProgressButton = document.getElementById('save-progress');
    const questionText = document.getElementById('question-text');
    const sectionTitle = document.getElementById('section-title');
    const questionNumber = document.getElementById('question-number');
    const responseContainer = document.getElementById('response-container');
    const followupContainer = document.getElementById('followup-container');
    const timeCounter = document.getElementById('time-counter');
    const viewSummaryButton = document.getElementById('view-summary');
    const downloadResponsesButton = document.getElementById('download-responses');
    const backToCompletionButton = document.getElementById('back-to-completion');
    const downloadReportButton = document.getElementById('download-report');
    const modalContainer = document.getElementById('modal-container');
    const closeModalButton = document.getElementById('close-modal');
    const modalPrimaryButton = document.getElementById('modal-primary-button');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');

    // Assessment state
    let currentQuestionIndex = 0;
    let responses = {};
    let questionStartTime = 0;
    let questionTimer = null;
    let audioRecorder = null;
    let audioStream = null;
    let isRecording = false;
    let recordedAudio = null;
    let timeOnQuestion = 0;
    let editHistory = [];
    let followupActive = false;

    // Consent checkbox event listener
    consentCheckbox.addEventListener('change', function() {
        startButton.disabled = !this.checked;
    });

    // Start button event listener
    startButton.addEventListener('click', function() {
        if (consentCheckbox.checked) {
            welcomeScreen.classList.remove('active');
            questionContainer.classList.add('active');
            startAssessment();
        }
    });

    // Previous button event listener
    previousButton.addEventListener('click', function() {
        if (currentQuestionIndex > 0) {
            saveCurrentResponse();
            currentQuestionIndex--;
            loadQuestion(currentQuestionIndex);
        }
    });

    // Next button event listener
    nextButton.addEventListener('click', function() {
        if (validateCurrentResponse()) {
            saveCurrentResponse();
            
            if (followupActive) {
                // Handle follow-up completion
                followupActive = false;
                followupContainer.classList.add('hidden');
                
                if (currentQuestionIndex < questions.length - 1) {
                    currentQuestionIndex++;
                    loadQuestion(currentQuestionIndex);
                } else {
                    completeAssessment();
                }
            } else {
                // Check if we need to show a follow-up for this question
                const currentQuestion = questions[currentQuestionIndex];
                if (currentQuestion.followUp && shouldShowFollowUp(currentQuestion)) {
                    showFollowUp(currentQuestion);
                } else if (currentQuestionIndex < questions.length - 1) {
                    currentQuestionIndex++;
                    loadQuestion(currentQuestionIndex);
                } else {
                    completeAssessment();
                }
            }
        }
    });

    // Save progress button event listener
    saveProgressButton.addEventListener('click', function() {
        saveCurrentResponse();
        saveAssessmentData();
        showModal('Progress Saved', '<p>Your progress has been saved. You can return to this assessment later by using the same device and browser.</p>');
    });

    // View summary button event listener
    viewSummaryButton.addEventListener('click', function() {
        completionScreen.classList.remove('active');
        resultsScreen.classList.add('active');
        generateResults();
    });

    // Back to completion button event listener
    backToCompletionButton.addEventListener('click', function() {
        resultsScreen.classList.remove('active');
        completionScreen.classList.add('active');
    });

    // Download responses button event listener
    downloadResponsesButton.addEventListener('click', function() {
        downloadResponses();
    });

    // Download report button event listener
    downloadReportButton.addEventListener('click', function() {
        downloadReport();
    });

    // Modal close button event listener
    closeModalButton.addEventListener('click', function() {
        closeModal();
    });

    // Modal primary button event listener
    modalPrimaryButton.addEventListener('click', function() {
        closeModal();
    });

    // Functions
    function startAssessment() {
        loadQuestion(currentQuestionIndex);
        updateProgressBar();
    }

    function loadQuestion(index) {
        const question = questions[index];
        
        // Reset the question container
        responseContainer.innerHTML = '';
        followupContainer.innerHTML = '';
        followupContainer.classList.add('hidden');
        followupActive = false;
        
        // Update the question display
        sectionTitle.textContent = question.section;
        questionNumber.textContent = `Question ${index + 1} of ${questions.length}`;
        questionText.textContent = question.text;
        
        // Create the appropriate response input based on question type
        createResponseInput(question);
        
        // Load any existing response
        if (responses[question.id]) {
            loadExistingResponse(question);
        }
        
        // Update navigation buttons
        previousButton.disabled = index === 0;
        
        // Reset and start the timer
        resetQuestionTimer();
        startQuestionTimer();
        
        // Update progress bar
        updateProgressBar();
    }

    function createResponseInput(question) {
        switch(question.type) {
            case 'text':
                createTextInput(question);
                break;
            case 'textarea':
                createTextareaInput(question);
                break;
            case 'adjectives':
                createAdjectivesInput(question);
                break;
            case 'radio':
                createRadioInput(question);
                break;
            case 'scale':
                createScaleInput(question);
                break;
            case 'audio':
                createAudioInput(question);
                break;
            default:
                createTextareaInput(question);
        }
    }

    function createTextInput(question) {
        const input = document.createElement('input');
        input.type = 'text';
        input.id = `response-${question.id}`;
        input.className = 'text-input';
        input.placeholder = question.placeholder || 'Enter your response...';
        
        responseContainer.appendChild(input);
        
        // Add event listener for edit tracking
        input.addEventListener('input', function() {
            trackEdit(question.id, this.value);
        });
    }

    function createTextareaInput(question) {
        const textarea = document.createElement('textarea');
        textarea.id = `response-${question.id}`;
        textarea.className = 'textarea-input';
        textarea.placeholder = question.placeholder || 'Enter your response...';
        
        responseContainer.appendChild(textarea);
        
        // Add event listener for edit tracking
        textarea.addEventListener('input', function() {
            trackEdit(question.id, this.value);
        });
    }

    function createAdjectivesInput(question) {
        const container = document.createElement('div');
        container.className = 'adjectives-container';
        
        const instruction = document.createElement('p');
        instruction.textContent = 'Please enter 5 words or short phrases:';
        container.appendChild(instruction);
        
        for (let i = 1; i <= 5; i++) {
            const inputGroup = document.createElement('div');
            inputGroup.className = 'adjective-input-group';
            
            const label = document.createElement('label');
            label.textContent = `${i}.`;
            label.htmlFor = `adjective-${i}-${question.id}`;
            
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `adjective-${i}-${question.id}`;
            input.className = 'adjective-input';
            
            inputGroup.appendChild(label);
            inputGroup.appendChild(input);
            container.appendChild(inputGroup);
            
            // Add event listener for edit tracking
            input.addEventListener('input', function() {
                const values = getAdjectiveValues(question.id);
                trackEdit(question.id, values);
            });
        }
        
        responseContainer.appendChild(container);
    }

    function createRadioInput(question) {
        const container = document.createElement('div');
        container.className = 'radio-container';
        
        question.options.forEach((option, index) => {
            const radioGroup = document.createElement('div');
            radioGroup.className = 'radio-group';
            
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.id = `radio-${question.id}-${index}`;
            radio.name = `radio-${question.id}`;
            radio.value = option.value;
            
            const label = document.createElement('label');
            label.htmlFor = `radio-${question.id}-${index}`;
            label.textContent = option.label;
            
            radioGroup.appendChild(radio);
            radioGroup.appendChild(label);
            container.appendChild(radioGroup);
            
            // Add event listener for edit tracking
            radio.addEventListener('change', function() {
                if (this.checked) {
                    trackEdit(question.id, this.value);
                }
            });
        });
        
        responseContainer.appendChild(container);
    }

    function createScaleInput(question) {
        const container = document.createElement('div');
        container.className = 'scale-container';
        
        const scaleLabels = document.createElement('div');
        scaleLabels.className = 'scale-labels';
        
        const leftLabel = document.createElement('span');
        leftLabel.textContent = question.scaleStart || 'Strongly Disagree';
        
        const rightLabel = document.createElement('span');
        rightLabel.textContent = question.scaleEnd || 'Strongly Agree';
        
        scaleLabels.appendChild(leftLabel);
        scaleLabels.appendChild(rightLabel);
        container.appendChild(scaleLabels);
        
        const scaleValues = document.createElement('div');
        scaleValues.className = 'scale-values';
        
        for (let i = 1; i <= 7; i++) {
            const scaleItem = document.createElement('div');
            scaleItem.className = 'scale-item';
            
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.id = `scale-${question.id}-${i}`;
            radio.name = `scale-${question.id}`;
            radio.value = i;
            
            const label = document.createElement('label');
            label.htmlFor = `scale-${question.id}-${i}`;
            label.textContent = i;
            
            scaleItem.appendChild(radio);
            scaleItem.appendChild(label);
            scaleValues.appendChild(scaleItem);
            
            // Add event listener for edit tracking
            radio.addEventListener('change', function() {
                if (this.checked) {
                    trackEdit(question.id, this.value);
                }
            });
        }
        
        container.appendChild(scaleValues);
        responseContainer.appendChild(container);
    }

    function createAudioInput(question) {
        const container = document.createElement('div');
        container.className = 'audio-container';
        
        const textareaContainer = document.createElement('div');
        
        const textarea = document.createElement('textarea');
        textarea.id = `response-${question.id}`;
        textarea.className = 'textarea-input';
        textarea.placeholder = 'Enter your response here or use the audio recording option below...';
        
        textareaContainer.appendChild(textarea);
        container.appendChild(textareaContainer);
        
        const audioRecordContainer = document.createElement('div');
        audioRecordContainer.className = 'audio-record';
        
        const recordButton = document.createElement('button');
        recordButton.type = 'button';
        recordButton.className = 'record-button';
        recordButton.innerHTML = '<i class="fas fa-microphone"></i>';
        recordButton.setAttribute('aria-label', 'Record audio response');
        
        const audioStatus = document.createElement('span');
        audioStatus.className = 'audio-status';
        audioStatus.textContent = 'Click to record audio (optional)';
        
        audioRecordContainer.appendChild(recordButton);
        audioRecordContainer.appendChild(audioStatus);
        container.appendChild(audioRecordContainer);
        
        // Audio playback area (hidden initially)
        const audioPlayback = document.createElement('div');
        audioPlayback.className = 'audio-playback hidden';
        audioPlayback.id = `audio-playback-${question.id}`;
        
        container.appendChild(audioPlayback);
        responseContainer.appendChild(container);
        
        // Add event listeners
        textarea.addEventListener('input', function() {
            trackEdit(question.id, this.value);
        });
        
        recordButton.addEventListener('click', function() {
            toggleAudioRecording(question.id, recordButton, audioStatus, audioPlayback);
        });
    }

    function toggleAudioRecording(questionId, button, audioStatus, audioPlayback) {
        if (!isRecording) {
            // Start recording
            startAudioRecording(questionId, button, audioStatus, audioPlayback);
        } else {
            // Stop recording
            stopAudioRecording(questionId, button, audioStatus, audioPlayback);
        }
    }

    async function startAudioRecording(questionId, button, audioStatus, audioPlayback) {
        try {
            audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioRecorder = new MediaRecorder(audioStream);
            
            const audioChunks = [];
            
            audioRecorder.addEventListener("dataavailable", (event) => {
                audioChunks.push(event.data);
            });
            
            audioRecorder.addEventListener("stop", () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                recordedAudio = audioBlob;
                
                // Create an audio element for playback
                const audioURL = URL.createObjectURL(audioBlob);
                const audioElement = document.createElement('audio');
                audioElement.src = audioURL;
                audioElement.controls = true;
                
                audioPlayback.innerHTML = '';
                audioPlayback.appendChild(audioElement);
                audioPlayback.classList.remove('hidden');
                
                // Save the audio response
                responses[questionId].audio = audioBlob;
                
                // Release the microphone
                audioStream.getTracks().forEach(track => track.stop());
            });
            
            // Start recording
            audioRecorder.start();
            isRecording = true;
            
            // Update UI
            button.classList.add('recording');
            audioStatus.textContent = 'Recording... Click to stop';
            
        } catch (error) {
            console.error("Error accessing microphone:", error);
            audioStatus.textContent = 'Could not access microphone. Please check permissions.';
        }
    }

    function stopAudioRecording(questionId, button, audioStatus, audioPlayback) {
        if (audioRecorder && isRecording) {
            audioRecorder.stop();
            isRecording = false;
            
            // Update UI
            button.classList.remove('recording');
            audioStatus.textContent = 'Recording saved. Click to record again.';
        }
    }

    function getAdjectiveValues(questionId) {
        const values = [];
        for (let i = 1; i <= 5; i++) {
            const input = document.getElementById(`adjective-${i}-${questionId}`);
            values.push(input.value);
        }
        return values;
    }

    function loadExistingResponse(question) {
        const response = responses[question.id];
        
        switch(question.type) {
            case 'text':
                document.getElementById(`response-${question.id}`).value = response.value || '';
                break;
                
            case 'textarea':
                document.getElementById(`response-${question.id}`).value = response.value || '';
                break;
                
            case 'adjectives':
                if (response.value && Array.isArray(response.value)) {
                    for (let i = 0; i < response.value.length; i++) {
                        if (document.getElementById(`adjective-${i+1}-${question.id}`)) {
                            document.getElementById(`adjective-${i+1}-${question.id}`).value = response.value[i] || '';
                        }
                    }
                }
                break;
                
            case 'radio':
                if (response.value) {
                    const radios = document.querySelectorAll(`input[name="radio-${question.id}"]`);
                    radios.forEach(radio => {
                        if (radio.value === response.value) {
                            radio.checked = true;
                        }
                    });
                }
                break;
                
            case 'scale':
                if (response.value) {
                    const scales = document.querySelectorAll(`input[name="scale-${question.id}"]`);
                    scales.forEach(scale => {
                        if (scale.value === response.value) {
                            scale.checked = true;
                        }
                    });
                }
                break;
                
            case 'audio':
                document.getElementById(`response-${question.id}`).value = response.value || '';
                if (response.audio) {
                    const audioPlayback = document.getElementById(`audio-playback-${question.id}`);
                    audioPlayback.innerHTML = '';
                    
                    const audioURL = URL.createObjectURL(response.audio);
                    const audioElement = document.createElement('audio');
                    audioElement.src = audioURL;
                    audioElement.controls = true;
                    
                    audioPlayback.appendChild(audioElement);
                    audioPlayback.classList.remove('hidden');
                }
                break;
        }
    }

    function validateCurrentResponse() {
        const question = questions[currentQuestionIndex];
        let isValid = true;
        let errorMessage = '';
        
        // Remove any existing error messages
        const existingError = document.querySelector('.error-text');
        if (existingError) {
            existingError.remove();
        }
        
        if (question.required) {
            switch(question.type) {
                case 'text':
                    const textInput = document.getElementById(`response-${question.id}`);
                    if (!textInput.value.trim()) {
                        isValid = false;
                        errorMessage = 'Please provide a response before continuing.';
                    }
                    break;
                    
                case 'textarea':
                    const textareaInput = document.getElementById(`response-${question.id}`);
                    if (!textareaInput.value.trim()) {
                        isValid = false;
                        errorMessage = 'Please provide a response before continuing.';
                    }
                    break;
                    
                case 'adjectives':
                    const adjectiveValues = getAdjectiveValues(question.id);
                    // Check if at least one adjective is provided
                    if (!adjectiveValues.some(value => value.trim() !== '')) {
                        isValid = false;
                        errorMessage = 'Please provide at least one word or phrase.';
                    }
                    break;
                    
                case 'radio':
                    const selectedRadio = document.querySelector(`input[name="radio-${question.id}"]:checked`);
                    if (!selectedRadio) {
                        isValid = false;
                        errorMessage = 'Please select an option before continuing.';
                    }
                    break;
                    
                case 'scale':
                    const selectedScale = document.querySelector(`input[name="scale-${question.id}"]:checked`);
                    if (!selectedScale) {
                        isValid = false;
                        errorMessage = 'Please select a value on the scale before continuing.';
                    }
                    break;
            }
        }
        
        if (!isValid) {
            // Display error message
            const errorElement = document.createElement('p');
            errorElement.className = 'error-text';
            errorElement.textContent = errorMessage;
            responseContainer.appendChild(errorElement);
        }
        
        return isValid;
    }

    function saveCurrentResponse() {
        const question = questions[currentQuestionIndex];
        let responseValue;
        
        switch(question.type) {
            case 'text':
                responseValue = document.getElementById(`response-${question.id}`).value;
                break;
                
            case 'textarea':
                responseValue = document.getElementById(`response-${question.id}`).value;
                break;
                
            case 'adjectives':
                responseValue = getAdjectiveValues(question.id);
                break;
                
            case 'radio':
                const selectedRadio = document.querySelector(`input[name="radio-${question.id}"]:checked`);
                responseValue = selectedRadio ? selectedRadio.value : null;
                break;
                
            case 'scale':
                const selectedScale = document.querySelector(`input[name="scale-${question.id}"]:checked`);
                responseValue = selectedScale ? selectedScale.value : null;
                break;
                
            case 'audio':
                responseValue = document.getElementById(`response-${question.id}`).value;
                // Audio blob is saved separately in the toggleAudioRecording function
                break;
        }
        
        // Save the response
        if (!responses[question.id]) {
            responses[question.id] = {};
        }
        
        responses[question.id].value = responseValue;
        responses[question.id].timeSpent = timeOnQuestion;
        responses[question.id].editHistory = editHistory.filter(edit => edit.questionId === question.id);
        
        // Reset edit history for the next question
        editHistory = editHistory.filter(edit => edit.questionId !== question.id);
    }

    function trackEdit(questionId, value) {
        const timestamp = new Date().getTime();
        editHistory.push({
            questionId,
            timestamp,
            value
        });
    }

    function shouldShowFollowUp(question) {
        if (!question.followUp) return false;
        
        const response = responses[question.id];
        if (!response) return false;
        
        // Custom logic to determine if follow-up should show based on the response
        if (question.followUpCondition) {
            return evaluateFollowUpCondition(question, response);
        }
        
        // Default to showing follow-up
        return true;
    }

    function evaluateFollowUpCondition(question, response) {
        // This function would contain custom logic for each question
        // For example, show follow-up if a certain option was selected or text contains keywords
        
        switch(question.id) {
            case 'rejection_experience':
                // Show follow-up if they answered yes to rejection experiences
                return response.value === 'yes';
                
            case 'separation_memory':
                // Always show follow-up for separation memory
                return true;
                
            case 'comfort_seeking':
                // Show follow-up if they mentioned seeking comfort
                return response.value && response.value.toLowerCase().includes('comfort');
                
            default:
                return true;
        }
    }

    function showFollowUp(question) {
        followupActive = true;
        followupContainer.classList.remove('hidden');
        
        // Clear previous follow-up content
        followupContainer.innerHTML = '';
        
        const followUpHeading = document.createElement('h3');
        followUpHeading.textContent = 'Additional Question';
        followupContainer.appendChild(followUpHeading);
        
        const followUpText = document.createElement('p');
        followUpText.textContent = question.followUp.text;
        followupContainer.appendChild(followUpText);
        
        // Create input for follow-up based on type
        const followUpInput = document.createElement('textarea');
        followUpInput.id = `followup-${question.id}`;
        followUpInput.className = 'textarea-input';
        followUpInput.placeholder = 'Enter your response...';
        followupContainer.appendChild(followUpInput);
        
        // Load existing follow-up response if available
        if (responses[question.id] && responses[question.id].followUpResponse) {
            followUpInput.value = responses[question.id].followUpResponse;
        }
        
        // Add event listener to save follow-up response
        followUpInput.addEventListener('input', function() {
            if (!responses[question.id]) {
                responses[question.id] = {};
            }
            responses[question.id].followUpResponse = this.value;
        });
    }

    function resetQuestionTimer() {
        clearInterval(questionTimer);
        timeOnQuestion = 0;
        timeCounter.textContent = '0:00';
    }

    function startQuestionTimer() {
        questionStartTime = new Date().getTime();
        
        questionTimer = setInterval(() => {
            const currentTime = new Date().getTime();
            timeOnQuestion = Math.floor((currentTime - questionStartTime) / 1000);
            
            const minutes = Math.floor(timeOnQuestion / 60);
            const seconds = timeOnQuestion % 60;
            
            timeCounter.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    function updateProgressBar() {
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
        progressBar.style.width = `${progress}%`;
    }

    function completeAssessment() {
        saveCurrentResponse();
        saveAssessmentData();
        
        questionContainer.classList.remove('active');
        completionScreen.classList.add('active');
    }

    function saveAssessmentData() {
        // Save to localStorage for demo purposes
        localStorage.setItem('dahaResponses', JSON.stringify(responses));
        localStorage.setItem('dahaProgress', currentQuestionIndex);
    }

    function loadSavedData() {
        const savedResponses = localStorage.getItem('dahaResponses');
        const savedProgress = localStorage.getItem('dahaProgress');
        
        if (savedResponses) {
            responses = JSON.parse(savedResponses);
        }
        
        if (savedProgress) {
            currentQuestionIndex = parseInt(savedProgress);
        }
    }

    function generateResults() {
        const resultsContainer = document.getElementById('results-container');
        resultsContainer.innerHTML = '';
        
        // This is a simplified results generation for demo purposes
        // A real implementation would analyze responses and generate insights
        
        const patterns = analyzeResponses();
        
        // Create summary sections
        createAttachmentSummary(resultsContainer, patterns);
        createRelationshipPatternsSummary(resultsContainer, patterns);
        createEmotionalRegulationSummary(resultsContainer, patterns);
    }

    function analyzeResponses() {
        // This is a placeholder for response analysis
        // A real implementation would use algorithms to interpret response patterns
        
        return {
            narrativeCoherence: calculateNarrativeCoherence(),
            emotionalRegulation: calculateEmotionalRegulation(),
            relationshipRepresentations: calculateRelationshipRepresentations(),
            metacognitiveCapacity: calculateMetacognitiveCapacity(),
            traumaResolution: calculateTraumaResolution()
        };
    }

    function calculateNarrativeCoherence() {
        // Placeholder for narrative coherence calculation
        return 0.75; // Scale 0-1
    }

    function calculateEmotionalRegulation() {
        // Placeholder for emotional regulation calculation
        return 0.6; // Scale 0-1
    }

    function calculateRelationshipRepresentations() {
        // Placeholder for relationship representations calculation
        return 0.8; // Scale 0-1
    }

    function calculateMetacognitiveCapacity() {
        // Placeholder for metacognitive capacity calculation
        return 0.7; // Scale 0-1
    }

    function calculateTraumaResolution() {
        // Placeholder for trauma resolution calculation
        return 0.9; // Scale 0-1
    }

    function createAttachmentSummary(container, patterns) {
        const section = document.createElement('div');
        section.className = 'results-section';
        
        const heading = document.createElement('h3');
        heading.textContent = 'Attachment Patterns';
        section.appendChild(heading);
        
        const description = document.createElement('p');
        description.textContent = 'Based on your responses, here are some insights about your attachment patterns:';
        section.appendChild(description);
        
        const patternsList = document.createElement('ul');
        
        // These would be generated based on actual response analysis
        const patternItems = [
            'You show a balanced perspective when discussing both positive and challenging aspects of early relationships.',
            'Your responses indicate thoughtful reflection about how childhood experiences have influenced your adult relationships.',
            'You demonstrate flexibility in how you view your early caregiving experiences.'
        ];
        
        patternItems.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = item;
            patternsList.appendChild(listItem);
        });
        
        section.appendChild(patternsList);
        container.appendChild(section);
    }

    function createRelationshipPatternsSummary(container, patterns) {
        const section = document.createElement('div');
        section.className = 'results-section';
        
        const heading = document.createElement('h3');
        heading.textContent = 'Relationship Dynamics';
        section.appendChild(heading);
        
        const description = document.createElement('p');
        description.textContent = 'Your responses suggest these patterns in how you approach relationships:';
        section.appendChild(description);
        
        const patternsList = document.createElement('ul');
        
        // These would be generated based on actual response analysis
        const patternItems = [
            'You value emotional connection while maintaining healthy boundaries.',
            'You recognize both strengths and challenges in your relationship history.',
            'You show awareness of how your early experiences shape your current relationship expectations.'
        ];
        
        patternItems.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = item;
            patternsList.appendChild(listItem);
        });
        
        section.appendChild(patternsList);
        container.appendChild(section);
    }

    function createEmotionalRegulationSummary(container, patterns) {
        const section = document.createElement('div');
        section.className = 'results-section';
        
        const heading = document.createElement('h3');
        heading.textContent = 'Emotional Processing';
        section.appendChild(heading);
        
        const description = document.createElement('p');
        description.textContent = 'Here are insights about how you process emotions based on your responses:';
        section.appendChild(description);
        
        const patternsList = document.createElement('ul');
        
        // These would be generated based on actual response analysis
        const patternItems = [
            'You demonstrate an ability to acknowledge and process difficult emotions.',
            'You show a balanced approach to emotional expression and regulation.',
            'You can reflect on emotional experiences without becoming overwhelmed by them.'
        ];
        
        patternItems.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = item;
            patternsList.appendChild(listItem);
        });
        
        section.appendChild(patternsList);
        container.appendChild(section);
    }

    function downloadResponses() {
        const responseData = JSON.stringify(responses, null, 2);
        const blob = new Blob([responseData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'daha_responses.json';
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }

    function downloadReport() {
        // Create a formatted report
        let reportContent = "Digital Attachment History Assessment (DAHA) - Personal Report\n\n";
        reportContent += "Date: " + new Date().toLocaleDateString() + "\n\n";
        reportContent += "SUMMARY INSIGHTS\n";
        reportContent += "=================\n\n";
        
        // Add pattern insights
        reportContent += "Attachment Patterns:\n";
        reportContent += "- You show a balanced perspective when discussing both positive and challenging aspects of early relationships.\n";
        reportContent += "- Your responses indicate thoughtful reflection about how childhood experiences have influenced your adult relationships.\n";
        reportContent += "- You demonstrate flexibility in how you view your early caregiving experiences.\n\n";
        
        reportContent += "Relationship Dynamics:\n";
        reportContent += "- You value emotional connection while maintaining healthy boundaries.\n";
        reportContent += "- You recognize both strengths and challenges in your relationship history.\n";
        reportContent += "- You show awareness of how your early experiences shape your current relationship expectations.\n\n";
        
        reportContent += "Emotional Processing:\n";
        reportContent += "- You demonstrate an ability to acknowledge and process difficult emotions.\n";
        reportContent += "- You show a balanced approach to emotional expression and regulation.\n";
        reportContent += "- You can reflect on emotional experiences without becoming overwhelmed by them.\n\n";
        
        reportContent += "DETAILED RESPONSES\n";
        reportContent += "=================\n\n";
        
        // Add individual responses
        questions.forEach(question => {
            if (responses[question.id]) {
                reportContent += question.text + "\n";
                
                if (typeof responses[question.id].value === 'string') {
                    reportContent += "Response: " + responses[question.id].value + "\n";
                } else if (Array.isArray(responses[question.id].value)) {
                    reportContent += "Response: " + responses[question.id].value.join(", ") + "\n";
                }
                
                if (responses[question.id].followUpResponse) {
                    reportContent += "Follow-up: " + responses[question.id].followUpResponse + "\n";
                }
                
                reportContent += "Time spent: " + formatTime(responses[question.id].timeSpent) + "\n\n";
            }
        });
        
        // Download as text file
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'daha_report.txt';
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    }

    function showModal(title, content) {
        modalTitle.textContent = title;
        modalContent.innerHTML = content;
        modalContainer.classList.remove('hidden');
        setTimeout(() => {
            modalContainer.classList.add('visible');
        }, 10);
    }

    function closeModal() {
        modalContainer.classList.remove('visible');
        setTimeout(() => {
            modalContainer.classList.add('hidden');
        }, 300);
    }

    // Check for saved data on load
    loadSavedData();
