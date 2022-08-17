/**
 * @type {import('prettier').Options}
 */
module.exports = {
	printWidth: 140,
	tabWidth: 1,
	semi: true,
	singleQuote: true,
	useTabs: true,
	trailingComma: 'all',
	bracketSpacing: true,
	bracketSameLine: true,
	plugins: [require.resolve('@plasmohq/prettier-plugin-sort-imports')],
	importOrder: ['^~(.*)$', '^[./]'],
	importOrderSeparation: true,
	importOrderSortSpecifiers: true,
};
