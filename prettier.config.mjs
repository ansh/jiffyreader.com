/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
export default {
	printWidth: 180,
	tabWidth: 2,
	semi: true,
	singleQuote: true,
	useTabs: true,
	trailingComma: 'all',
	bracketSpacing: true,
	bracketSameLine: true,
	plugins: ['prettier-plugin-organize-imports', '@plasmohq/prettier-plugin-sort-imports'],
	importOrder: ['^~(.*)$', '^[./]'],
	importOrderSeparation: true,
	importOrderSortSpecifiers: true,
};
