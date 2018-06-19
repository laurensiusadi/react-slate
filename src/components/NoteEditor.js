import React from 'react'
import debounce from 'lodash/debounce'
import { Editor } from 'slate-react'
import { Value } from 'slate'
import { isKeyHotkey } from 'is-hotkey'
import CheckListItem from './CheckListItem'

const existingValue = JSON.parse(localStorage.getItem('content'))

const initialValue = Value.fromJSON( existingValue || {
  document: {
    nodes: [
      {
        object: 'block',
        type: 'paragraph',
        nodes: [
          {
            object: 'text',
            leaves: [
              {
                text: 'A line of text in a paragraph.',
              },
            ],
          },
        ],
      },
    ],
  },
})

/* Define the default node type. */

const DEFAULT_NODE = 'paragraph'

/* Define hotkey matchers. */

const isBoldHotkey = isKeyHotkey('mod+b')
const isItalicHotkey = isKeyHotkey('mod+i')
const isUnderlinedHotkey = isKeyHotkey('mod+u')
const isCodeHotkey = isKeyHotkey('mod+`')

/* The rich text example. */

class NoteEditor extends React.Component {

  state = {
    value: initialValue,
  }

  /* Get the block type for a series of auto-markdown shortcut `chars`. */

  getType = chars => {
    switch (chars) {
      case '*':
      case '-':
      case '+':
      case '1.':
        return 'list-item'
      case '[]':
        return 'check-list-item'
      case '>':
        return 'block-quote'
      case '#':
        return 'heading-one'
      case '##':
        return 'heading-two'
      case '###':
        return 'heading-three'
      default:
        return null
    }
  }

  /* Check if the current selection has a mark with `type` in it. */

  hasMark = type => {
    const { value } = this.state
    return value.activeMarks.some(mark => mark.type === type)
  }

  /* Check if the any of the currently selected blocks are of `type`. */

  hasBlock = type => {
    const { value } = this.state
    return value.blocks.some(node => node.type === type)
  }

  iterateOverCheckListItems = debounce((change) => {
    console.log('called')
    change.operations
      .filter(opr =>
        // opr.type === 'remove_node' && 
        opr.node && opr.node.type === 'check-list-item')
      .map(opr => {
        // decide between opr.type set_node and remove_node
        console.log('ops:', opr.type,';', opr.node.text, opr.node.data.get('checked'))
        // if(opr.node.data.get('hoodie') === undefined) {
        //   change.setBlocks(opr.node.key, {data: { hoodie: 'task1234'} })
        // }
        // console.log('check: ', node.text, node.data.get('checked'), ';', node.data.get('hoodie'))
        return opr
      })
  }, 500 )

  /** On change, save the new `value`. */

  onChange = (change) => {
    if (change.value.document !== this.state.value.document) {
      const content = JSON.stringify(change.value.toJSON())
      localStorage.setItem('content', content)
      this.iterateOverCheckListItems(change)
    }
    this.setState({ value: change.value })
  }

  /* On key down, if it's a formatting command toggle a mark. */

  onKeyDown = (event, change) => {
    let mark

    if (isBoldHotkey(event)) {
      mark = 'bold'
    } else if (isItalicHotkey(event)) {
      mark = 'italic'
    } else if (isUnderlinedHotkey(event)) {
      mark = 'underlined'
    } else if (isCodeHotkey(event)) {
      mark = 'code'
    } else {
      switch (event.key) {
        case ' ':
          return this.onSpace(event, change)
        case 'Backspace':
          return this.onBackspace(event, change)
        case 'Enter':
          return this.onEnter(event, change)
        case 'Delete':
          return this.onDelete(event, change)
        default:
          return null
      }
    }
    
    event.preventDefault()
    change.toggleMark(mark)
    return true
  }

  /* When a mark button is clicked, toggle the current mark. */

  onClickMark = (event, type) => {
    event.preventDefault()
    const { value } = this.state
    const change = value.change().toggleMark(type)
    this.onChange(change)
  }

  /* When a block button is clicked, toggle the block type. */

