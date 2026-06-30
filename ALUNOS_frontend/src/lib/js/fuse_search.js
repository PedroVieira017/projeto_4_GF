import Fuse from 'fuse.js'
import { getObjectKeys } from '$lib/uteis.js';

export default function fuseSearch(dataset, keyword, options) {
	if(!options) {
		options = {
			keys: getObjectKeys(dataset[0]),
			threshold: 0.3,
			location: 0,
			distance: 100,
			includeMatches: true,
			includeScore: true,
			useExtendedSearch: true
		};
	}

	const fuse = new Fuse(dataset, options);

	return fuse.search(keyword);
}