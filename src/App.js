import React, { Component } from 'react'
import NoteEditor from './components/NoteEditor'
import './App.css'

class App extends Component {
  render() {
    return (
      <div className="app">
        <NoteEditor className="editor"/>
      </div>
    )
  }
}

export default App;
