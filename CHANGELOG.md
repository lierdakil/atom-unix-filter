## 0.0.2

### New features

-   File env variable; option to ignore stdout; keybind; activationCommands (#3) (kiwi0fruit)
-   The filter will be exectued in the environment with `FILE` variable set
    to current editor's file path. This makes it possible to run executables
    that accept positional file arguments.

    On Windows, `%FILE%` in a command will be substituted by path to editor's
    file.

    On Unix (Linux and MacOS), use `${FILE}` instead.

-   By default, the output of the command run will become the new contents
    of the current text editor. Now you can disable this behaviour by
    setting `replaceText` option to `false`.

-   `unix-filter:run` is now bound to `ctrl-alt-f` by default. You can disable
    this keybinding in the package settings.

### Changes

-   The package is no longer auto-activated on Atom startup. Instead, it's only
    activated once any package command was run (`unix-filter:run` or
    `unix-filter:exec`)

### Maintenence
-   Contributing guide
-   Helper scripts in package.json
-   Added CHANGELOG

## 0.0.1

-   Initial release
