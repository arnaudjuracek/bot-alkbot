#!/bin/bash
const path = require('path')
const Markov = require('markov-strings').default
const fetch = require('node-fetch')

require('dotenv').config({ path: path.resolve(__dirname, '.env') })

const ADJECTIVES = require('./dictionnaries/adjectives.json')
const MARKOV = require('./dictionnaries/markov.json')
const PREFIXES = require('./dictionnaries/prefixes.json')
const PUTES = require('./dictionnaries/putes.json')

const randomOf = arr => arr[Math.floor(Math.random() * arr.length)]
const capitalize = string => string[0].toUpperCase() + string.slice(1, string.length)

const STRATEGIES = {
  prefix: () => randomOf(PREFIXES).split('-').shift() + 'pute',
  putes: () => randomOf(PUTES),
  adjective: () => randomOf(ADJECTIVES) + ' pute',
  markov: function () {
    const markov = new Markov(MARKOV.samples, { stateSize: 1 })
    markov.buildCorpus()

    const result = markov.generate({
      maxTries: 200,
      prng: Math.random,
      filter: result => {
        return result.string.length < 140 &&
          result.score > 10 &&
          MARKOV.required.find(w => result.string.includes(w))
      }
    })

    return capitalize(result.string)
  }
}

const weightedStrategies = [
  'prefix',
  'putes',
  'adjective',
  'markov'
]

;(async () => {
  try {
    const raw = await fetch(process.env.POST, {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ value1: STRATEGIES[randomOf(weightedStrategies)]() })
    })

    const res = await raw.text()
    console.log(res)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
})()
