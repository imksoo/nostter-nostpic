import { Signer } from '$lib/Signer';
import type { Kind } from 'nostr-tools';
import type { Media, MediaResult } from './Media';
import { now } from 'rx-nostr';

export class NostPic implements Media {
	async upload(file: File, type: 'media' | 'avatar' | 'banner' = 'media'): Promise<MediaResult> {
		const method = 'POST';
		const url = 'https://nostpic.com/api/v1/media';

		const form = new FormData();
		form.set('uploadtype', type);
		form.set('mediafile', file);

		const event = await Signer.signEvent({
			kind: 27235 as Kind,
			content: '',
			created_at: now(),
			tags: [
				['u', url],
				['method', method],
				['payload', '']
			]
		});
		console.log('[nostpic.com auth]', event);

		const response = await fetch(url, {
			method,
			headers: {
				Authorization: `Nostr ${btoa(JSON.stringify(event))}`,
				Accept: 'application/json'
			},
			body: form
		});

		if (!response.ok) {
			throw new Error(await response.text());
		}

		const data = await response.json();

		console.log('[nostpic.com result]', data);

		return {
			url: data.url,
			data
		};
	}
}
