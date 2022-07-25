/**
 * @type {import('prettier').Options}
 */
module.exports = {
	printWidth: 100,
	tabWidth: 2,
	semi: true,
	singleQuote: true,
	useTabs: false,
	trailingComma: 'all',
	bracketSpacing: true,
	bracketSameLine: true,
	plugins: [require.resolve("@plasmohq/prettier-plugin-sort-imports")],
	importOrder: ["^~(.*)$", "^[./]"],
	importOrderSeparation: true,
	importOrderSortSpecifiers: true
};
