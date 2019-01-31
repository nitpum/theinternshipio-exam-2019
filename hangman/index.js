const fs        = require('fs')
const path      = require('path')
const readline  = require('readline')

let score       = 0
let catagory    = []
let wordList    = []
let quizNum     = 0
let maxQuiz     = 10
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

        catagory.push(JSON.parse(data))
        resolve()
      }
    )
  })
}

function randomWord(words) {
  return new Promise((resolve, reject) => {
    if (words.length == 0) reject(`No word to quess`)
    let length = words.length
    guess = words[Math.floor(Math.random() * length)]
    guess.char = [...guess.word] // Convert to array easier for check char
    console.log(`[${quizNum}/${maxQuiz}] *Hint: ${guess.hint}`)
    resolve(guess)
  })
}

function startNewGuess() {
  quizNum++
  clearGuessed(0)
  randomWord(wordList).then(_ => askAnwser())
}

function askCatagory() {
  console.log(`Select catagory`)
  // Print catagory list
  for (const [i, value] of catagory.entries()) {
    console.log(`${i + 1}) ${value['name']} `)
  }
  rl.question('Select catagory: ', anwser => {
    selectCat = anwser - 1
    changeState(1) // Change to playing state
    wordList = catagory[selectCat]['words']
    console.log(`\n=> ${catagory[selectCat]['name']} <=`)
    startNewGuess()
  })
}

function askAnwser() {
  remaining = [...guess.word.toLowerCase()].map(wordCensor).join('')
  rl.question(`${remaining}\n> `, anwser => {
    anwser = anwser.toLowerCase()
    if ([...anwser].length > 1) {
      console.log(`Please enter single character`)
      return askAnwser()
    }
    if (!guess.char.includes(anwser)) {
      guessed.wrong.push(anwser)
    } else {
      guessed.right.push(anwser)
      if (guess.char.every(x => !x.toLowerCase().match(/[a-z]/) || guessed.right.includes(x))) {
        console.log('Correct !\n')
        if (quizNum === maxQuiz) {
          // End game
          changeState(0)
          reset()
          return askCatagory()
        }
        return startNewGuess()
      }
    }
    return askAnwser()
  })
}

function reset() {
  quizNum = 0
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
    askCatagory()
  })
})
