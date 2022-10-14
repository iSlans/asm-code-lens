# Changelog

# 1.10.2
- Multiline comments support (/* ... */)
	- for references/code lenses
	- for hover and descriptive text in front of the label
- Fix for references after quotes (issue [#69](https://github.com/maziac/asm-code-lens/issues/69))

# 1.9.1
- Wider references for code lenses and "Find labels with no Reference": Fixed [#68](https://github.com/maziac/asm-code-lens/issues/68)
- Delayed activation event to "onStartupFinished"

# 1.9.0
- Added PR [#65](https://github.com/maziac/asm-code-lens/issues/65): Add syntax highlight to Markdown code blocks.
- Added configuration to exclude certain labels.
- Added configurations to recognize labels with colons, without colons or both.
- Fixed renaming in multiroot context.
- Fixed CMD-click in output channel of 'Find Labels with no Reference'.

# 1.8.4
- Fixed negative number formatting in hex number in hex calculator.

# 1.8.3
- Fixed: 'Goto definition' for include files.

# 1.8.2
- .z80 added to defaults. I.e. it will be syntax highlighted automatically. But you need to update the preferences 'asm-code-lens.includeFiles' with 'z80' manually for advanced features like references.
- Fixed recognition of global labels for sjasmplus in code lenses. Issue [#49](https://github.com/maziac/asm-code-lens/issues/49).

# 1.8.1
- Fixed: When the settings were changed the providers (e.g. CodeLens) were registered multiple times.

# 1.8.0
- Multiroot workspaces support.

# 1.7.2
- Internal refactoring.

# 1.7.1
- Solved issue [#54](https://github.com/maziac/asm-code-lens/issues/54): Using "# " as comment instead of "#".

# 1.7.0
- Icon for hex calculator added.
- PR from chrijbel: Added support for changing the line comment prefix to use with VS Code keybindings: Toggle/Add Line Comment.

# 1.6.4
- Fixed [#52](https://github.com/maziac/asm-code-lens/issues/52): CamelCase filename issue in Linux.
- Removed config warning.

# 1.6.3
- Fixed 'Illegal argument' error.

# 1.6.2
- Regression fixed: Issue [#30](https://github.com/maziac/asm-code-lens/issues/30): Goto definition to local label not working
- Regression fixed: what's new command.

# 1.6.1
- Fixed: missing manifest.

# 1.6.0
- Added a hex calculator for the sidebar.

# 1.5.9
- Added syntax highlighting for SLDOPT sjasmplus keyword thanks to kborowinski.
- Fixed sjasmplus OUTEND highlighting thanks to kborowinski.

# 1.5.8
- Fixed [#46](https://github.com/maziac/asm-code-lens/issues/46): Syntax highlighting: clash of Z80 vs. x86
- Added syntax highlighting for DeZog WPMEM, LOGPOINT and ASSERTION.
- Flags in Z80 jp, jr and call are now highlighted in different color than mnemonic.

# 1.5.7
- Fixed IFN highlighting [#44](https://github.com/maziac/asm-code-lens/issues/44) thanks to kborowinski.
- Fixed line comment toggling [#45](https://github.com/maziac/asm-code-lens/issues/45)

# 1.5.6
- Fixed semver package.

# 1.5.5
- What's new only shown once.

# 1.5.4
- Donate button added.
- What's new added.

# 1.5.3
- Fixes:
	- [#40](https://github.com/maziac/asm-code-lens/issues/40): "Hover display incorrect"
	- [#41](https://github.com/maziac/asm-code-lens/issues/41): "No completion of local label"

# 1.5.2
- Fixes:
	- [#39](https://github.com/maziac/asm-code-lens/issues/39): "Wrong substitution: e.label"
	- [#38](https://github.com/maziac/asm-code-lens/issues/38): "Completion: wrong label"
	- [#37](https://github.com/maziac/asm-code-lens/issues/37): "Outline: Data label shown as code"
	- [#36](https://github.com/maziac/asm-code-lens/issues/36): "Outline: STRUCTs wrong."
	- [#34](https://github.com/maziac/asm-code-lens/issues/34): "local labels not recognized properly?"
	- [#33](https://github.com/maziac/asm-code-lens/issues/33): "Quarte in binary numbers highlighted wrong"
	- [#32](https://github.com/maziac/asm-code-lens/issues/32): "ENDS not correctly colored"
	- [#31](https://github.com/maziac/asm-code-lens/issues/31): "Some grammar for Z80N missing"
	- [#30](https://github.com/maziac/asm-code-lens/issues/30): "Goto definition to local label not working"

# 1.5.1
- Syntax highlighting for "// ... " style comments

## 1.5.0
- Outline view tested.

## 1.4.6
- Outline view.
- Hovering now shows also EQU value if on the same line as label.
- Added sjasmplus problem matcher.

## 1.4.5
- Fixed changelog.

## 1.4.3/4
- Fixed issue [#23](https://github.com/maziac/asm-code-lens/issues/23) for Linux.
- Added anderson-arc's list of x86 instructions.
- Fixed dot command completion.

## 1.4.2
- Added more commands/fixes (kborowinski).

## 1.4.1
- Added support for more sjasmplus directives thanks to kborowinski.

## 1.4.0
- New icon.

## 1.3.2
- Fixed falsy recognition of opcodes as labels.

## 1.3.1
- Improved 'Goto Definition' and 'Rename' for concatenated (sjasmplus) labels.

## 1.3.0
- Settings fixed.
- Added settings for globbing include and exclude files.
- Fixed error reading files, sometimes wrong data was read, i.e. sometimes labels were not found.

## 1.2.2
- Added Z80 register names as proposals for completions.
- Fixed "Go to definition" for sjasmplus macros.

## 1.2.1
- Fix for hovering local labels.
- Completions for z80 instructions.

## 1.2.0
- Better support fo sjasmplus dot label notation.
- Support for sjasmplus macros.
- Recognizes sjasmplus MODULE keyword in assembly files.
- 'Go to definition' also for INCLUDE files.
- Completions implemented. Also supports sjasmplus dots notation and MODULEs.
- New settings: enableCompletions, completionsRequiredLength.
- Unit tests for regular expressions.
- Configurable through settings.json.
- Added syntax highlighting.

## 1.1.0
- HoverProvider can be enabled/disabled in the settings.
- DefinitionProvider added.
- New Command: asm-code-lens.find-labels-with-no-reference. Searches all labels and shows the ones that are not referenced.
- Bugfixes.

## 1.0.1
- Readme updated.

## 1.0.0
- Initial marketplace release.

## 0.2.0
Added.
- Code Lens
- Hover support
- Symbol renaming

## 0.1.0
- Initial version. Support for "Find all references".

