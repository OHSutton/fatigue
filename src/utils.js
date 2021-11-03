// mapping of Fatigue code to text status
export const FatigueStatus = {
  'F0': 'Awake',
  'F1': 'Slightly Fatigued',
  'F2': 'Fatigued',
  'F3': 'Very Fatigued',
  'F4': 'Extremely Fatigued'
}

// Colour of fatigue level when displayed
export const FatigueColours = {
  'F0': 'DodgerBlue',
  'F1': 'Green',
  'F2': 'Orange',
  'F3': 'OrangeRed',
  'F4': 'Maroon'

}

// Base settings
export const Guest = {
  "id": 0,
  "name": "Guest",
  "F1": {
    "type": "auditory",
    "level": 100
  },
  "F2": {
    "type": "trivia",
    "level": 100,
  },
  "F3": {
    "type": "vibrator",
    "level": 100
  },
  "F4": {
    "type": "parking"
  }
}

// Time Question is displayed on screen
export const QuestionTime = 20

// Total trivia time (includes question & answer)
// TriviaTime-QuestionTime = Time Answer is displayed
// so 30-20 = 10 seconds for the anwer
export const TriviaTime = 25
