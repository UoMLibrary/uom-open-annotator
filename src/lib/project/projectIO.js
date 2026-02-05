export function supportsFileSystemAccess() {
	return 'showDirectoryPicker' in window;
}

function normalise(name) {
	return name.replace(/^\/+/, '');
}

export async function loadProjectFromFiles(fileMap) {
	const projectFile = fileMap.get('project.json');
	if (!projectFile) throw new Error('No project.json found');

	const text = await projectFile.text();
	const data = JSON.parse(text);

	data.imagePairs = data.imagePairs.map((pair) => {
		if (pair.imageA.startsWith('blob:')) {
			throw new Error('project.json contains blob URLs. This project was saved incorrectly.');
		}

		const imageA = normalise(pair.imageA);
		const imageB = normalise(pair.imageB);

		const fileA = fileMap.get(imageA);
		const fileB = fileMap.get(imageB);

		if (!fileA || !fileB) {
			throw new Error(`Missing image for pair "${pair.id}"`);
		}

		return {
			...pair,
			imageAUrl: URL.createObjectURL(fileA),
			imageBUrl: URL.createObjectURL(fileB)
		};
	});

	return data;
}

export async function saveProjectToDownload(project) {
	const blob = new Blob([JSON.stringify(project, null, 2)], {
		type: 'application/json'
	});

	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'project.json';
	a.click();
	URL.revokeObjectURL(url);
}
