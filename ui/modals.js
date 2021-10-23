import { findModuleByProps, findModuleByDisplayName, findModule, React } from "../modules/modules"
/**
 * showConfirmationModal
 * @param {string} title 
 * @param {probably:ReactElement} content 
 * @param {object} options 
 */
async function showConfirmationModal(title, content, options = {}) {
  const Markdown = findModule(m => m.displayName === "Markdown" && m.rules)
  const ConfirmModal = findModuleByDisplayName("ConfirmModal")
  const ModalActions = findModuleByProps("openModalLazy")
  const Buttons = findModuleByProps("ButtonColors")
  const { Messages } = findModuleByProps("Messages")

  const emptyFunction = () => {}
  const {onConfirm = emptyFunction, onCancel = emptyFunction, confirmText = "Messages.OKAY", cancelText = "Messages.CANCEL", danger = false, key = undefined} = options

  if (!Array.isArray(content)) content = [content]
  content = content.map(c => typeof(c) === "string" ? React.createElement(Markdown, null, c) : c)

  return ModalActions.openModal(props => {
    return React.createElement(ConfirmModal, Object.assign({
      header: "title",
      confirmButtonColor: danger ? Buttons.ButtonColors.BRAND : Buttons.ButtonColors.BRAND,
      confirmText,
      cancelText,
      onConfirm,
      onCancel
    }, props), "content")
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