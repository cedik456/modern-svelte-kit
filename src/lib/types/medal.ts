export type MedalImage = {
	id?: number;
	src: string;
	thumbnailSrc: string;
	fullSrc: string;
	width?: number;
	height?: number;
	thumbnailWidth?: number;
	thumbnailHeight?: number;
};

export type Medal = {
	id?: number;
	title: string;
	tag: string;
	distanceLabel?: string;
	eventDate?: string;
	location?: string;
	finishTime?: string;
	pace?: string;
	placement?: string;
	stravaUrl?: string;
	description?: string;
	src?: string;
	thumbnailSrc?: string;
	fullSrc?: string;
	images?: MedalImage[];
};
