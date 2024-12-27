import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginOrganizeImports from 'eslint-plugin-organize-imports';
import pathAlias from 'eslint-plugin-path-alias';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
	{
		languageOptions: {
			globals: { ...globals['shared-node-browser'], ...globals.node },
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
		},
	},
	eslintConfigPrettier,
	{
		plugins: {
			'path-alias': pathAlias,
			'organize-imports': eslintPluginOrganizeImports,
			import: eslintPluginImport,
		},
		rules: {
			'path-alias/no-relative': ['error', { exceptions: ['*.module.css'] }],
			'import/first': 'error',
			'import/newline-after-import': 'error',
			'import/no-duplicates': 'error',
			'import/no-relative-packages': 'error',
			'no-undef': ['error'],
		},
	},
];
