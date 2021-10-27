import requests

trivia = "http://localhost:3002/trivia"
fatigue = "http://localhost:3002/fatigue"
photo = "http://localhost:3002/photo"


def send_trivia(question: str, answer: str):
    data = {
        "question": question,
        "answer": answer,
    }

    x = requests.post(trivia, data=data)
    print(x.text)




"""
Fatigue Levels:
{
	"F0": "Awake" (No fatigue),
	"F1": "Slightly Fatigued",
	"F2": "Fatigued",
	"F3": "Very Fatigued",
	"F4": "Extreme Fatigue",
}

"""

"""
Example usage:


Example 1.

Trivia:
	Question = "What is the biggest mountain in the world?"
	Answer = "Mt Everest"

--> Call: send_trivia(Question, Answer)



Example 2.

If detect slight fatigue:

---> send_fatigue_level("F1")

"""

import sys
if __name__ == "__main__":
    send_trivia(sys.argv[1], sys.argv[2])