  onClickBlock = (event, type) => {
    event.preventDefault()
    const { value } = this.state
    const change = value.change()
    const { document } = value

    // Handle everything but list buttons.
    if (type !== 'bulleted-list' && type !== 'numbered-list') {
      const isActive = this.hasBlock(type)
      const isList = this.hasBlock('list-item')

      if (isList) {
        change
          .setBlocks(isActive ? DEFAULT_NODE : type)
          .unwrapBlock('bulleted-list')
          .unwrapBlock('numbered-list')
      } else {
        change.setBlocks(isActive ? DEFAULT_NODE : type)
      }
    } else {
      // Handle the extra wrapping required for list buttons.
      const isList = this.hasBlock('list-item')
      const isType = value.blocks.some(block => {
        return !!document.getClosest(block.key, parent => parent.type === type)
      })

      if (isList && isType) {
        change
          .setBlocks(DEFAULT_NODE)
          .unwrapBlock('bulleted-list')
          .unwrapBlock('numbered-list')
      } else if (isList) {
        change
          .unwrapBlock(
            type === 'bulleted-list' ? 'numbered-list' : 'bulleted-list'
          )
          .wrapBlock(type)
      } else {
        change.setBlocks('list-item').wrapBlock(type)
      }
    }

    this.onChange(change)
  }

  render() {
    return (
      <div>
        {this.renderToolbar()}
        {this.renderEditor()}
      </div>
    )
  }

  renderToolbar() {
    return (
      <div className="menu toolbar-menu">
        {this.renderMarkButton('bold', 'format_bold')}
        {this.renderMarkButton('italic', 'format_italic')}
        {this.renderMarkButton('underlined', 'format_underlined')}
        {this.renderMarkButton('code', 'code')}
        {this.renderBlockButton('heading-one', 'looks_one')}
        {this.renderBlockButton('heading-two', 'looks_two')}
        {this.renderBlockButton('heading-three', 'looks_3')}
        {this.renderBlockButton('block-quote', 'format_quote')}
        {this.renderBlockButton('numbered-list', 'format_list_numbered')}
        {this.renderBlockButton('bulleted-list', 'format_list_bulleted')}
      </div>
    )
  }

  renderMarkButton = (type, icon) => {
    const isActive = this.hasMark(type)
    const onMouseDown = event => this.onClickMark(event, type)

    return (
      // eslint-disable-next-line react/jsx-no-bind
      <span className="button" onMouseDown={onMouseDown} data-active={isActive}>
        <span className="material-icons">{icon}</span>
      </span>
    )
  }

  renderBlockButton = (type, icon) => {
    let isActive = this.hasBlock(type)

    if (['numbered-list', 'bulleted-list'].includes(type)) {
      const { value } = this.state
      const parent = value.document.getParent(value.blocks.first().key)
      isActive = this.hasBlock('list-item') && parent && parent.type === type
    }
    const onMouseDown = event => this.onClickBlock(event, type)

    return (
      // eslint-disable-next-line react/jsx-no-bind
      <span className="button" onMouseDown={onMouseDown} data-active={isActive}>
        <span className="material-icons">{icon}</span>
      </span>
    )
  }

  renderEditor() {
    return (
      <div className="editor">
        <Editor
          placeholder="Enter some rich text..."
          spellCheck={false} autoCorrect={false}
          value={this.state.value}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          renderNode={this.renderNode}
          renderMark={this.renderMark}
        />
      </div>
    )
  }

  renderNode = props => {
    const { attributes, children, node } = props
    switch (node.type) {
      case 'block-quote':
        return <blockquote {...attributes}>{children}</blockquote>
      case 'bulleted-list':
        return <ul {...attributes}>{children}</ul>
      case 'numbered-list':
        return <ol {...attributes}>{children}</ol>
      case 'heading-one':
        return <h1 {...attributes}>{children}</h1>
      case 'heading-two':
        return <h2 {...attributes}>{children}</h2>
      case 'heading-three':
        return <h3 {...attributes}>{children}</h3>
      case 'heading-four':
        return <h4 {...attributes}>{children}</h4>
      case 'heading-five':
        return <h5 {...attributes}>{children}</h5>
      case 'heading-six':
        return <h6 {...attributes}>{children}</h6>
      case 'list-item':
        return <li {...attributes}>{children}</li>
      case 'check-list-item':
        return <CheckListItem {...props} />
      case 'paragraph':
      default: 
        return <p {...attributes}>{children}</p>
    }
  }

  renderMark = props => {
    const { children, mark, attributes } = props
    switch (mark.type) {
      case 'bold':
        return <strong {...attributes}>{children}</strong>
      case 'code':
        return <code {...attributes}>{children}</code>
      case 'italic':
        return <em {...attributes}>{children}</em>
      case 'underlined':
        return <u {...attributes}>{children}</u>
      default: 
        return
    }
  }

