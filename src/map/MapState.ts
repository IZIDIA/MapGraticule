class MapStateClass {
	/** 0 to 1 */
	readonly centerX: number = 0.5;
	/** 0 to 1 */
	readonly centerY: number = 0.5;
	readonly mapZoom: number = 9;
}

export type MapState = Readonly<MapStateClass>;
export const defaultMapState: MapState = new MapStateClass();
