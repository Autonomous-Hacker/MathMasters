interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

let recognition: any = null;
let isListening = false;

export function startVoiceRecognition(): Promise<string> {
  return new Promise((resolve, reject) => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      reject(new Error("Speech recognition not supported in this browser"));
      return;
    }

    // Stop any existing recognition
    if (recognition) {
      recognition.stop();
    }

    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      isListening = true;
      console.log("Voice recognition started");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      console.log("Voice recognition result:", transcript);
      
      // Try to extract numbers from the transcript
      const numbers = transcript.match(/\d+/g);
      if (numbers && numbers.length > 0) {
        resolve(numbers[0]);
      } else {
        // Try to convert words to numbers
        const wordNumber = convertWordsToNumber(transcript.toLowerCase());
        if (wordNumber !== null) {
          resolve(wordNumber.toString());
        } else {
          reject(new Error("Could not understand the number. Please try again."));
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Voice recognition error:", event.error);
      isListening = false;
      
      let errorMessage = "Voice recognition failed. ";
      switch (event.error) {
        case "no-speech":
          errorMessage += "No speech detected. Please try again.";
          break;
        case "audio-capture":
          errorMessage += "Microphone not accessible.";
          break;
        case "not-allowed":
          errorMessage += "Microphone permission denied.";
          break;
        default:
          errorMessage += "Please try again.";
      }
      
      reject(new Error(errorMessage));
    };

    recognition.onend = () => {
      isListening = false;
      console.log("Voice recognition ended");
    };

    // Start recognition
    try {
      recognition.start();
    } catch (error) {
      reject(new Error("Failed to start voice recognition"));
    }
  });
}

export function stopVoiceRecognition() {
  if (recognition) {
    recognition.stop();
    isListening = false;
  }
}

export function isVoiceRecognitionActive(): boolean {
  return isListening;
}

// Convert spoken numbers to digits
function convertWordsToNumber(text: string): number | null {
  const numberWords: { [key: string]: number } = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
    ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
    seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50,
    sixty: 60, seventy: 70, eighty: 80, ninety: 90, hundred: 100
  };

  // Simple word-to-number conversion
  for (const [word, number] of Object.entries(numberWords)) {
    if (text.includes(word)) {
      return number;
    }
  }

  // Handle compound numbers like "twenty-one"
  const words = text.split(/\s+/);
  let total = 0;
  let current = 0;

  for (const word of words) {
    const cleanWord = word.replace(/[^a-z]/g, '');
    if (numberWords[cleanWord] !== undefined) {
      const value = numberWords[cleanWord];
      if (value === 100) {
        current *= 100;
      } else if (value >= 20) {
        current += value;
      } else {
        current = value;
      }
      total += current;
      current = 0;
    }
  }

  return total > 0 ? total : null;
}
