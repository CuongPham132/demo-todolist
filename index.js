
function normalizeName(rawName) {
    return rawName.toUpperCase().trim();
}

function isValidScore(scoreText) {
    const trimText = scoreText.trim()
    if (trimText === ""){
        return false
    }
    const score = Number(trimText)
    return score >= 0 && score <= 10;
}

function calcAverage(quizText, examText) {
    const quizTextnum = Number(quizText)
    const examTextnum = Number(examText)
    return (quizTextnum + examTextnum) / 2
}

function canGetCertificate(progressText, average) {
    const progressNum = Number(progressText)
    return progressNum >= 80 && average >= 5;
}

function buildScoreMessage(rawName, average) {
    const rawNametrim = rawName.trim()
    return "Học viên " + rawName + ": " + average + " điểm";
}


console.log(calcAverage(8.5, 9))
console.log(canGetCertificate("60", "9"))
console.log(buildScoreMessage(" trần thu hà ", 7.5))