  /**
   * On space, if it was after an auto-markdown shortcut, convert the current
   * node into the shortcut's corresponding type.
   *
   * @param {Event} event
   * @param {Change} change
   */

  onSpace = (event, change) => {
    const { value } = change
    if (value.isExpanded) return

    const { startBlock, startOffset } = value
    const chars = startBlock.text.slice(0, startOffset).replace(/\s*/g, '')
    const type = this.getType(chars)

    if (!type) return
    if (type === 'list-item' && startBlock.type === 'list-item') return
    event.preventDefault()

    change.setBlocks(type)

    if (type === 'list-item') {
      if (chars === '1.') {
        change.wrapBlock('numbered-list')
      } else {
        change.wrapBlock('bulleted-list')
      }
    }

    change.extendToStartOf(startBlock).delete()
    return true
  }

  /**
   * On delete
   */

  onDelete = (event, change) => {
    const { value } = change
    if (value.isExpanded) return
    
    const { startBlock, endOffset, startKey, document } = value
    const nextBlock = document.getNextBlock(startKey)
    if (startBlock.type === 'paragraph') return

    /* Allow deleting empty check list next to empty check list */
    if (startBlock.type === 'check-list-item'
      && startBlock.text.length === 0
      && nextBlock && nextBlock.type === 'check-list-item'
      && nextBlock.text.length === 0) {}
      return

    /* Do not allow deleting next block with text,
      preventing merging check list */
    if (endOffset === startBlock.text.length && nextBlock.text.length > 0) return true

    /* Do not allow deleting empty check list */
    if (startBlock.type === 'check-list-item' && startBlock.text.length === 0) return true

    event.preventDefault()
    return
  }

  /**
   * On backspace, if at the start of a non-paragraph, convert it back into a
   * paragraph node.
   *
   * @param {Event} event
   * @param {Change} change
   */

  onBackspace = (event, change) => {
    const { value } = change
    if (value.isExpanded) return
    if (value.startOffset !== 0) return

    const { startBlock, startKey, document } = value
    const prevBlock = document.getPreviousBlock(startKey)

    /**
     * Do not allow deleting previous checklist block
     * |checklist|
     * < |text|
     */
    if (prevBlock && prevBlock.type === 'check-list-item'
      && startBlock.text.length !== 0)
      return true

    if (startBlock.type === 'paragraph') return

    /** 
     * Prevent changing checklist to paragraph
     * [] < text
     */
    if ( value.isCollapsed &&
      startBlock.type === 'check-list-item' &&
      value.selection.startOffset === 0 && prevBlock.text.length !== 0
    ) {
      // allow deleting empty check list (?)
      // if(startBlock.text.length === 0) return
      console.log('prevent removing check list:', startBlock.text.length)
      return true
    }    

    event.preventDefault()
    change.setBlocks('paragraph')

    if (startBlock.type === 'list-item') {
      change.unwrapBlock('bulleted-list').unwrapBlock('numbered-list')
    }

    return true
  }

  /**
   * On return, if at the end of a node type that should not be extended,
   * create a new paragraph below it.
   *
   * @param {Event} event
   * @param {Change} change
   */

  onEnter = (event, change) => {
    const { value } = change
    if (value.isExpanded) return

    const { startBlock, startOffset, endOffset } = value

    if (startBlock.type === 'check-list-item' && startBlock.text.length !== 0) {
      if(endOffset === startBlock.text.length) {
        console.log('create new check list')
      }
      change.splitBlock().setBlocks({ data: { checked: false } })
      return true
    }
    

    /**
     * Create new paragraph block after empty check list
     */
    if (startOffset === 0 && startBlock.text.length === 0) {
      // return this.onBackspace(event, change)
      change.splitBlock().setBlocks('paragraph')
      return true
    }
    if (endOffset !== startBlock.text.length) return

    if (
      startBlock.type !== 'heading-one' &&
      startBlock.type !== 'heading-two' &&
      startBlock.type !== 'heading-three' &&
      startBlock.type !== 'heading-four' &&
      startBlock.type !== 'heading-five' &&
      startBlock.type !== 'heading-six' &&
      startBlock.type !== 'block-quote'
    ) {
      return
    }

    event.preventDefault()
    change.splitBlock().setBlocks('paragraph')
    return true
  }
}

export default NoteEditor
