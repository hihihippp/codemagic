$(function () {
	'use strict';

	app.utils = {};

	app.utils.isTrue = function (value) {
		if (typeof value !== 'boolean') {
			return value === 'true';
		} else {
			return value;
		}
	};

	app.utils.getParams = function () {
		var params = {};
		var queryString = location.search.substring(1); // For # params use location.hash
		var regex = /([^&=]+)=([^&]*)/g;
		var m;

		while (m = regex.exec(queryString)) {
			params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
		}

		return params;
	};

	app.utils.getState = function () {
		var state = Math.random().toString(36).substring(2);

		return state;
	};

	app.utils.safeFilename = function (value) {
		return value.replace(/[^a-z0-9]/gi, '_').toLowerCase();
	};

	app.utils.normalizeValue = function (value) {
		var result = value;

		if (value === 'true') {
			result = true;
		} else  if (value === 'false') {
			result = false;
		} else  if (value === 'undefined') {
			result = undefined;
		} else  if (value === 'null') {
			result = null;
		} else  if (value === 'NaN') {
			result = NaN;
		} else  if (!isNaN(value)) {
			result = parseInt(value, 10);
		}

		return result;
	};

	app.utils.updateShareUrls = function (callback) {
		$('#share-modal').find('a.twitter').attr('href', 'http://twitter.com/home?status=' + app.session.title + ' ' + window.location.href + ' from @code_Magic');
		$('#share-modal').find('a.facebook').attr('href', 'http://www.facebook.com/sharer.php?u=' + window.location.href);
		$('#share-modal').find('a.google-plus').attr('href', 'https://plus.google.com/share?url=' + window.location.href + '&title=' + app.session.title);
		$('#share-modal').find('a.linkedin').attr('href', 'http://www.linkedin.com/shareArticle?mini=true&url=' + window.location.href + '&title=' + app.session.title + '&summary=' + app.session.description + '&source=http://codeMagic.gr');
		$('#share-modal').find('a.pinterest').attr('href', 'http://pinterest.com/pin/create/bookmarklet/?url=' + window.location.href + '&is_video=false&description=' + app.session.title);

		if (typeof callback == 'function') {
			callback();
		}
	};

	app.utils.resizeEditors = function (callback) {
		app.editors.html.resize();
		app.editors.css.resize();
		app.editors.js.resize();

		if (typeof callback == 'function') {
			callback();
		}
	};

	app.utils.em2px = function () {
		var div = $('<div style="width: 1em;"></div>').appendTo('body');
		var em = div.width();
		div.remove();

		return parseInt(em, 10);
	};

	app.utils.rem2px = function () {
		var div = $('<div style="width: 1rem;"></div>').appendTo('body');
		var rem = div.width();
		div.remove();

		return parseInt(rem, 10);
	};

	app.utils.write2iframe = function (iframe, result, callback) {
		var iframeDocument = iframe.contentDocument;
		iframeDocument.open();
		iframeDocument.write(result);
		iframeDocument.close();

		if (typeof callback == 'function') {
			callback();
		}
	};

	app.utils.consoleClear = function (callback) {
		$('#console-editor').html('');

		if (typeof callback == 'function') {
			callback();
		}
	};

	app.utils.consoleLog = function (log, callback) {
		$('#console .editor-module').addClass('enabled');
		$('#console-editor').append('<code class="js-error">&gt; ' + log + '</code>');

		if (typeof callback == 'function') {
			callback();
		}
	};

	app.utils.generateResult = function () {
		var result = app.utils.generateHead() + app.utils.generateBody();

		return result;
	};

	app.utils.generateZippedResult = function () {
		var result = app.utils.generateZippedHead() + app.utils.generateZippedBody();

		return result;
	};

	app.utils.generateLogger = function () {
		// TODO: better error handling and object debugging
		// WHY: breaking down logger into many pieces to prevent proxies from chocking by passing the 500 character limit

		var result = '<script>window.eval = {};window.onerror=function(msg,url,line) {';
		result += 'parent.document.getElementById("console-editor").insertAdjacentHTML("beforeend","<code class=\'js-error\'>> "+msg+" </code>")};';
		result += 'console.log=function() {var str="",count=0;for(var i=0;';
		result += 'i<arguments.length;i++) {if (typeof arguments[i]=="object") {str="Object {<br>";for(var item in arguments[i])if (arguments[i].hasOwnProperty(item)) {count++;';
		result += 'str+="\t"+item+" : "+arguments[i][item]+",<br>"}str=str.substring(0,str.length-5)+"<br>}";';
		result += 'if (count===0) {str="Object {}";count=0}} else str=arguments[i];';
		result += 'parent.document.getElementById("console-editor").insertAdjacentHTML("beforeend","<code>> "+str+"</code><br>")}};</script>';
		return result;
	};

	app.utils.generateContent = function () {
		var result = '';
		if ($('#markupChoice').val() === 'Markdown') {
			marked.setOptions({
				breaks: true,
				sanitize: false
			});
			result = marked(app.editors.html.getValue());
		} else if ($('#markupChoice').val() === 'HAML') {
			app.utils.consoleLog('HAML support is not implemented yet.');
		} else if ($('#markupChoice').val() === 'Slim') {
			app.utils.consoleLog('Slim support is not implemented yet.');
		} else if ($('#markupChoice').val() === 'Jade') {
			app.utils.consoleLog('Jade support is not implemented yet.');
		} else {
			result = app.editors.html.getValue();
		}

		return result;
	};

	app.utils.generateStyle = function () {
		var result = '';

		if ($('#styleChoice').val() === 'Less') {
			var parser = new(less.Parser)();

			parser.parse(app.editors.css.getValue(), function (e, tree) {
				if (e) {
					// TODO: better error handling in console
					$('#console-editor').append('<code>> ' + e.message + '</code><br>');
				}
				result = tree.toCSS();
			});
		} else if ($('#styleChoice').val() === 'SCSS') {
			// TODO: better error handling in console
			result = Sass.compile(app.editors.css.getValue());
			if (result.message) {
				$('#console-editor').append('<code>> ' + result.message + '</code><br>');
			}
		} else if ($('#styleChoice').val() === 'Stylus') {
			app.utils.consoleLog('Stylus support is not implemented yet.');
		} else {
			result = app.editors.css.getValue();
		}

		return result;
	};

	app.utils.generateExternalStyle = function () {
		var items = $("select[name=csslibrary]").val();
		var result = '';

		if(items){
			for (var i = 0; i < items.length; i++) {
				result+= '<link rel="stylesheet" href="'+ items[i] + '">';
			}
		}

		return result;
	};

	app.utils.generateScript = function () {
		var result = '';

		if ($('#scriptChoice').val() === 'CoffeeScript') {
			app.utils.consoleLog('CoffeeScript support is not implemented yet.');
		} else {
			result = app.editors.js.getValue();
		}

		return result;
	};

	app.utils.generateExternalScript = function () {
		var items = $("select[name=jslibrary]").val();
		var result = '';

		if (items) {
			for (var i = 0; i < items.length; i++) {
				result+= '<script src="'+ items[i] + '"></script>';
			}
		}

		return result;
	};

	app.utils.generateHead = function () {
		var style = app.utils.generateStyle();
		var externalStyle = app.utils.generateExternalStyle();
		var logger = app.utils.generateLogger();
		var result = '<!doctype html><html><head>' + logger + '<meta charset="utf-8"><title>' + app.session.title + '</title><meta name="description" content="' + app.session.description + '"><meta name="author" content="' + app.session.author + '">' + externalStyle + '<style>' + style + '</style></head>';

		return result;
	};

	app.utils.generateZippedHead = function () {
		var style = '<link rel="stylesheet" href="style.css">';
		var externalStyle = app.utils.generateExternalStyle();
		var result = '<!doctype html><html><head><meta charset="utf-8"><title>' + app.session.title + '</title><meta name="description" content="' + app.session.description + '"><meta name="author" content="' + app.session.author + '">' + externalStyle + style + '</head>';

		return result;
	};

	app.utils.generateBody = function () {
		var content = app.utils.generateContent();
		var script= app.utils.generateScript();
		var externalScript = app.utils.generateExternalScript();
		var result = '<body>' + content + externalScript + '<script>' + script + '</script></body></html>';

		return result;
	};

	app.utils.generateZippedBody = function () {
		var content = app.utils.generateContent();
		var script= '<script src="script.js"></script>';
		var externalScript = app.utils.generateExternalScript();
		var result = '<body>' + content + externalScript + script + '</body></html>';

		return result;
	};

	app.utils.updateLayout = function (callback) {
		app.utils.resizeEditors();

		if (typeof callback == 'function') {
			callback();
		}
	};

	app.utils.setTheme = function (theme, callback) {
		_.each([app.editors.html, app.editors.css, app.editors.js], function(editor) {
			editor.setTheme('ace/theme/' + theme);
		});

		app.utils.setSettings('theme', theme);

		if (typeof callback == 'function') {
			callback();
		}
	};

	app.utils.setEditorMode = function (target, mode, callback) {
		app.session[target].mode = mode;

		app.utils.setSettings(target + '.mode', mode);

		if (mode === 'coffeescript') {
			mode = 'coffee';
		}

		app.editors[target + 'Session'].setMode('ace/mode/' + mode);

		if (typeof callback == 'function') {
			callback();
		}
	};

	app.utils.setOption = function (option, value, callback) {
		var result = {};

		if (option !== 'csslibrary' && option !== 'jslibrary') {
			result[option] = value;

			_.each([app.editors.html, app.editors.css, app.editors.js], function(editor) {
				editor.setOptions(result);
			});

			app.utils.setSettings(option, value);
		}

		if (typeof callback == 'function') {
			callback();
		}
	};

	app.utils.getAllSettings = function () {
		var keys = Object.keys(localStorage);
		var result = {};
		var value;

		for (var i = 0; i < keys.length; i++) {
			value = localStorage.getItem(keys[i]);
			result[keys[i].replace('codemagic.', '')] = app.utils.normalizeValue(value);
		}

		return result;
	};

	app.utils.getSettings = function (option) {
		var result;

		if (option !== 'csslibrary' && option !== 'jslibrary') {
			result = localStorage.getItem('codemagic.' + option);
			result = app.utils.normalizeValue(result);

			app.session[option] = result;
		}

		return result;
	};

	app.utils.setSettings = function (option, val, callback) {
		app.session[option] = val;
		option = 'codemagic.' + option;
		localStorage.setItem(option, val);

		if (typeof callback == 'function') {
			callback();
		}
	};

	app.utils.tabsOrSpaces = function (choice) {
		var result;
		var error = new Error('choice must be either "size" or "char"');

		if (app.session.useSoftTabs){
			if (choice === 'size') {
				result = app.session.tabSize;
			} else if (choice === 'char') {
				result = ' ';
			} else {
				throw error;
			}
		} else {
			if (choice === 'size') {
				result = 1;
			} else if (choice === 'char') {
				result = '\t';
			} else {
				throw error;
			}
		}

		return result;
	};

	app.utils.toggleEditorState = function (target, callback) {
		var state = false;
		if ($('#' + target + '-editor-toggle').hasClass('enabled')) {
			state = true;
		}
		app.session[target].state = state;

		if (typeof callback == 'function') {
			callback();
		}
	};

	app.utils.toggleFullscreenMode = function (target, callback) {
		if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
			if (target.requestFullscreen) {
				target.requestFullscreen();
			} else if (target.mozRequestFullScreen) {
				target.mozRequestFullScreen();
			} else if (target.msRequestFullScreen) {
				target.msRequestFullScreen();
			} else if (target.webkitRequestFullscreen) {
				target.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
			}
		} else {
			if (document.cancelFullScreen) {
				document.cancelFullScreen();
			}
			else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			}
			else if (document.msCancelFullScreen) {
				document.msCancelFullScreen();
			}
			else if (document.webkitCancelFullScreen) {
				document.webkitCancelFullScreen();
			}
		}

		if (typeof callback == 'function') {
			callback();
		}
	};

	app.utils.toggleHideEditorsMode = function (callback) {
		var editors = $('#editors');
		var result = $('#result');

		var state1 = !editors.hasClass('hideEditors');
		var state2 = result.hasClass('hideResult');

		if (state1) {
			editors.addClass('hideEditors');

			if (state2) {
				app.utils.toggleHideResultMode();
			}

			editors.addClass('hideEditors');
			result.addClass('hideEditors');
		} else {
			result.removeClass('hideEditors');

			editors.removeClass('hideEditors');
			editors.removeClass('hideEditors');
		}

		if (typeof callback == 'function') {
			callback();
		}
	};

	app.utils.toggleHideResultMode = function (callback) {
		var editors = $('#editors');
		var result = $('#result');

		var state = !result.hasClass('hideResult');
		var state2 = result.hasClass('hideEditors');

		if (state) {
			result.addClass('hideResult');

			if (state2) {
				app.utils.toggleHideEditorsMode();
			}

			result.hide();
			editors.addClass('hideResult');
		} else {
			editors.removeClass('hideResult');

			result.show();
			result.removeClass('hideResult');
		}

		if (typeof callback == 'function') {
			callback();
		}
	};
});
