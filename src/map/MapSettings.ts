class MapSettingsClass {
	minZoom: number = 6;
	maxZoom: number = 30;
	zoomSpeed: number = 0.01;
	debug: boolean = false;
}

export type MapSettings = Readonly<MapSettingsClass>;
export const defaultMapSettings: MapSettings = new MapSettingsClass();
