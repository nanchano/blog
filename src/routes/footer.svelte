<script lang="ts">
	import * as config from "$lib/config";
</script>

<footer>
	<article class="item">
		<p class="left">{config.title} &copy {new Date().getFullYear()}</p>
		<div class="right">
			<a href="https://kit.svelte.dev">Powered by Svelte</a>
		</div>
	</article>
</footer>

<style>
	footer {
		padding-block: var(--size-7);
		border-top: 1px solid var(--border);
	}

	p {
		color: var(--text-2);
		text-align: center;
	}

	.item p {
		display: inline-block;
	}
	.left {
		font-size: 1.2em;
		text-align: left;
		float: left;
		width: 50%;
	}
	.right {
		font-size: 1.2em;
		text-align: right;
		float: right;
		width: 50%;
	}
</style>
