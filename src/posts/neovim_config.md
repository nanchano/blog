---
title: My Neovim configuration
description: My neovim config based on kickstart.nvim
date: 2023-9-29
tags:
  - neovim
published: true
---

While I gave a brief overview on Neovim in the [previous](./development_setup) article, including installation and basic pointers, here I'll be deep diving into my current config, the setup, and how it works from a day to day development standpoint.

As mentioned, the config is based and inspired on [kickstart.nvim](https://github.com/nvim-lua/kickstart.nvim), that sets up some building blocks and is made to be extensible by anyone. 

The config is located on my [nvim](https://github.com/nanchano/nvim) GitHub repo, with `init.lua` being the entrypoint of the config, and the `lua/plugins` directory storing various scripts, like the autoformatter. 

## Plugins and settings
In the following sections I'll be setting up the plugins that I'm using, as well as some useful configuration or key mappings from them

Since some code blocks will be long, especially settings, I'll default to linking to the GitHub block for readability.

### Basic
The [basic](https://github.com/nanchano/nvim/blob/main/init.lua#L151-L216) settings allow for mouse usage, proper tabbing/indenting, better folding capabilities (`za` to fold/unfold), or a better sign column UI/UX.

Some more advanced options, such as highlighting on yank (with `v` selections or `y[count]y`) or copy/pasting to and from neovim, are also included here.

### Plugin manager
Before we go over every plugin, a Plugin Manager is needed to download an update them. I personally chose [lazy.nvim](https://github.com/folke/lazy.nvim) due to its performance and ease of use (super readable API). Installation should happen on the neovim config itself, to guarantee idempotence for every new neovim setup.

First, set mapleader before lazy (to space in this case, but it's up to you)

```lua
vim.g.mapleader = ' '
vim.g.maplocalleader = ' '
```

Then, install lazy.

```lua
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({
    "git",
    "clone",
    "--filter=blob:none",
    "https://github.com/folke/lazy.nvim.git",
    "--branch=stable",
    lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)
```

To install the plugins, we need to call `setup` on lazy with the plugins we want to install (with the options of adding config scripts for the installation).

```lua
require("lazy").setup({
  "plugin-repo/plugin-name",
})
```

With lazy setup, we can now talk about some key plugins that improve the development experience on neovim.

### Git Integration
[vim-fugitive](https://github.com/tpope/vim-fugitive) and [gitsigns.nvim](https://github.com/lewis6991/gitsigns.nvim) are the plugins I'm currently using for GitOps on neovim. Installation and some config below:


```lua
'tpope/vim-fugitive',
{
    'lewis6991/gitsigns.nvim',
    opts = {
        signs = {
            add = { text = '+' },
            change = { text = '~' },
            delete = { text = '_' },
            topdelete = { text = '‾' },
            changedelete = { text = '~' },
        },
    },
},
```

`vim-fugitive` allows for calling of `git` commands just by using `:G` inside the editor, allowing you to add, commit, stash or push files you're working on without the need to go back to a terminal, or even seeing the diff.

`gitsigns.nvim` gives you visual cues on the file you're editing, showing if you added, removed or changed lines against the branch you are currently on.

### Quality of Life
Some plugins are pretty minimal and just improve the overall experience while editing files.

```lua
'tpope/vim-sleuth',
{
    'windwp/nvim-autopairs',
    event = "InsertEnter",
    opts = {}
},
{ 'numToStr/Comment.nvim', opts = {} },
```

[vim-sleuth](https://github.com/tpope/vim-sleuth) detects tabs automatically based on the file that is open.

[nvim-autopairs](https://github.com/windwp/nvim-autopairs) just autocompletes signs that should be paired, such as `(`, `[` or `"`, among others.

[Comment.nvim](https://github.com/numToStr/Comment.nvim) allows to easily comment lines, blocks, function scope, etc. For example, `gcc` will comment/uncomment the current line or `gcap` will comment/uncomment the current paragraph. Of course, vim basic concepts apply, meaning `2gcc` will toggle a comment on 2 lines. Setting `ignore = '^$'` will ignore empty lines, especially useful when commenting blocks as it will allow for easier uncommenting withe the same command (basically giving you toggle capabilities)

### Syntax highlighting
[Treesitter](https://github.com/nvim-treesitter/nvim-treesitter) is the way to go when talking about syntax highlighting on neovim
```lua
{
    'nvim-treesitter/nvim-treesitter',
    dependencies = {
        'nvim-treesitter/nvim-treesitter-textobjects',
    },
    build = ':TSUpdate',
},
```

The [settings](https://github.com/nanchano/nvim/blob/main/init.lua#L254-L318) are pretty self-explanatory, but I'm essentially guaranteeing a number of servers to be installed on any neovim instance I'm running, enabling highlighting and indenting, and setting some useful keybindings, especially useful for moving around.

For usage, you need to define the scope of the block, which will be detected automatically, by `ctrl + space`. Afterwards, you can move around with `[`, `]`, `m` or `M`

### LSP
LSP stands for Language Server Protocol and allows for autocompletion, formatting, linting, among other capabilities, depending on the server. Neovim has native support for LSPs, and some plugins allow you to easily install, configure or remove them.

```lua
{
    -- LSP Configuration & Plugins
    'neovim/nvim-lspconfig',
    dependencies = {
        -- Automatically install LSPs to stdpath for neovim
        { 'williamboman/mason.nvim', config = true },
        'williamboman/mason-lspconfig.nvim',
        -- Useful status updates for LSP
        { 'j-hui/fidget.nvim', tag = 'legacy', opts = {} },
    },
},
'jose-elias-alvarez/null-ls.nvim',
```

[nvim-lspconfig](https://github.com/neovim/nvim-lspconfig) allows you to configure language servers on a case by case basis. Depends on [mason](https://github.com/williamboman/mason.nvim) and [mason-lspconfig](https://github.com/williamboman/mason-lspconfig.nvim), with the first one allowing you to setup language servers, linters and formatters and the second one bridging the first two.

As such, we can easily install whatever we need for linting, formatting or any kind of code analysis on the go, as well as configure it on our own neovim config for reproducibility.

Lastly, [null-ls](https://github.com/jose-elias-alvarez/null-ls.nvim) is there for filling in the gaps not covered by the language servers, such as formatting or linting in some edge cases (like python). While it's archived right now, my use is pretty basic and should be covered for the foreseeable future.

The settings are located [here](https://github.com/nanchano/nvim/blob/main/init.lua#L328-L468).

Some of my favorites:
1. `leader+rn` to rename definition and calls of any object.
2. `gd` goes to definition.
3. `K` displays the docstring.

Language server settings are also defined there. I won't go through them, but they are mostly setting up the diagnostics and formatting I want from my language servers, mostly Go and Python (and some terraform).

To wrap up, the servers are installed by Mason with the settings defined in the `servers` map

### Autocompletion
[nvim-cmp]() is the main plugin for autocompletion, with some dependencies that include common snippets for most languages or LSP integration.

```lua
{
    'hrsh7th/nvim-cmp',
    dependencies = {
        -- Snippet Engine & its associated nvim-cmp source
        'L3MON4D3/LuaSnip',
        'saadparwaiz1/cmp_luasnip',
        -- Adds LSP completion capabilities
        'hrsh7th/cmp-nvim-lsp',
        -- Adds a number of user-friendly snippets
        'rafamadriz/friendly-snippets',
    },
},
```

In practice, if you have the language server installed, you'll get autocompletion by default, and the same applies for whatever libraries you are using (assuming you are using the previos LSP settings to actually download the servers).

The [settings](https://github.com/nanchano/nvim/blob/main/init.lua#L473-L521) for autocompletion are pretty straightforward, namely loading them based on the language server, and configuring some keybinds, like tabbing to go to the next one on the list, or shit+tabbing to go to the previous one.

### Telescope
[Telescope](https://github.com/nvim-telescope/telescope.nvim) is a fuzzy finder, useful for navigating across files, folders by either searching on file/directory name, or through their contents. It's fast and customizable, and has a dependency on `ripgrep`.

```lua
{
    'nvim-telescope/telescope.nvim',
    branch = '0.1.x',
    dependencies = {
        'nvim-lua/plenary.nvim',
        -- Fuzzy Finder Algorithm which requires local dependencies to be built.
        -- Only load if `make` is available.
        {
            'nvim-telescope/telescope-fzf-native.nvim',
            build = 'make',
            cond = function()
                return vim.fn.executable 'make' == 1
            end,
        },
    },
},
```

Some common operations I use day to day: finding recently opened files, find existing buffers, searching through files, grepping, etc.

The config for the plugin is located [here](https://github.com/nanchano/nvim/blob/main/init.lua#L220-L250)

Here telescope is integrated with `fzf`, and some useful keybindings are set. Some highlights (leader = space):
1. `leader+sf` to search through files
2. `loader+sw` to search current word on the file.

### UI
To wrap up, I have some final plugins for themes.

```lua
{
    'ntk148v/habamax.nvim',
    dependencies = { "rktjmp/lush.nvim" },
    config = function()
        vim.cmd.colorscheme 'habamax.nvim'
    end,
},
{
    'nvim-lualine/lualine.nvim',
    opts = {
        options = {
            icons_enabled = false,
            theme = 'habamax',
            component_separators = '|',
            section_separators = '',
        },
    },
},
```

[habamax.nvim](https://github.com/ntk148v/habamax.nvim) is the theme I'm using, ported from the classic `habamax` one on vim and with better integration with tresitter's syntax highlighting. It also includes a lualine theme.

[lualine.nvim](https://github.com/nvim-lualine/lualine.nvim) is a status line for neovim, set to the `habamax` theme.

### Custom plugins
Lastly, custom plugins can be developed and added to the config with the following line, as long as they are stored in `lua/plugins`

```lua
{ import = 'plugins' },
```

[autoformat.lua](https://github.com/nanchano/nvim/blob/main/lua/plugins/autoformat.lua) lives there, and it's basically the one from the kickstart config with some small additions, as it can be easily extended. In particular, I added an option to fix Go imports, and to format Python files with `black` and `isort`.

