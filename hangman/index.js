const fs        = require('fs')
const path      = require('path')
const readline  = require('readline')

let scorre      = 0
let catagory    = []
let words       = []
let selectCat   = -1
let state       = 0 // 0 = select catagory,

function readCatagory(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(
      path.join(__dirname, './catagory', filename),
      'utf8',
      (err, data) => {
        if (err) reject(`Can\'t load ${filename} in catagory.`)

        words.push(JSON.parse(data))
        resolve()
      }
    )
  })
}

function randomWord(words) {

  rl.question()
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// rl.on('line', line => {
//   if (state == 0) {
//     selectCat = line - 1
//     state = 1
//     console.log(`${words[selectCat]['name']} `)
//   } else if (state == 1) {

//   }
// })

fs.readdir(path.join(__dirname, './catagory'), (err, items) => {
  if (err) throw new Error("Can't load catagory file!")

  rl.pause()
  // Read all catagory files and let player select
  Promise.all(items.map(readCatagory)).then(() => {
    console.log(`Select catagory`)
    for (const [i, value] of words.entries()) {
      console.log(`${i + 1}) ${value['name']} `)
    }
    rl.resume()
    rl.question('Select catagory: ', anwser => {
      selectCat = anwser - 1
      state = 1
      console.log(`${words[selectCat]['name']} `)
    })
  })
})

// Event
