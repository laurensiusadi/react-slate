import React from 'react'

export default class CheckListItem extends React.Component {
  constructor(props){
    super(props);
    this.handleToggle = this.handleToggle.bind(this);
    this.state = {
         isEditing : false 
    }
  }
  
  handleToggle() {
    this.setState({ isEditing: !this.state.isEditing })
  }

  onChange = event => {
    const checked = event.target.checked
    const { editor, node } = this.props
    editor.change(c => c.setNodeByKey(node.key, { data: { checked } }))
  }

  /**
   * Render a check list item, using `contenteditable="false"` to embed the
   * checkbox right next to the block's text.
   *
   * @return {Element}
   */

  render() {
    const { attributes, children, node, readOnly } = this.props
    const checked = node.data.get('checked')
    return (
      <div
        className={`check-list-item ${checked ? 'checked' : ''}`}
        contentEditable={false}
        style={{ display: 'flex' }}
        {...attributes}
      >
        <span>
          {/* disabled={(this.state.isEditing) ? "" : "disabled"} */}
          <input type="checkbox" checked={checked} onChange={this.onChange} />
        </span>
        <span style={{flex: '1 1 auto'}} contentEditable={!readOnly} suppressContentEditableWarning>
          {children}
        </span>
        {/* <span>
          <button onClick={this.handleToggle}>
            { this.state.isEditing ? 'Done' : 'Edit' }
          </button>
        </span> */}
      </div>
    )
  }
}