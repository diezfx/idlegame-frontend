interface Logger {
	debug(msg: string, attributes?: object): void;
	info(msg: string, attributes?: object): void;
	warn(msg: string, attributes?: object): void;
	error(msg: string, attributes?: object): void;
}

class SimpleLogger implements Logger {
	private log(level: string, msg: string, attributes?: object | undefined): void {
		if (level === 'error') {
			console.error(JSON.stringify({ level: level, timestamp: new Date(), msg: msg, attributes: attributes }));
		} else if (level === 'warn') {
			console.warn(JSON.stringify({ level: level, timestamp: new Date(), msg: msg, attributes: attributes }));
		} else {
			console.info(JSON.stringify({ level: level, timestamp: new Date(), msg: msg, attributes: attributes }));
		}
	}

	info(msg: string, attributes?: object): void {
		this.log('info', msg, attributes);
	}
	warn(msg: string, attributes?: object): void {
		this.log('warn', msg, attributes);
	}
	error(msg: string, attributes?: object): void {
		this.log('error', msg, attributes);
	}
	debug(msg: string, attributes?: object): void {
		this.log('debug', msg, attributes);
	}
}

export default new SimpleLogger();
