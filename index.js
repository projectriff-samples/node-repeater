const {TextDecoder} = require('util');
const repeater = require('./repeater');
const {PassThrough, Readable, Transform} = require('stream');

class ConstantSource extends Readable {

	constructor(options, constant) {
		super(options);
		this.constant = constant;
	}

	_read(size) {
		for (let i = 0; i < size; i++) {
			this.push(this.constant);
		}
	}
}

class StdinSource extends Readable {

	constructor(options) {
		super(options);
		this.decoder = new TextDecoder('utf8');
		process.stdin.on('data', (chunk) => {
			this.push(this.decoder.decode(chunk).trim());
		});
	}

	_read(size) {
		
	}
}

class StdoutSink extends Transform {

	constructor(options) {
		super(options);
		this.pipe(process.stdout);
	}

	_transform(chunk, _, callback) {
		callback(null, '\x1b[33m' + chunk + '\x1b[0m\n');
	}
}

const main = () => {
	if (process.argv.length < 3) {
		console.error('Please specify a number.');
		process.exit(1);
	}

	const options = {objectMode: true};
	const inputStream1 = new ConstantSource(options, process.argv[2]);
	const inputStream2 = new StdinSource(options);
	const outputStream = new StdoutSink(options);

	repeater({
		"0": inputStream1,
		"1": inputStream2
	}, {
		"0": outputStream
	});
}

main();

