export type Tags = 'test' | 'dev' | 'prod'

export type Post = {
	title: string
	slug: string
	description: string
	date: string
	tags: Tags[]
	published: boolean
}

