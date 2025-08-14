// holds all configuration e.g. the api base url

export interface Config {
	apiBaseUrl: string;
	masterdataBaseUrl: string;
}

export const config: Config = {
	apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
	masterdataBaseUrl: import.meta.env.VITE_MASTERDATA_BASE_URL,
};
