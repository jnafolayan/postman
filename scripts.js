window.addEventListener('load', () => {
	const btnAddBody = document.querySelector('#toggle-body');
	const btnSend = document.querySelector('#send');

	const ctnReqBody = document.querySelector('.req__body-wrap');

	const fldReqBody = document.querySelector('.req__body');
	const fldResBody = document.querySelector('.res__body');
	const fldMethod = document.querySelector('#http-method');
	const fldContentType = document.querySelector('#content-type');
	const fldToken = document.querySelector('#x-access-token');
	const fldUrl = document.querySelector('#url-address');

	let hasBody = false;

	fldMethod.value = localStorage.getItem('method') || 'GET';
	fldToken.value = localStorage.getItem('token') || '';
	fldUrl.value = localStorage.getItem('url') || '';
	try {
		fldReqBody.value = prettyPrintJSON(JSON.parse(localStorage.getItem('reqBody')));
	} catch(err) {
		fldReqBody.value = '';
	}

	btnAddBody.addEventListener('click', () => {
		hasBody = !hasBody;
		ctnReqBody.classList.toggle('slide-down');
	});

	btnSend.addEventListener('click', () => {
		const url = fldUrl.value;
		const method = fldMethod.value;
		const headers = {};
		let body = fldReqBody.value;

		headers['Content-Type'] = fldContentType.value;
		if (fldToken.value) {
			headers['x-access-token'] = fldToken.value;
			localStorage.setItem('token', fldToken.value);
		}

		if (headers['Content-Type'] === 'application/json') {
			try {
				body = JSON.parse(body);
			} catch(err) {
				alert('Invalid request body');
				return;
			}
		}

		const options = {
			method,
			headers
		};

		if (method !== 'GET' && method !== 'HEAD') {
			// enable body
			body = JSON.stringify(body);
			options.body = body;
			localStorage.setItem('reqBody', body);
		}

		localStorage.setItem('method', method);
		localStorage.setItem('url', url);

		fetch(url, options)
			.then(res => res.json())
			.then(res => {
				fldResBody.value = prettyPrintJSON(res);
			});
	});
});

function prettyPrintJSON(json) {
	const indent = '    ';
	let out = `{${recurse(json, 1, '')}\n}`;

	function isObject(o) {
		return !!o && Object.getPrototypeOf(o) === Object.prototype;
	}

	function recurse(obj, level, curOut) {
		for (let field in obj) {
			let value = obj[field];
			curOut += `\n${indent.repeat(level)}"${field}": `;
			if (isObject(value)) {
				curOut += `{${recurse(value, level + 1, '')}\n${indent.repeat(level)}}`;
			} else if (Array.isArray(value)) {
				if (isObject(value[0])) {
					curOut += '[';
					value.forEach(o => {
						curOut += `{${recurse(o, level + 1, '')}\n${indent.repeat(level)}}`
					});
					curOut += ']';
				} else {
					curOut += `[ ${value.join(', ')} ]`;
				}
			} else {
				if (!Number.isFinite(value))
					value = '"' + value + '"';
				curOut += value + ',';
			}
		}
		return curOut;
	}

	return out;
}
