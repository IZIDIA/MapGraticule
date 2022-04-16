import classNames from 'classnames';
import { CommonProps } from '../common/CommonProps';
import { DebugOverlay } from './DebugOverlay';
import { MapContext } from './MapContext';
import { MapSettings } from './MapSettings';
import { MapState } from './MapState';
import { Tile } from './Tile';
import './TileLayer.css';
import { TileLayerSettings } from './TileLayerSettings';

export function TileLayer(props: Readonly<{
	mapContext: MapContext;
	mapState: MapState;
	mapSettings: MapSettings;
	tileLayerSettings: TileLayerSettings;
}> & CommonProps) {
	const { mapContext, mapState, mapSettings, tileLayerSettings } = props;
	const { centerX, centerY, mapZoom } = mapState;
	const { width, height } = mapContext;
	const { debug } = mapSettings;
	const { getTileUrl, tileSize, maxZoom } = tileLayerSettings;
	const zoom = mapZoom - Math.log2(tileSize);
	const roundedZoom = Math.max(0, Math.min(maxZoom, Math.round(zoom)));
	const tileCount = Math.pow(2, roundedZoom);
	const worldSize = tileCount * tileSize;
	const distanceToCenterX = centerX * worldSize;
	const distanceToCenterY = centerY * worldSize;
	const left = distanceToCenterX - width * 0.5;
	const right = distanceToCenterX + width * 0.5;
	const top = distanceToCenterY - height * 0.5;
	const bottom = distanceToCenterY + height * 0.5;
	const leftCoord = Math.floor(left / tileSize);
	const rightCoord = Math.ceil(right / tileSize);
	const topCoord = Math.floor(top / tileSize);
	const bottomCoord = Math.ceil(bottom / tileSize);
	const offsetX = leftCoord * tileSize - left;
	const offsetY = topCoord * tileSize - top;
	const tiles: JSX.Element[] = [];
	for (let x = leftCoord; x <= rightCoord; x++) {
		for (let y = topCoord; y <= bottomCoord; y++) {
			if (!(0 <= x && x < tileCount && 0 <= y && y < tileCount)) {
				continue;
			}
			const z = roundedZoom;
			const tileUrl = getTileUrl(x, y, z);
			const tile = (
				<Tile
					key={tileUrl}
					src={tileUrl}
					tileSize={tileSize}
					left={offsetX + (x - leftCoord) * tileSize}
					top={offsetY + (y - topCoord) * tileSize}
				></Tile>
			);
			tiles.push(tile);
			if (debug) {
				const debugTile = (
					<div
						className="TileLayer-debug-tile"
						key={`${x}/${y}/${z}`}
						style={{
							left: offsetX + (x - leftCoord) * tileSize,
							top: offsetY + (y - topCoord) * tileSize,
							width: tileSize,
							height: tileSize,
						}}
					>{`${x}/${y}/${z}`}</div>
				);
				tiles.push(debugTile);
			}
		}
	}
	return (
		<div
			className={classNames('TileLayer', props.className)}
			style={{
				width,
				height,
				...props.style,
			}}
		>
			{tiles}
			{debug &&
				<DebugOverlay style={{ left: 0, bottom: 0, minWidth: 300 }}>
					{JSON.stringify({
						tileLayerSettings,
						zoom,
						roundedZoom,
					}, null, 2)}
				</DebugOverlay>
			}
		</div>
	);
}

