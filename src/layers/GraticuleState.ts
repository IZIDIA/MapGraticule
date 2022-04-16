class GraticuleStateClass {
	readonly longitudesStepStandart: number = 120;
	readonly latitudesStepStandart: number = 120;
	readonly longitudesStep: number = 120;
	readonly latitudesStep: number = 120;
	readonly minStep: number = 0.001;
	readonly maxStep: number = 180;
	readonly show: boolean = true;
	readonly autoStep: boolean = true;
}

export type GraticuleState = Readonly<GraticuleStateClass>;
export const defaultGraticuleState: GraticuleState = new GraticuleStateClass();
