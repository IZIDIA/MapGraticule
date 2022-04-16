import classNames from 'classnames';
import { CommonProps } from '../common/CommonProps';
import './Tile.css';

export function Tile(props: Readonly<{
	src: string;
	tileSize: number;
	left: number;
	top: number;
}> & CommonProps) {
	return (
		<img
			alt=""
			className={classNames('Tile', props.className)}
			src={props.src}
			width={props.tileSize}
			height={props.tileSize}
			style={{
				// left: props.left,
				// top: props.top,
				transform: `translate3d(${Math.round(props.left)}px, ${Math.round(props.top)}px, 0px)`,
				...props.style,
			}}
		></img>
	);
}
