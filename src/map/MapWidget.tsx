import useResizeObserver from '@react-hook/resize-observer';
import { useGesture } from '@use-gesture/react';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { CommonProps } from '../common/CommonProps';
import { GraticuleLayer } from '../layers/GraticuleLayer';
import { defaultGraticuleState, GraticuleState } from '../layers/GraticuleState';
import { DebugOverlay } from './DebugOverlay';
import { MapContext } from './MapContext';
import { defaultMapSettings, MapSettings } from './MapSettings';
import { defaultMapState, MapState } from './MapState';
import './MapWidget.css';
import { TileLayer } from './TileLayer';
import { defaultTileLayerSettings, TileLayerSettings } from './TileLayerSettings';

export function MapWidget(props: Partial<Readonly<{
	mapSettings: MapSettings;
	mapState: MapState;
	graticuleState: GraticuleState;
	onMapStateChange: (mapState: Readonly<MapState>) => void;
	onGraticuleStateChange: (mapState: Readonly<GraticuleState>) => void;
	tileLayerSettings: Readonly<TileLayerSettings>;
}>> & CommonProps) {
	const [internalMapState, setInternalMapState] = useState<Readonly<MapState>>(() => {
		return props.mapState ?? defaultMapState;
	});
	const [internalGraticuleState, setGraticuleState] = useState<Readonly<GraticuleState>>(() => {
		return props.graticuleState ?? defaultGraticuleState;
	});
	const mapState = props.mapState ?? internalMapState;
	const graticuleState = props.graticuleState ?? internalGraticuleState;
	const onMapStateChange = props.onMapStateChange;
	const onGraticuleStateChange = props.onGraticuleStateChange;
	useEffect(() => {
		if (onMapStateChange) {
			onMapStateChange(internalMapState);
		}
	}, [internalMapState, onMapStateChange]);
	useEffect(() => {
		if (onGraticuleStateChange) {
			onGraticuleStateChange(internalGraticuleState);
		}
	}, [internalGraticuleState, onGraticuleStateChange]);
	const mapSettings = props.mapSettings ?? defaultMapSettings;
	const tileLayerSettings = props.tileLayerSettings ?? defaultTileLayerSettings;
	const { minZoom, maxZoom, zoomSpeed } = mapSettings;
	const mapZoom = Math.max(minZoom, Math.min(mapState.mapZoom, maxZoom));
	const zoom = mapZoom - Math.log2(tileLayerSettings.tileSize);
	const roundedZoom = Math.max(0, Math.min(maxZoom, Math.round(zoom)));
	const worldSize = Math.pow(2, mapZoom);
	const [dragStartState, setDragStartState] = useState(mapState);
	const bindGesture = useGesture({
		onDrag: event => {
			const offset = event.movement;
			if (event.first) {
				setDragStartState(mapState);
				return;
			}
			setInternalMapState({
				...internalMapState,
				centerX: dragStartState.centerX - offset[0] / worldSize,
				centerY: dragStartState.centerY - offset[1] / worldSize,
			});
		},
		onWheel: event => {
			setInternalMapState({
				...internalMapState,
				mapZoom: mapZoom - event.delta[1] * zoomSpeed,
			});
			if (graticuleState.autoStep && graticuleState.show) {
				setGraticuleState({
					...internalGraticuleState,
					latitudesStep: internalGraticuleState.latitudesStepStandart / 2 ** roundedZoom,
					longitudesStep: internalGraticuleState.longitudesStepStandart / 2 ** roundedZoom,
				});
			}
		},
	});
	const [mapContext, setMapContext] = useState<MapContext>(() => {
		return {
			width: 0,
			height: 0,
		};
	});
	const mainElement = useRef<HTMLDivElement | null>(null);
	useResizeObserver(mainElement, entry => {
		setMapContext({
			...mapContext,
			width: entry.contentRect.width,
			height: entry.contentRect.height,
		});
	});
	return <div
		{...bindGesture()}
		ref={mainElement}
		className={classNames('MapWidget', props.className)}
		style={{
			...props.style,
		}}
	>
		<TileLayer
			mapContext={mapContext}
			mapSettings={mapSettings}
			mapState={mapState}
			tileLayerSettings={tileLayerSettings}
		></TileLayer>
		{graticuleState?.show &&
			<GraticuleLayer
				mapContext={mapContext}
				mapSettings={mapSettings}
				mapState={mapState}
				tileLayerSettings={tileLayerSettings}
				graticulesState={graticuleState}
			></GraticuleLayer>
		}
		{mapSettings.debug &&
			<DebugOverlay style={{ left: 0, top: 0, minWidth: 300 }}>
				{JSON.stringify({
					mapSettings,
					mapContext,
					mapState,
					internalMapState,
					mapZoom,
					internalGraticuleState,
					graticuleState,
				}, null, 2)}
			</DebugOverlay>
		}
	</div>;
}

