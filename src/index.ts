import Cloudflare from 'cloudflare';
import { Hono } from 'hono';

const countryCodes = [
	'AF',
	'AL',
	'DZ',
	'AS',
	'AD',
	'AO',
	'AI',
	'AQ',
	'AG',
	'AR',
	'AM',
	'AW',
	'AU',
	'AT',
	'AZ',
	'BS',
	'BH',
	'BD',
	'BB',
	'BY',
	'BE',
	'BZ',
	'BJ',
	'BM',
	'BT',
	'BO',
	'BQ',
	'BA',
	'BW',
	'BV',
	'BR',
	'IO',
	'BN',
	'BG',
	'BF',
	'BI',
	'CV',
	'KH',
	'CM',
	'CA',
	'KY',
	'CF',
	'TD',
	'CL',
	'CN',
	'CX',
	'CC',
	'CO',
	'KM',
	'CD',
	'CG',
	'CK',
	'CR',
	'HR',
	'CU',
	'CW',
	'CY',
	'CZ',
	'CI',
	'DK',
	'DJ',
	'DM',
	'DO',
	'EC',
	'EG',
	'SV',
	'GQ',
	'ER',
	'EE',
	'SZ',
	'ET',
	'FK',
	'FO',
	'FJ',
	'FI',
	'FR',
	'GF',
	'PF',
	'TF',
	'GA',
	'GM',
	'GE',
	'DE',
	'GH',
	'GI',
	'GR',
	'GL',
	'GD',
	'GP',
	'GU',
	'GT',
	'GG',
	'GN',
	'GW',
	'GY',
	'HT',
	'HM',
	'VA',
	'HN',
	'HK',
	'HU',
	'IS',
	'IN',
	'ID',
	'IR',
	'IQ',
	'IE',
	'IM',
	'IL',
	'IT',
	'JM',
	'JP',
	'JE',
	'JO',
	'KZ',
	'KE',
	'KI',
	'KP',
	'KR',
	'KW',
	'KG',
	'LA',
	'LV',
	'LB',
	'LS',
	'LR',
	'LY',
	'LI',
	'LT',
	'LU',
	'MO',
	'MG',
	'MW',
	'MY',
	'MV',
	'ML',
	'MT',
	'MH',
	'MQ',
	'MR',
	'MU',
	'YT',
	'MX',
	'FM',
	'MD',
	'MC',
	'MN',
	'ME',
	'MS',
	'MA',
	'MZ',
	'MM',
	'NA',
	'NR',
	'NP',
	'NL',
	'NC',
	'NZ',
	'NI',
	'NE',
	'NG',
	'NU',
	'NF',
	'MK',
	'MP',
	'NO',
	'OM',
	'PK',
	'PW',
	'PS',
	'PA',
	'PG',
	'PY',
	'PE',
	'PH',
	'PN',
	'PL',
	'PT',
	'PR',
	'QA',
	'RE',
	'RO',
	'RU',
	'RW',
	'BL',
	'SH',
	'KN',
	'LC',
	'MF',
	'PM',
	'VC',
	'WS',
	'SM',
	'ST',
	'SA',
	'SN',
	'RS',
	'SC',
	'SL',
	'SG',
	'SX',
	'SK',
	'SI',
	'SB',
	'SO',
	'ZA',
	'GS',
	'SS',
	'ES',
	'LK',
	'SD',
	'SR',
	'SJ',
	'SE',
	'CH',
	'SY',
	'TW',
	'TJ',
	'TZ',
	'TH',
	'TL',
	'TG',
	'TK',
	'TO',
	'TT',
	'TN',
	'TR',
	'TM',
	'TC',
	'TV',
	'UG',
	'UA',
	'AE',
	'GB',
	'US',
	'UM',
	'UY',
	'UZ',
	'VU',
	'VE',
	'VN',
	'VG',
	'VI',
	'WF',
	'EH',
	'YE',
	'ZM',
	'ZW',
];

enum modes {
	'block',
	'challenge',
	'whitelist',
	'js_challenge',
	'managed_challenge',
}

type listItem = {
	id: string;
	paused: boolean;
	modified_on: string;
	allowed_modes: string[];
	mode: string;
	notes: string;
	configuration: {
		target: string;
		value: keyof typeof countryCodes;
	};
	scope: {
		id: string;
		name: string;
		type: string;
	};
	created_on: string;
};

const app = new Hono<{ Bindings: Env }>();

app.get('/favicon.ico', (c) => c.json(null, { status: 404 }));

app.get('/:mode', async (c) => {
	const cf = new Cloudflare({ apiEmail: c.env.apiEmail, apiKey: c.env.apiKey });
	const mode = c.req.param('mode') as keyof typeof modes;
	if (!mode) {
		return c.json({ error: 'mode is required' });
	}
	if (!(mode in modes)) {
		return c.json({ error: 'allowed mode: block, challenge, whitelist, js_challenge, managed_challenge' });
	}

	const results = await cf.firewall.accessRules.list({
		zone_id: c.env.ZONEID,
		per_page: 1000,
	});

	const returnJSON = (results.result as listItem[]).filter((item) => {
		return item.mode === mode;
	});
	return c.json({ returnJSON });
});

app.post('/:mode', async (c) => {
	const cf = new Cloudflare({ apiEmail: c.env.apiEmail, apiKey: c.env.apiKey });
	const mode = c.req.param('mode') as keyof typeof modes;
	if (!mode) {
		return c.json({ error: 'mode is required' });
	}
	if (!(mode in modes)) {
		return c.json({ error: 'allowed mode: block, challenge, whitelist, js_challenge, managed_challenge' });
	}

	const results = await Promise.all(
		countryCodes.map(async (code) => {
			return await cf.firewall.accessRules.create({
				configuration: { target: 'country', value: code },
				mode: mode,
				zone_id: c.env.ZONEID,
			});
		})
	);
	return c.json(results);
});

app.delete('/:mode', async (c) => {
	const cf = new Cloudflare({ apiEmail: c.env.apiEmail, apiKey: c.env.apiKey });
	const mode = c.req.param('mode') as keyof typeof modes;
	if (!mode) {
		return c.json({ error: 'mode is required' });
	}
	if (!(mode in modes)) {
		return c.json({ error: 'allowed mode: block, challenge, whitelist, js_challenge, managed_challenge' });
	}

	const listResults = await cf.firewall.accessRules.list({
		zone_id: c.env.ZONEID,
		per_page: 1000,
	});

	const json = (listResults.result as listItem[]).filter((item) => {
		return item.mode === mode;
	});

	const deleteResult = await Promise.all(
		json.map(async (item) => {
			return await cf.firewall.accessRules.delete(item.id, { zone_id: c.env.ZONEID });
		})
	);

	return c.json(deleteResult, { status: 200 });
});

export default app;
