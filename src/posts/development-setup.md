---
title: My development setup featuring Alacritty, tmux and Neovim
description: My portable dev environment featuring alacritty, tmux and neovim
date: 2023-9-28
tags:
  - alacritty
  - neovim
  - tmux
published: true
---

I usually prefer to keep things minimal and portable, which is why the unix philosophy resonates well with me. As such, My development setup includes three tools which do one thing (and one thing only) really well, filling in the gaps with plugins. Those are:
1. Alacritty as the terminal
2. tmux as the terminal multiplexer
3. Neovim as a text editor.

Before we dive deep into each part, I'm attaching to links with various settings that I'll be referencing in the post:
1. [dotfiles](https://github.com/nanchano/dotfiles/tree/linux) where the tmux and alacritty configs live. Includes a branch for max and another one for linux.
2. [nvim](https://github.com/nanchano/nvim) where my neovim configuration lives.

## Alacritty
[Alacritty](https://github.com/alacritty/alacritty) was the first GPU accelerated terminal. It's minimal, cross-platform (although there can be some funkiness/sluggishness when paired with neovim on MacOS) and has sensible defaults while allowing for a myriad of configuration options, including themes, scrolling, keybinds, etc.

To install on Arch Linux: `sudo pacman -S alacritty`

To install on MacOS: `brew install alacritty`

Since alacritty tries to follow the Unix philosophy, it won't have as many features as other terminal emulators such as Kitty or iTerm2. Multiplexing is one of them, which is why it pairs very well with tmux. That said, it does have a `VI` mode, which is very handy when scrolling or looking through history.

[My config](https://github.com/nanchano/dotfiles/tree/mac/alacritty) is pretty basic as it gets the job done, we just define the theme (with imports to keep the actual file small and tidy), and some Key bindings. Some key elements to make your life easier:
1. `live_config_reload: true` for hot reloading the config and seeing changes in real time.
2. `startup_mode: maximized` is especially nice on MacOS.
3. `save_to_clipboard: true` is key to allow for copy/pasting.
4. Declaring the `TERM` on `env` is needed for tmux compatibility.

## tmux
[tmux](https://github.com/tmux/tmux) is a terminal multiplexer that allows you to create, access and control multiple terminals from a single screen. You can also dettach from the current session and attach yourself later. As each tab or split is its own terminal process, new installations or settings (like env variables) from one may not be present in another, unless you call for them specifically (think `source .bashrc`).

Its defaults can be a bit painful though, and it has a decent ecosystem, including a plugin manager (`tpm`), allowing for extension and overall a better experience.

It relies on a `prefix` to execute commands, which defaults to `ctrl + b`

Installation:
1. Follow the installation screens on the repo.
2. Install tpm: `git clone https://github.com/tmux-plugins/tpm ~/.config/.tmux/plugins/tpm`
3. Run `tmux source-file .tmux.conf`
4. Install plugins: `prefix + I`

As for [my config](https://github.com/nanchano/dotfiles/blob/mac/.tmux.conf), the first options are window or pane (aka vertical or horizonal splits) bindings to kill them. Then styling follows up. There's also settings for neovim compatibility, using the `ENV` that was set up previously on alacritty.

Perhaps the most important part, and that will heavily improve the experience, is changing the prefix from `ctrl + b` to `ctrl + a`, as they are closer together and allows for faster commands. Some mouse options too for the same reasons.

Lastly, we download and run 4 plugins:
1. [tmux-plugins/tpm](https://github.com/tmux-plugins/tpm) as the plugin manager
2. [tmux-plugins/tmux-sensible](https://github.com/tmux-plugins/tmux-sensible) for better defaults. Take a look at the README for commands.
3. [tmux-plugins/tmux-pain-control](https://github.com/tmux-plugins/tmux-pain-control) for better navigation and resizing of panes.
3. [tmux-plugins/tmux-yank](https://github.com/tmux-plugins/tmux-yank) to copy to clipboard.

To wrap up, some commands that I use every day:
1. `tmux` in the terminal to start a new session
2. `ctrl + c` to create a new tab.
3. `ctrl + ,` to rename the current tab.
4. `ctrl + \` to create a new vertical pane.
5. `ctrl + "` to create a new horizontal pane.
6. `ctrl + x` to kill the current pane or window.

## Neovim
Neovim is a text editor based on VIM, extensible through a rich plugin ecosystem, and configurable either through VIM script or LUA (recommended)

While we'll dive deep into my current neovim setup in a different article, I want to describe the basics here (as well as the inspiration) to get set up and running quickly.

To install on Arch Linux: `sudo pacman -S neovim`

To install on MacOS: `brew install neovim`

First and foremost, new users should go through the basic and built-in tutorial multiple times to get used to some shortcuts as well as learning about the logic behind them. To do so, simply open neovim and type `:Tutor` in normal mode.

The [kickstart](https://github.com/nvim-lua/kickstart.nvim) configuration will get you very far when starting, as it builds the foundations for plugin management, LSP, autocompletion and syntax highlighing, giving neovim and IDE feel. Moreover, you can expand the config by simply downloading more plugins, tweaking the existing ones, or just playing around with settings and shortcuts.

Some quick highlights from my own [config](https://github.com/nanchano/nvim/blob/main/init.lua):
1. `Lazy` as plugin manager.
2. `nvim-autopairs` to auto pair symbols and `Comment.nvim` to comment lines/blocks easily as QOL plugins.
3. `Telescope` for file/folder searching and management.
4. `null-ls` just for python formatting, as it's not provided through its LSP.
5. `Treesitter` for syntax highlighting.
6. `nvim-lspconfig` and `mason` for LSP management.
7. `cmp` and dependencies for snippets.

Stay tuned for the following article where we'll be deep diving into the config itself.
