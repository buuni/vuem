module.exports = {
  presets: [
    '@vue/app'
  ],
	plugins: [
		"@babel/plugin-transform-runtime",
		'@babel/plugin-proposal-object-rest-spread',
		'@babel/plugin-proposal-export-default-from',
		[
			'@babel/plugin-proposal-decorators',
			{
				legacy: true,
			},
		],
		[
			'@babel/plugin-proposal-class-properties',
			{
				loose: false,
			},
		],
	],
}
