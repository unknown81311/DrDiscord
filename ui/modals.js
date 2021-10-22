import { findModuleByProps, findModuleByDisplayName, React } from "../modules/modules"
/**
 * showConfirmationModal
 * @param {string} title 
 * @param {probably:ReactElement} content 
 * @param {object} options 
 */
async function showConfirmationModal(title, content, options = {}) {
  const Markdown = findModuleByDisplayName("Markdown")
  const ConfirmationModal = findModuleByDisplayName("ConfirmModal")
  const ModalActions = findModuleByProps("openModal")
  const Buttons = findModuleByProps("ButtonColors")
  const { Messages } = findModuleByProps("Messages")
  if (!ModalActions || !ConfirmationModal || !Markdown) return this.default(title, content)

  const emptyFunction = () => {}
  const {onConfirm = emptyFunction, onCancel = emptyFunction, confirmText = Messages.OKAY, cancelText = Messages.CANCEL, danger = false, key = undefined} = options

  if (!Array.isArray(content)) content = [content]
  content = content.map(c => typeof(c) === "string" ? React.createElement(Markdown, null, c) : c)

  return ModalActions.openModal(props => {
    return React.createElement(ConfirmationModal, Object.assign({
      header: title,
      confirmButtonColor: danger ? Buttons.ButtonColors.RED : Buttons.ButtonColors.BRAND,
      confirmText: confirmText,
      cancelText: cancelText,
      onConfirm: onConfirm,
      onCancel: onCancel
    }, props), content)
  }, {modalKey: key})
}
/**
 * alert
 * @param {string} title 
 * @param {probably:ReactElement} content
 * @description May be removed soon
 */
async function alert(title, children) {return showConfirmationModal(title, children, { cancelText: null })}

export { showConfirmationModal, alert }