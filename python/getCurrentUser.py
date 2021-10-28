import json



def getCurrentUser():
    user = {}
    with open("../db.json") as f:
        user = json.load(f)
    return user["current-user"]


triviaPos = 0
def getNextTrivia():
    triv = []

    with open("../trivia.txt") as f:
        for line in f.readlines():
            triv.append(line.strip().split("/"))

    triviaPos = (triviaPos + 1)  % len(triv)
    return triv[triviaPos]