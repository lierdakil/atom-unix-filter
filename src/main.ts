import { CompositeDisposable, TextEditor } from 'atom'
import * as CP from 'child_process'

let subscriptions: CompositeDisposable

export const config = {
  command: {
    type: 'string',
    default: 'cat',
  },
  runOnSave: {
    type: 'boolean',
    default: false,
  },
}

export function activate() {
  subscriptions = new CompositeDisposable()
  subscriptions.add(
    atom.commands.add('atom-text-editor', {
      'unix-filter:run': ({ currentTarget }) => {
        run(currentTarget.getModel()).catch((e) => {
          console.error(e)
        })
      },
      // TODO: atom-select-list with history
      'unix-filter:exec': async ({ currentTarget }) => {
        const textEditorElement = document.createElement('atom-text-editor')
        textEditorElement.setAttribute('mini', '')
        const panel = atom.workspace.addModalPanel({
          item: textEditorElement,
          visible: true,
        })
        textEditorElement.focus()
        const disp = new CompositeDisposable()
        const cont = await new Promise((resolve) => {
          disp.add(
            atom.commands.add(textEditorElement, {
              'core:confirm': () => resolve(true),
              'core:cancel': () => resolve(false),
            }),
          )
        })
        disp.dispose()
        panel.destroy()
        if (cont) {
          const cmd = textEditorElement.getModel().getText()
          customCommand(currentTarget.getModel(), cmd).catch((e) => {
            console.error(e)
          })
        }
      },
    }),
    atom.workspace.observeTextEditors((editor) => {
      const buf = editor.getBuffer()
      const disp = buf.onWillSave(async () => {
        const shouldRun = atom.config.get('unix-filter.runOnSave', {
          scope: editor.getLastCursor().getScopeDescriptor(),
        })
        if (shouldRun) return run(editor)
        else return
      })
      buf.onDidDestroy(() => {
        subscriptions.remove(disp)
        disp.dispose()
      })
    }),
  )
}

export function deactivate() {
  subscriptions.dispose()
}

async function run(editor: TextEditor) {
  const cmd = atom.config.get('unix-filter.command', {
    scope: editor.getLastCursor().getScopeDescriptor(),
  })
  return customCommand(editor, cmd)
}

async function customCommand(editor: TextEditor, cmd: string) {
  const text = editor.getText()
  return new Promise<void>((resolve) => {
    const proc = CP.exec(cmd, { encoding: 'utf8' }, (error, result) => {
      if (error) {
        atom.notifications.addError(error.toString(), {
          detail: error.message,
          stack: error.stack,
          dismissable: true,
        })
        resolve() // always save the file!
      } else {
        const [first, ...points] = editor
          .getCursors()
          .map((c) => c.getBufferPosition())
        editor.setText(result.replace(/^ +$/gm, ''))
        editor.setCursorBufferPosition(first)
        points.forEach((p) => editor.addCursorAtBufferPosition(p))
        resolve()
      }
    })
    proc.stdin.write(text)
    proc.stdin.end()
  })
}
