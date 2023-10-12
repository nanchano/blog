export type Tags = 'neovim' | 'alacritty' | 'tmux' | 'python' | 'go' | 'software-architecture' | 'design-patterns'

export type Post = {
	title: string
	slug: string
	description: string
	date: string
	tags: Tags[]
	published: boolean
}

