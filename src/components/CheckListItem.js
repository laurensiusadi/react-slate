import React from 'react'

export default class CheckListItem extends React.Component {
  onCheckboxClick = (e) => {
    e.preventDefault()
    console.log('log this', e.target.nextSibling.textContent)
    const { editor, node } = this.props
    const checked = !node.data.get('checked')
    editor.change(c => c.setNodeByKey(node.key, { data: { checked } }))
  }

  onEditClick() {
    
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
        <span className={`checkbox ${checked ? 'checked' : ''}`} onClick={this.onCheckboxClick}></span>
        <span className={`check-list-content ${this.props.children[0].props.block.getText().length > 0 ? '' : 'placeholder'}`}
        contentEditable={!readOnly} suppressContentEditableWarning>
          {children}
        </span>
        <span title="Set due date" onClick={this.onEditClick} className="edit material-icons">event</span>
      </span>
    )
  }
}