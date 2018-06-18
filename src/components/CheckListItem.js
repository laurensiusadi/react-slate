import React from 'react'

export default class CheckListItem extends React.Component {
  constructor(props){
    super(props);
  }
  
  onClick = () => {
    const { editor, node } = this.props
    const checked = !node.data.get('checked')
    editor.change(c => c.setNodeByKey(node.key, { data: { checked } }))
  }

  render() {
    const { attributes, children, node, readOnly } = this.props
    const checked = node.data.get('checked')
    return (
      <div
        className={`check-list-item ${checked ? 'checked' : ''}`}
        contentEditable={false}
        {...attributes}
      >
        <div className={`checkbox ${checked ? 'checked' : ''}`} onClick={this.onClick}></div>
        <span className="check-list-content" contentEditable={!readOnly} suppressContentEditableWarning>
          {children}
        </span>
      </div>
    )
  }
}