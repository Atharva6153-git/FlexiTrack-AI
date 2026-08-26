export const EXERCISE_CONFIGS = {
  BICEP_CURL: {
    landmarks: {
      shoulder: 12,
      elbow: 14,
      wrist: 16
    },
    angles: {
      extended: 150, // > 150° means arm is extended (DOWN)
      flexed: 50     // < 50° means arm is curled (UP)
    }
  },
  SQUAT: {
    landmarks: {
      hip: 24,
      knee: 26,
      ankle: 28
    },
    angles: {
      standing: 160, // > 160° means standing (UP)
      squatted: 90   // < 90° means squatted (DOWN)
    }
  },
  KNEE_EXTENSION: {
    landmarks: {
      hip: 24,
      knee: 26,
      ankle: 28
    },
    angles: {
      extended: 160, // > 160° means leg extended (UP)
      flexed: 90     // < 90° means leg lowered/flexed (DOWN)
    }
  }
};

/**
 * Helper to trigger text-to-speech audio feedback.
 */
const speakFeedback = (text) => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    // Only speak if not currently speaking to avoid overlapping audio
    if (!window.speechSynthesis.speaking) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  }
};

/**
 * State machine to evaluate exercise repetitions.
 * @param {string} exerciseType - 'BICEP_CURL', 'SQUAT', or 'KNEE_EXTENSION'
 * @param {number} currentAngle - Calculated angle for the specific joint
 * @param {string} currentState - Current state of the repetition ('DOWN' or 'UP')
 * @returns {Object} { newState, isRepComplete, feedback }
 */
export const evaluateRepetition = (exerciseType, currentAngle, currentState) => {
  let newState = currentState;
  let isRepComplete = false;
  let feedback = '';

  const config = EXERCISE_CONFIGS[exerciseType];
  
  if (!config) {
    return { newState, isRepComplete, feedback: 'Invalid exercise type selected.' };
  }

  switch (exerciseType) {
    case 'BICEP_CURL':
      if (currentAngle > config.angles.extended) {
        if (currentState === 'UP') {
          newState = 'DOWN';
          isRepComplete = true;
          feedback = 'Good rep!';
          speakFeedback(feedback);
        } else {
          feedback = 'Arm extended. Ready to curl.';
        }
      } else if (currentAngle < config.angles.flexed) {
        if (currentState === 'DOWN') {
          newState = 'UP';
          feedback = 'Good flexion! Now lower slowly.';
        } else {
          feedback = 'Hold the curl and lower.';
        }
      } else {
        feedback = currentState === 'DOWN' ? 'Curl higher!' : 'Lower it further!';
      }
      break;

    case 'SQUAT':
      if (currentAngle > config.angles.standing) {
        if (currentState === 'DOWN') {
          newState = 'UP';
          isRepComplete = true;
          feedback = 'Good rep!';
          speakFeedback(feedback);
        } else {
          feedback = 'Standing tall. Ready to squat.';
        }
      } else if (currentAngle < config.angles.squatted) {
        if (currentState === 'UP') {
          newState = 'DOWN';
          feedback = 'Good depth! Now push up.';
        } else {
          feedback = 'Hold the depth and push up.';
        }
      } else {
        feedback = currentState === 'UP' ? 'Bend lower!' : 'Push up higher!';
      }
      break;

    case 'KNEE_EXTENSION':
      if (currentAngle < config.angles.flexed) {
        if (currentState === 'UP') {
          newState = 'DOWN';
          isRepComplete = true;
          feedback = 'Good rep!';
          speakFeedback(feedback);
        } else {
          feedback = 'Knee flexed. Ready to extend.';
        }
      } else if (currentAngle > config.angles.extended) {
        if (currentState === 'DOWN') {
          newState = 'UP';
          feedback = 'Fully extend! Now slowly lower.';
        } else {
          feedback = 'Hold extension and lower.';
        }
      } else {
        feedback = currentState === 'DOWN' ? 'Extend your leg further!' : 'Lower your leg further!';
      }
      break;

    default:
      break;
  }

  return {
    newState,
    isRepComplete,
    feedback
  };
};
