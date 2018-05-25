import { CompositeDisposable, TextEditor } from 'atom'
import * as CP from 'child_process'

let subs: CompositeDisposable

export const config = {
  command: {
    type: 'string',
    default: 'cat',
  },
  runOnSave: {
    type: 'boolean',
    default: false,
  },
  replaceText: {
    type: 'boolean',
    default: true,
  },
}

export function activate() {
  subs = new CompositeDisposable()
  subs.add(
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
      const disp = new CompositeDisposable()
      disp.add(
        buf.onWillSave(async () => {
          const shouldRun = atom.config.get('unix-filter.runOnSave', {
            scope: editor.getRootScopeDescriptor(),
          })
          if (shouldRun) await run(editor)
        }),
        buf.onDidDestroy(() => {
          subs.remove(disp)
          disp.dispose()
        }),
      )
      subs.add(disp)
    }),
  )
}

export function deactivate() {
  subs.dispose()
}

async function run(editor: TextEditor) {
  const cmd = atom.config.get('unix-filter.command', {
    scope: editor.getRootScopeDescriptor(),
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
        const replaceText = atom.config.get('unix-filter.replaceText', {
          scope: editor.getRootScopeDescriptor(),
        })
        if (replaceText) {
          editor.setText(result.replace(/^ +$/gm, ''))
          editor.setCursorBufferPosition(first)
          points.forEach((p) => editor.addCursorAtBufferPosition(p))
        }
        resolve()
      }
    })
    proc.stdin.write(text)
    proc.stdin.end()
  })
}
