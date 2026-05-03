import { randomUUID } from 'node:crypto';
import { del, put } from '@vercel/blob';
import sharp from 'sharp';
import { env } from '$env/dynamic/private';

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_TOTAL_UPLOAD_BYTES = 4 * 1024 * 1024;
const MAX_IMAGE_COUNT = 6;
const MAIN_MAX_WIDTH = 1200;
const THUMBNAIL_MAX_WIDTH = 640;
const WEBP_QUALITY = 82;
const THUMBNAIL_QUALITY = 72;

export type ProcessedUpload = {
	fullUrl: string;
	thumbnailUrl: string;
	width: number;
	height: number;
	thumbnailWidth: number;
	thumbnailHeight: number;
	sortOrder: number;
};

function slugifySegment(value: string) {
	return value
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 48);
}

function assertBlobConfigured() {
	if (!env.BLOB_READ_WRITE_TOKEN) {
		throw new Error('BLOB_READ_WRITE_TOKEN is not configured.');
	}
}

async function processVariant(
	buffer: Buffer,
	maxWidth: number,
	quality: number
): Promise<{ data: Buffer; width: number; height: number }> {
	const result = await sharp(buffer)
		.rotate()
		.resize({ width: maxWidth, withoutEnlargement: true, fit: 'inside' })
		.webp({ quality, effort: 4 })
		.toBuffer({ resolveWithObject: true });

	return {
		data: result.data,
		width: result.info.width ?? maxWidth,
		height: result.info.height ?? maxWidth
	};
}

export function validateUploadFiles(files: File[]) {
	if (files.length > MAX_IMAGE_COUNT) {
		throw new Error(`You can upload up to ${MAX_IMAGE_COUNT} images per achievement.`);
	}

	const totalBytes = files.reduce((total, file) => total + file.size, 0);
	if (totalBytes > MAX_TOTAL_UPLOAD_BYTES) {
		throw new Error('Selected images must be 4MB or smaller in total.');
	}

	for (const file of files) {
		if (!file.type.startsWith('image/')) {
			throw new Error('Only image uploads are allowed.');
		}

		if (file.size > MAX_IMAGE_BYTES) {
			throw new Error('Each image must be 2MB or smaller before processing.');
		}
	}
}

export async function uploadAchievementImages(
	files: File[],
	options: { userId: string; title: string }
): Promise<ProcessedUpload[]> {
	assertBlobConfigured();
	validateUploadFiles(files);

	const uploadedUrls: string[] = [];

	try {
		return await Promise.all(
			files.map(async (file, index) => {
				const input = Buffer.from(await file.arrayBuffer());
				const baseName = `${slugifySegment(options.userId)}-${slugifySegment(options.title || 'achievement')}-${randomUUID()}`;

				const [mainImage, thumbnailImage] = await Promise.all([
					processVariant(input, MAIN_MAX_WIDTH, WEBP_QUALITY),
					processVariant(input, THUMBNAIL_MAX_WIDTH, THUMBNAIL_QUALITY)
				]);

				const [fullBlob, thumbnailBlob] = await Promise.all([
					put(`achievements/${baseName}-full.webp`, mainImage.data, {
						access: 'public',
						contentType: 'image/webp',
						addRandomSuffix: false
					}),
					put(
						`achievements/${baseName}-thumb.webp`,
						thumbnailImage.data,
						{
							access: 'public',
							contentType: 'image/webp',
							addRandomSuffix: false
						}
					)
				]);

				uploadedUrls.push(fullBlob.url, thumbnailBlob.url);

				return {
					fullUrl: fullBlob.url,
					thumbnailUrl: thumbnailBlob.url,
					width: mainImage.width,
					height: mainImage.height,
					thumbnailWidth: thumbnailImage.width,
					thumbnailHeight: thumbnailImage.height,
					sortOrder: index
				};
			})
		);
	} catch (error) {
		if (uploadedUrls.length) {
			await del(uploadedUrls);
		}

		throw error;
	}
}
