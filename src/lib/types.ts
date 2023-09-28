export type Tags = 'neovim' | 'alacritty' | 'tmux'

export type Post = {
	title: string
	slug: string
	description: string
	date: string
	tags: Tags[]
	published: boolean
}

