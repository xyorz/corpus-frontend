import React from 'react'
import HantBox from './HantBox'

const mockItems = [
  {zh: '日', hant: '狗'},
  {zh: '日', hant: '狗'},
  {zh: '日', hant: '狗'},
  {zh: '日', hant: '狗'},
  {zh: '日', hant: '狗'},
]

function Hant(props) {
  return (
    <HantBox initialItems={mockItems} />
  )
}

export default Hant;