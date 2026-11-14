import { getImageCredit } from "../lib/nasa";

type ImageCreditProps = {
	id: string;
};

export function ImageCredit({ id }: ImageCreditProps) {
	const image = getImageCredit(id);
	if (!image) {
		return null;
	}

	return (
		<span className="image-credit">
			{image.title} — {image.credit}
			{image.source_url ? (
				<>
					{" "}
					(
					<a href={image.source_url} target="_blank" rel="noreferrer">
						source
					</a>
					)
				</>
			) : null}
		</span>
	);
}
