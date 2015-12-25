"use strict";

var	Plugin = module.exports = { };

Plugin.pattern = /%PD%(.*)%/;
Plugin.iframe  = '<iframe class="ifgame" src="/plugins/nodebb-plugin-punchdrunk/punchdrunk/examples/$1.html"></iframe>';

Plugin.load = function ()
{
	var	child_process = require('child_process')
	
	,	spawn   = child_process.spawn
	,	exec    = child_process.exec
	,	devdeps, punchdrunk;

	devdeps = exec('npm i', {cwd:'./node_modules/nodebb-plugin-punchdrunk/node_modules/punchdrunk/'}, function (error, stdout, stderr)
	{
		if (error) return console.log('[punchdrunk] stderr: ' + stderr);

		punchdrunk = spawn('grunt', {cwd:'./node_modules/nodebb-plugin-punchdrunk/node_modules/punchdrunk/'});

		punchdrunk.stdout.on('data', function (data)
		{
			console.log('[punchdrunk] ' + data);
		});

		punchdrunk.stderr.on('data', function (data)
		{
			console.log('[punchdrunk] stderr: ' + data);
		});

		punchdrunk.on('close', function (code)
		{
			console.log('[punchdrunk] child process exited with code ' + code);
		});
	});

	process.on('exit', function ()
	{
		if (devdeps) devdeps.kill();
		if (punchdrunk) punchdrunk.kill();
	});

	require.main.require('./src/pubsub').on('meta:reload', function () {
		if (devdeps) devdeps.kill();
		if (punchdrunk) punchdrunk.kill();
	});
};

Plugin.parseRaw = function (content, callback)
{
	content = content.replace(Plugin.pattern, '');
	callback(null, content);
};

Plugin.parsePost = function (data, callback)
{
	data.postData.content = data.postData.content.replace(Plugin.pattern, Plugin.iframe);
	callback(null, data);
};
