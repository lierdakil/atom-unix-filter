"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var atom_1 = require("atom");
var CP = require("child_process");
var subs;
exports.config = {
    command: {
        type: 'string',
        "default": 'cat'
    },
    runOnSave: {
        type: 'boolean',
        "default": false
    },
    replaceText: {
        type: 'boolean',
        "default": false
    },
    appendFileName: {
        type: 'boolean',
        "default": true
    }
};
function activate() {
    var _this = this;
    subs = new atom_1.CompositeDisposable();
    subs.add(atom.commands.add('atom-text-editor', {
        'unix-filter:run': function (_a) {
            var currentTarget = _a.currentTarget;
            run(currentTarget.getModel())["catch"](function (e) {
                console.error(e);
            });
        },
        // TODO: atom-select-list with history
        'unix-filter:exec': function (_a) {
            var currentTarget = _a.currentTarget;
            return __awaiter(_this, void 0, void 0, function () {
                var textEditorElement, panel, disp, cont, cmd;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            textEditorElement = document.createElement('atom-text-editor');
                            textEditorElement.setAttribute('mini', '');
                            panel = atom.workspace.addModalPanel({
                                item: textEditorElement,
                                visible: true
                            });
                            textEditorElement.focus();
                            disp = new atom_1.CompositeDisposable();
                            return [4 /*yield*/, new Promise(function (resolve) {
                                    disp.add(atom.commands.add(textEditorElement, {
                                        'core:confirm': function () { return resolve(true); },
                                        'core:cancel': function () { return resolve(false); }
                                    }));
                                })];
                        case 1:
                            cont = _b.sent();
                            disp.dispose();
                            panel.destroy();
                            if (cont) {
                                cmd = textEditorElement.getModel().getText();
                                customCommand(currentTarget.getModel(), cmd)["catch"](function (e) {
                                    console.error(e);
                                });
                            }
                            return [2 /*return*/];
                    }
                });
            });
        }
    }), atom.workspace.observeTextEditors(function (editor) {
        var buf = editor.getBuffer();
        var disp = new atom_1.CompositeDisposable();
        disp.add(buf.onWillSave(function () { return __awaiter(_this, void 0, void 0, function () {
            var shouldRun;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        shouldRun = atom.config.get('unix-filter.runOnSave', {
                            scope: editor.getRootScopeDescriptor()
                        });
                        if (!shouldRun) return [3 /*break*/, 2];
                        return [4 /*yield*/, run(editor)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); }), buf.onDidDestroy(function () {
            subs.remove(disp);
            disp.dispose();
        }));
        subs.add(disp);
    }));
}
exports.activate = activate;
function deactivate() {
    subs.dispose();
}
exports.deactivate = deactivate;
function run(editor) {
    return __awaiter(this, void 0, void 0, function () {
        var cmd;
        return __generator(this, function (_a) {
            cmd = atom.config.get('unix-filter.command', {
                scope: editor.getRootScopeDescriptor()
            });
            return [2 /*return*/, customCommand(editor, cmd)];
        });
    });
}
function customCommand(editor, cmd) {
    return __awaiter(this, void 0, void 0, function () {
        var text;
        return __generator(this, function (_a) {
            text = editor.getText();
            return [2 /*return*/, new Promise(function (resolve) {
                    var appendFileName = atom.config.get('unix-filter.appendFileName', {
                        scope: editor.getRootScopeDescriptor()
                    });
                    if (appendFileName) {
                        var cmd_plus = cmd + ' "' + editor.getPath() + '"';
                    }
                    else {
                        var cmd_plus = cmd;
                    }
                    var proc = CP.exec(cmd_plus, { encoding: 'utf8' }, function (error, result) {
                        if (error) {
                            atom.notifications.addError(error.toString(), {
                                detail: error.message,
                                stack: error.stack,
                                dismissable: true
                            });
                            resolve(); // always save the file!
                        }
                        else {
                            var _a = editor
                                .getCursors()
                                .map(function (c) { return c.getBufferPosition(); }), first = _a[0], points = _a.slice(1);
                            var replaceText = atom.config.get('unix-filter.replaceText', {
                                scope: editor.getRootScopeDescriptor()
                            });
                            if (replaceText) {
                                editor.setText(result.replace(/^ +$/gm, ''));
                                editor.setCursorBufferPosition(first);
                                points.forEach(function (p) { return editor.addCursorAtBufferPosition(p); });
                            }
                            resolve();
                        }
                    });
                    proc.stdin.write(text);
                    proc.stdin.end();
                })];
        });
    });
}
