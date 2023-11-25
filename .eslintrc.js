module.exports = {
	"env": {
		"browser": true,
		"es2021": true
	},
	"extends": [
		"eslint:recommended",
		"plugin:@typescript-eslint/recommended"
	],
	"overrides": [
		{
			"files": ["*.ts"],
			"parserOptions": {
				"project": ['./tsconfig.json']
			},
			"extends": [
				"plugin:@typescript-eslint/recommended"
			],
			"rules": {
				"@typescript-eslint/no-floating-promises": ['error']
			}
		}
	],
	"parser": "@typescript-eslint/parser",
	"parserOptions": {
		"ecmaVersion": "latest",
		"sourceType": "module"
	},
	"plugins": [
		"@typescript-eslint"
	],
	"rules": {
		"linebreak-style": [
			"error",
			"windows"
		],
		"semi": [
			"error",
			"always"
		],
		'@typescript-eslint/no-floating-promises': ['error']
	}
};
