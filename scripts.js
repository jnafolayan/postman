window.addEventListener('load', () => {
	const btnAddBody = document.querySelector('#toggle-body');
	const btnSend = document.querySelector('#send');

	const ctnReqBody = document.querySelector('.req__body-wrap');

	const fldReqBody = document.querySelector('.req__body');
	const fldResBody = document.querySelector('.res__body');
	const fldMethod = document.querySelector('#http-method');
	const fldContentType = document.querySelector('#content-type');
	const fldUrl = document.querySelector('#url-address');

	let hasBody = false;

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

	function recurse(obj, level, curOut) {
		for (let field in obj) {
			let value = obj[field];
			curOut += `\n${indent.repeat(level)}"${field}": `;
			if (Object.getPrototypeOf(value) === Object.prototype) {
				curOut += `{${recurse(value, level + 1, '')}\n${indent.repeat(level)}}`;
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
