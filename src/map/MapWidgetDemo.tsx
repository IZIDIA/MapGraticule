import { useState } from 'react';
import { Labelled } from '../common/Labelled';
import { NumberInput } from '../common/NumberInput';
import { defaultGraticuleState, GraticuleState } from '../layers/GraticuleState';
import { defaultMapSettings, MapSettings } from './MapSettings';
import { defaultMapState, MapState } from './MapState';
import { MapWidget } from './MapWidget';
import './MapWidgetDemo.css';

export function MapWidgetDemo() {
	const [maxWidth, setMaxWidth] = useState<number>(2000);
	const [maxHeight, setMaxHeight] = useState<number>(1000);
	const [mapState, setMapState] = useState<MapState>(defaultMapState);
	const [mapSettings, setMapSettings] = useState<MapSettings>(defaultMapSettings);
	const [graticulesState, setGraticuleState] = useState<GraticuleState>(defaultGraticuleState);
	const centerStep = 10 * Math.pow(0.5, mapState.mapZoom);
	return (
		<div className="MapWidgetDemo">
			<div className="MapWidgetDemo-state">
				<Labelled label="max width">
					<NumberInput
						min={0}
						max={10000}
						step={1}
						value={maxWidth}
						onChange={setMaxWidth}
					></NumberInput>
				</Labelled>
				<Labelled label="max height">
					<NumberInput
						min={0}
						max={10000}
						step={1}
						value={maxHeight}
						onChange={setMaxHeight}
					></NumberInput>
				</Labelled>
				<Labelled label="centerX">
					<NumberInput
						min={-10}
						max={10}
						step={centerStep}
						value={mapState.centerX}
						onChange={value => setMapState({ ...mapState, centerX: value })}
					></NumberInput>
				</Labelled>
				<Labelled label="centerY">
					<NumberInput
						min={-10}
						max={10}
						step={centerStep}
						value={mapState.centerY}
						onChange={value => setMapState({ ...mapState, centerY: value })}
					></NumberInput>
				</Labelled>
				<Labelled label="zoom">
					<NumberInput
						min={mapSettings.minZoom}
						max={mapSettings.maxZoom}
						step={0.5}
						value={mapState.mapZoom}
						onChange={value => setMapState({ ...mapState, mapZoom: value })}
					></NumberInput>
				</Labelled>
				<Labelled label="longitude step">
					<NumberInput
						min={graticulesState.minStep}
						max={graticulesState.maxStep}
						step={1}
						value={graticulesState.longitudesStep}
						onChange={value => setGraticuleState({ ...graticulesState, longitudesStep: value })}
					></NumberInput>
				</Labelled>
				<Labelled label="latitude step">
					<NumberInput
						min={graticulesState.minStep}
						max={graticulesState.maxStep}
						step={1}
						value={graticulesState.latitudesStep}
						onChange={value => setGraticuleState({ ...graticulesState, latitudesStep: value })}
					></NumberInput>
				</Labelled>
				<Labelled label="graticule">
					<input
						type="checkbox"
						checked={graticulesState.show}
						onChange={event => setGraticuleState({ ...graticulesState, show: event.target.checked })}
					></input>
				</Labelled>
				<Labelled label="auto step">
					<input
						type="checkbox"
						checked={graticulesState.autoStep}
						onChange={event => setGraticuleState({ ...graticulesState, autoStep: event.target.checked })}
					></input>
				</Labelled>
				<Labelled label="debug">
					<input
						type="checkbox"
						checked={mapSettings.debug}
						onChange={event => setMapSettings({ ...mapSettings, debug: event.target.checked })}
					></input>
				</Labelled>
			</div>
			<MapWidget
				mapState={mapState}
				onMapStateChange={setMapState}
				onGraticuleStateChange={setGraticuleState}
				mapSettings={mapSettings}
				style={{
					maxWidth,
					maxHeight,
				}}
				graticuleState={graticulesState}
			></MapWidget>
		</div>
	);
}
