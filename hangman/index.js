const fs        = require('fs')
const path      = require('path')
const readline  = require('readline')

let totalScore  = 0
let totalWrong  = 0
let totalSkip   = 0
let score       = 0
let catagory    = []
let wordList    = []
let usedIndex   = []
let quizNum     = 0
let maxQuiz     = 5
let maxWrong    = 0
let penaltyStack= 0
let selectCat   = -1
let state       = 0 // 0 = select catagory, 1 = playing
let remaining   = ""
let guess       = {}
let guessed     = {}

function changeState(toState) {
  state = toState
}

function readCatagoryFile(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(
      path.join(__dirname, './catagory', filename),
      'utf8',
      (err, data) => {
        if (err) reject(`Can\'t load ${filename} in catagory.`)
        let d = JSON.parse(data)
        if (d.words.length >= maxQuiz)
          catagory.push(d)
        else {
          console.log(`File "${filename}" \t\t Not enough words. required at least 5`)
        }
        resolve()
      }
    )
  })
}

function randomWord(words) {
  return new Promise((resolve, reject) => {
    if (words.length == 0) reject(`No word to quess`)
    let length = words.length
    let index = Math.floor(Math.random() * length)
    do
    {
      index = Math.floor(Math.random() * length)
    } while(usedIndex.includes(index))
    usedIndex.push(index)
    guess = words[index]
    guess.char = [...guess.word] // Convert to array easier for check char
    guess.char = guess.char.map(x => x.toLowerCase())
    maxWrong = parseInt(guess.word.length / 2)
    console.log(`[${quizNum}/${maxQuiz}] *Hint: ${guess.hint}`)
    resolve(guess)
  })
}

function startNewGuess() {
  quizNum     += 1
  totalWrong  += guessed.wrong.length
  score        = 0
  penaltyStack = 0
  clearGuessed()
  randomWord(wordList).then(_ => askAnwser())
}

function skip() {
  console.log(`\n--- Skipped ---\n`)
  totalSkip   += 1
  startNewGuess()
}

function showCatagoryAndAsk() {
  console.log(`Catagory list`)
  // Print catagory list
  for (const [i, value] of catagory.entries()) {
    console.log(`${i + 1}) ${value['name']} `)
  }
  reset()
  askCatagory()
}

function askCatagory() {
  rl.question(`> ` , anwser => {
    if (!anwser.match(/[0-9]/) || anwser.length < 1 || anwser > catagory.length || anwser < 1) {
      console.log(`Please enter number of catagory`)
      return askCatagory()
    }
    selectCat = anwser - 1
    changeState(1) // Change to playing state
    wordList = catagory[selectCat]['words']
    console.log(`\n=> ${catagory[selectCat]['name']} <=`)
    startNewGuess()
  })
}

function askAnwser() {
  remaining = [...guess.word.toLowerCase()].map(wordCensor).join('')
  let wrongCount = guessed.wrong.length
  score = 0
  rl.question(`${remaining} \t wrong [${wrongCount}/${maxWrong}], score: ${totalScore} \n> `, anwser => {
    anwser = anwser.toLowerCase()
    if ([...anwser].length != 1) {
      console.log(`Please enter single character`)
      return askAnwser()
    }
    if (!guess.char.includes(anwser)) {
      if (maxWrong - guessed.wrong.length < -10)
        skip()

      guessed.wrong.push(anwser)
      let penalty = (guessed.wrong.length > maxWrong)? Math.max(maxWrong - guessed.wrong.length, -5): 0
      penaltyStack += penalty
      penaltyStack = Math.max(penaltyStack, -9)
      console.log(`Wrong ! Penalty: ${penaltyStack}`)
    } else if (!guessed.right.includes(anwser)) {
      guessed.right.push(anwser.toLowerCase())
      score += 10 + Math.max(penaltyStack, -9)
      totalScore += score
      console.log(`Score: +${score}`)
      // End
      if (guess.char.every(x => !x.toLowerCase().match(/[a-z]/) || guessed.right.includes(x.toLowerCase()))) {
        let guessCount = guessed.wrong.length
        let msg = `" ${guess.word.toUpperCase()} " \t| wrong count: ${guessCount}, score: ${totalScore}`
        console.log(`${msg}\n`)
        if (quizNum === maxQuiz) {
          // End game
          changeState(0)
          console.log(`\n==========================================`)
          console.log(`\t> Total Score:\t ${totalScore}`)
          console.log(`\t> Total Wrong:\t ${totalWrong}`)
          console.log(`\t> Total Skip:\t ${totalSkip}`)
          console.log(`==========================================\n`)
          return showCatagoryAndAsk()
        }
        // New guess        
        return startNewGuess()
      }
    }
    return askAnwser()
  })
}

function reset() {
  quizNum       = 0
  score         = 0
  totalScore    = 0
  totalWrong    = 0
  totalSkip     = 0
  maxWrong      = 0  
  penaltyStack  = 0
  usedIndex     = []
  clearGuessed()
}

function clearGuessed() {
  guessed = {
    right:        [],
    wrong:        []
  }
}

function isGuessed(char) {
  return guessed.right.includes(char) || guessed.wrong.includes(char)
}

function wordCensor(char) {
  return (guessed.right.includes(char) || guessed.wrong.includes(char) || !char.toLowerCase().match(/[a-z]/))? `${char} `: '_ '
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// Load all catagory files
fs.readdir(path.join(__dirname, './catagory'), (err, items) => {
  if (err) throw new Error("Can't load catagory file!")

  // Read all catagory files and let player select
  Promise.all(items.map(readCatagoryFile)).then(() => {
    if (catagory.length == 0) {
      console.log(`Can't load any catagory files to play. Please check catagory files are valid`)
      return
    }
    showCatagoryAndAsk()
  })
})
