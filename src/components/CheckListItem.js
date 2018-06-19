import React from 'react'

export default class CheckListItem extends React.Component {
  onCheckboxClick = (e) => {
    e.preventDefault()
    const { editor, node } = this.props
    const checked = !node.data.get('checked')
    editor.change(c => {
      c.setNodeByKey(node.key, { data: { checked } })
      c.collapseToEndOf(node)
      }
    )
  }

  onContentChange = e => {
    e.preventDefault()
    const { node } = this.props
    console.log('changes: ', node.text)
  }

  onEditClick() {
    
  }

  onDeleteClick = (e) => {
    e.preventDefault()
    const { editor, node } = this.props
    editor.change(c => {
      c.removeNodeByKey(node.key)
      c.collapseToEndOfPreviousBlock(node)
      }
    )
  }

  render() {
    const { attributes, children, node, readOnly } = this.props
    const checked = node.data.get('checked')
    return (
      <span
        className={`check-list-item ${checked ? 'checked' : ''}`}
        contentEditable={false}
        {...attributes}
      >
        <span className={`checkbox ${checked ? 'checked' : ''}`} checked={checked} onClick={this.onCheckboxClick}></span>
        <span className={`check-list-content ${node.text.length > 0 ? '' : 'placeholder'}`} onChange={this.onContentChange}
        contentEditable={!readOnly} suppressContentEditableWarning>
          {children}
        </span>
        <span className="edit">
          <span title="Set due date" onClick={this.onEditClick} className="material-icons">event</span>
          <span title="Delete Task" onClick={this.onDeleteClick} className="material-icons">close</span>
        </span>
      </span>
    )
  }
}