type GetUrl = (x: number, y: number, z: number) => string;

class TileLayerSettingsClass {
	readonly getTileUrl: GetUrl = (x, y, z) => `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
	readonly tileSize: number = 256;
	readonly maxZoom: number = 19;
}

export type TileLayerSettings = Readonly<TileLayerSettingsClass>;
export const defaultTileLayerSettings: TileLayerSettings = new TileLayerSettingsClass();
