import proj4 from 'proj4';
import { Layer, Line, Stage, Text } from 'react-konva';
import { linearInterpolation } from 'simple-linear-interpolation';
import { CommonProps } from '../common/CommonProps';
import { MapContext } from '../map/MapContext';
import { MapSettings } from '../map/MapSettings';
import { MapState } from '../map/MapState';
import { TileLayerSettings } from '../map/TileLayerSettings';
import { GraticuleState } from './GraticuleState';

const ceilb = require('@stdlib/math-base-special-ceilb');
const floorb = require('@stdlib/math-base-special-floorb');

export function GraticuleLayer(props: Readonly<{
	mapContext: MapContext;
	mapState: MapState;
	mapSettings: MapSettings;
	tileLayerSettings: TileLayerSettings;
	graticulesState: GraticuleState;
}> & CommonProps) {
	const { mapContext, mapState, tileLayerSettings, graticulesState } = props;
	const { centerX, centerY, mapZoom } = mapState;
	const { width, height } = mapContext;
	const { tileSize, maxZoom } = tileLayerSettings;
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
	const heightInterpolarFromMetersToWorldSize = linearInterpolation([{ x: -20037508.3427892, y: -top }, { x: 20037508.3427892, y: -top + worldSize }]);
	const widthInterpolarFromMetersToWorldSize = linearInterpolation([{ x: -20037508.3427892, y: -left }, { x: 20037508.3427892, y: -left + worldSize }]);
	const interpolarFromMapToWorldSize = linearInterpolation([{ x: 0, y: 0 }, { x: 1, y: worldSize }]);
	const interpolarFromWorldSizeToMeters = linearInterpolation([{ x: 0, y: -20037508.3427892 }, { x: worldSize, y: 20037508.3427892 }]);
	const xInterpolarCenterScreen = interpolarFromMapToWorldSize({ x: centerX });
	const yInterpolarCenterScreen = interpolarFromMapToWorldSize({ x: centerY });
	const xStartScreen = xInterpolarCenterScreen - width * 0.5;
	const yStartScreen = yInterpolarCenterScreen - height * 0.5;
	const xFinishScreen = xInterpolarCenterScreen + width * 0.5;
	const yFinishScreen = yInterpolarCenterScreen + height * 0.5;
	const xStartScreenInMeters = interpolarFromWorldSizeToMeters({ x: xStartScreen });
	const xStartScreenInDegrees = proj4('EPSG:3857', 'EPSG:4326', [xStartScreenInMeters, 0]);
	const xFinishScreenInMeters = interpolarFromWorldSizeToMeters({ x: xFinishScreen });
	const xFinishScreenInDegrees = proj4('EPSG:3857', 'EPSG:4326', [xFinishScreenInMeters, 0]);
	const yStartScreenInMeters = interpolarFromWorldSizeToMeters({ x: yStartScreen });
	const yStartScreenInDegrees = proj4('EPSG:3857', 'EPSG:4326', [0, yStartScreenInMeters]);
	const yFinishScreenInMeters = interpolarFromWorldSizeToMeters({ x: yFinishScreen });
	const yFinishScreenInDegrees = proj4('EPSG:3857', 'EPSG:4326', [0, yFinishScreenInMeters]);
	const lines = [];
	const texts = [];
	const stroke = '#6d5b33';
	const strokeWidth = 3;
	const dash = [4, 2];
	let points = [];
	if (Math.abs(yStartScreenInDegrees[1]) > 85) {
		yStartScreenInDegrees[1] = 85;
	}
	if (yFinishScreenInDegrees[1] > 85) {
		yFinishScreenInDegrees[1] = 85;
	}
	if (Math.abs(xStartScreenInDegrees[0]) > 180) {
		xStartScreenInDegrees[0] = 180;
	}
	if (xFinishScreenInDegrees[0] > 180) {
		xFinishScreenInDegrees[0] = 180;
	}
	let iStart = 0;
	let iEnd = 85;
	if (top < 0 && bottom > worldSize) {
		iStart = 0;
		iEnd = 85;
	}
	else if (top < 0 && yFinishScreen > worldSize / 2) {
		iStart = 0;
		iEnd = 85;
	}
	else if (bottom > worldSize && yStartScreen < worldSize / 2) {
		iStart = 0;
		iEnd = 85;
	}
	else if (yFinishScreen < worldSize / 2) {
		if (yStartScreen < 0) {
			yStartScreenInDegrees[1] = 85;
		}
		iStart = floorb(Math.abs(yFinishScreenInDegrees[1]), 1, graticulesState.latitudesStep);
		iEnd = ceilb(Math.abs(yStartScreenInDegrees[1]), 1, graticulesState.latitudesStep);
	}
	else if (yStartScreen > worldSize / 2) {
		if (yFinishScreen > worldSize) {
			yFinishScreenInDegrees[1] = 85;
		}
		iStart = floorb(Math.abs(yStartScreenInDegrees[1]), 1, graticulesState.latitudesStep);
		iEnd = ceilb(Math.abs(yFinishScreenInDegrees[1]), 1, graticulesState.latitudesStep);
	}
	else {
		const topDegrees = ceilb(Math.abs(yStartScreenInDegrees[1]), 1, graticulesState.latitudesStep);
		const bottomDegrees = ceilb(Math.abs(yFinishScreenInDegrees[1]), 1, graticulesState.latitudesStep);
		iStart = 0;
		if (topDegrees > bottomDegrees) {
			iEnd = topDegrees;
		}
		else {
			iEnd = bottomDegrees;
		}
	}
	for (let i = iStart; i <= iEnd; i += graticulesState.latitudesStep) {
		const convertedCoord = proj4('EPSG:4326', 'EPSG:3857', [0, i]);
		const yConvertedInterpolarCoordToUp = heightInterpolarFromMetersToWorldSize({ x: -convertedCoord[1] });
		const yConvertedInterpolarCoordToDown = heightInterpolarFromMetersToWorldSize({ x: convertedCoord[1] });
		if (yConvertedInterpolarCoordToUp > 0 && yConvertedInterpolarCoordToUp < height) {
			if (left < 0 && right > worldSize) {
				points = [0, 0, worldSize, 0];
			}
			else if (left < 0) {
				points = [0, 0, xFinishScreen, 0];
			}
			else if (right > worldSize) {
				points = [xStartScreen, 0, worldSize, 0];
			}
			else {
				points = [xStartScreen, 0, xFinishScreen, 0];
			}
			lines.push(
				<Line
					key={`latitude:${-i}`}
					x={-left}
					y={yConvertedInterpolarCoordToUp}
					points={points}
					strokeWidth={strokeWidth}
					stroke={stroke}
					dash={dash} />,
			);
			texts.push(
				<Text
					key={`labelLatitude:${-i}`}
					fontSize={14}
					y={yConvertedInterpolarCoordToUp + 5}
					text={`${-i}`} />,
			);
		}
		if (yConvertedInterpolarCoordToDown > 0 && yConvertedInterpolarCoordToDown < height && i > 0) {
			if (left < 0 && right > worldSize) {
				points = [0, 0, worldSize, 0];
			}
			else if (left < 0) {
				points = [0, 0, xFinishScreen, 0];
			}
			else if (right > worldSize) {
				points = [xStartScreen, 0, worldSize, 0];
			}
			else {
				points = [xStartScreen, 0, xFinishScreen, 0];
			}
			lines.push(
				<Line
					key={`latitude:${i}`}
					x={-left}
					y={yConvertedInterpolarCoordToDown}
					points={points}
					strokeWidth={strokeWidth}
					stroke={stroke}
					dash={dash} />,
			);
			texts.push(
				<Text
					key={`labelLatitude:${i}`}
					fontSize={14}
					y={yConvertedInterpolarCoordToDown + 5}
					text={`${i}`} />,
			);
		}
		if (i + graticulesState.latitudesStep > 85 && i !== 85) {
			i = 85 - graticulesState.latitudesStep;
		}
	}
	iStart = 0;
	iEnd = 180;
	if (left < 0 && right > worldSize) {
		iStart = 0;
		iEnd = 180;
	}
	else if (left < 0 && xFinishScreen > worldSize / 2) {
		iStart = 0;
		iEnd = 180;
	}
	else if (right > worldSize && xStartScreen < worldSize / 2) {
		iStart = 0;
		iEnd = 180;
	}
	else if (xFinishScreen < worldSize / 2) {
		if (xStartScreen < 0) {
			xStartScreenInDegrees[0] = 180;
		}
		iStart = floorb(Math.abs(xFinishScreenInDegrees[0]), 1, graticulesState.longitudesStep);
		iEnd = ceilb(Math.abs(xStartScreenInDegrees[0]), 1, graticulesState.longitudesStep);
	}
	else if (xStartScreen > worldSize / 2) {
		if (xFinishScreen > worldSize) {
			xFinishScreenInDegrees[0] = 180;
		}
		iStart = floorb(Math.abs(xStartScreenInDegrees[0]), 1, graticulesState.longitudesStep);
		iEnd = ceilb(Math.abs(xFinishScreenInDegrees[0]), 1, graticulesState.longitudesStep);
	}
	else {
		const leftDegrees = ceilb(Math.abs(xStartScreenInDegrees[0]), 1, graticulesState.longitudesStep);
		const rightDegrees = ceilb(Math.abs(xFinishScreenInDegrees[0]), 1, graticulesState.longitudesStep);
		iStart = 0;
		if (leftDegrees > rightDegrees) {
			iEnd = leftDegrees;
		}
		else {
			iEnd = rightDegrees;
		}
	}
	for (let i = iStart; i <= iEnd; i += graticulesState.longitudesStep) {
		const convertedCoord = proj4('EPSG:4326', 'EPSG:3857', [i, 0]);
		const xConvertedInterpolarCoordToLeft = widthInterpolarFromMetersToWorldSize({ x: -convertedCoord[0] });
		const xConvertedInterpolarCoordToRight = widthInterpolarFromMetersToWorldSize({ x: convertedCoord[0] });
		if (xConvertedInterpolarCoordToLeft > 0 && xConvertedInterpolarCoordToLeft < width) {
			if (top < 0 && bottom > worldSize) {
				points = [0, 0, 0, worldSize];
			}
			else if (top < 0) {
				points = [0, 0, 0, yFinishScreen];
			}
			else if (bottom > worldSize) {
				points = [0, yStartScreen, 0, worldSize];
			}
			else {
				points = [0, yStartScreen, 0, yFinishScreen];
			}
			lines.push(
				<Line
					key={`longitude:${-i}`}
					x={xConvertedInterpolarCoordToLeft}
					y={-top}
					points={points}
					strokeWidth={strokeWidth}
					stroke={stroke}
					dash={dash} />,
			);
		}
		texts.push(
			<Text
				key={`labelLongitude:${-i}`}
				fontSize={14}
				rotation={90}
				x={xConvertedInterpolarCoordToLeft - 5}
				text={`${-i}`} />,
		);
		if (xConvertedInterpolarCoordToRight > 0 && xConvertedInterpolarCoordToRight < width && i > 0) {
			if (top < 0 && bottom > worldSize) {
				points = [0, 0, 0, worldSize];
			}
			else if (top < 0) {
				points = [0, 0, 0, yFinishScreen];
			}
			else if (bottom > worldSize) {
				points = [0, yStartScreen, 0, worldSize];
			}
			else {
				points = [0, yStartScreen, 0, yFinishScreen];
			}
			lines.push(
				<Line
					key={`longitude:${i}`}
					x={xConvertedInterpolarCoordToRight}
					y={-top}
					points={points}
					strokeWidth={strokeWidth}
					stroke={stroke}
					dash={dash} />,
			);
			texts.push(
				<Text key={`labelLongitude:${i}`}
					fontSize={14}
					rotation={90}
					x={xConvertedInterpolarCoordToRight - 5}
					text={`${i}`} />,
			);
		}
		if (i + graticulesState.longitudesStep > 180 && i !== 180) {
			i = 180 - graticulesState.longitudesStep;
		}
	}
	return (
		<Stage x={0} y={0} width={width} height={height}>
			<Layer>
				{texts}
			</Layer>
			<Layer>
				{lines}
			</Layer>
		</Stage>
	);
}
